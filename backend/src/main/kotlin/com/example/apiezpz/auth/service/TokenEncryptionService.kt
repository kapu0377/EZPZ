package com.example.apiezpz.auth.service

import org.bouncycastle.asn1.x500.X500Name
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter
import org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder
import org.bouncycastle.jce.provider.BouncyCastleProvider
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.math.BigInteger
import java.security.*
import java.security.cert.X509Certificate
import java.security.interfaces.RSAPublicKey
import java.security.spec.MGF1ParameterSpec
import java.security.spec.RSAKeyGenParameterSpec
import java.time.Instant
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import javax.annotation.PostConstruct
import javax.crypto.Cipher
import javax.crypto.spec.OAEPParameterSpec
import javax.crypto.spec.PSource

@Service
class TokenEncryptionService(
    @Value("\${app.token.rsa.key.size:3072}")
    private val keySize: Int,
    @Value("\${app.token.rsa.keystore.path:./keystore/ezpz-token-keys.p12}")
    private val keystorePath: String,
    @Value("\${app.token.rsa.keystore.password:default-keystore-password}")
    private val keystorePassword: String,
    @Value("\${app.token.rsa.key.alias:ezpz-current-key}")
    private val keyAlias: String,
    @Value("\${app.token.rsa.key.rotation.days:90}")
    private val keyRotationDays: Long,
    @Value("\${app.token.rsa.key.archive.retention.days:730}")
    private val archiveRetentionDays: Long
) {
    private val log = LoggerFactory.getLogger(TokenEncryptionService::class.java)
    companion object {
        init {
            Security.addProvider(BouncyCastleProvider())
        }

        private const val RSA_ALGORITHM = "RSA"
        private const val CERT_SIGNATURE_ALGORITHM = "SHA256withRSA" // 証明書用
        private const val TOKEN_SIGNATURE_ALGORITHM = "SHA256withRSA"
        private const val HASH_ALGORITHM = "SHA-256"
        private const val MGF_ALGORITHM = "MGF1"
        private const val MIN_KEY_SIZE = 2048
        private const val RECOMMENDED_KEY_SIZE = 3072
        private const val KEYSTORE_TYPE = "PKCS12"
        private const val CERT_VALIDITY_YEARS = 10L
    }
    private lateinit var currentKeyPair: KeyPair
    private lateinit var currentKeyId: String
    private lateinit var keyCreationTime: Instant
    private val secureRandom = SecureRandom.getInstanceStrong()
    private val keyCache = ConcurrentHashMap<String, KeyPair>()

    @PostConstruct
    fun initialize() {
        validateConfiguration()
        ensureKeystoreDirectory()
        currentKeyPair = loadOrGenerateKeyPair()
        val currentKeyBitLength = (currentKeyPair.public as? RSAPublicKey)?.modulus?.bitLength() ?: "N/A"
        log.info("RSAトークン暗号化サービスの初期化が完了しました - 現在のキーID: $currentKeyId, キーサイズ: ${currentKeyBitLength}ビット")
    }

    @Scheduled(fixedDelay = 3600000, initialDelay = 60000) 
    fun scheduledKeyRotationCheck() {
        try {
            checkKeyRotation()
        } catch (e: Exception) {
            log.error("スケジュールされたキーローテーションチェック中にエラーが発生しました", e)
        }
    }
    @Scheduled(cron = "0 0 2 * * ?") // 毎日午前2時に実行
    fun scheduledOldKeyCleanup() {
        try {
            cleanupOldArchivedKeys()
        } catch (e: Exception) {
            log.error("スケジュールされた古いキーのクリーンアップ中にエラーが発生しました", e)
        }
    }

    private fun validateConfiguration() {
        if (keySize < MIN_KEY_SIZE) throw IllegalArgumentException("RSAキーサイズは最低${MIN_KEY_SIZE}ビットである必要があります。")
        if (keySize < RECOMMENDED_KEY_SIZE) log.warn("推奨されるRSAキーサイズは${RECOMMENDED_KEY_SIZE}ビット以上です。")
        if (keystorePassword == "default-keystore-password" || keystorePassword.isBlank()) {
            log.error("致命的なセキュリティ警告: キーストアのデフォルトパスワードを使用しています。直ちにapplication.propertiesで変更してください。")
            throw IllegalArgumentException("キーストアのパスワードが安全に設定されていません。")
        }
    }

    private fun ensureKeystoreDirectory() {
        val keystoreFile = File(keystorePath)
        keystoreFile.parentFile?.takeIf { !it.exists() }?.let {
            log.info("キーストアディレクトリを作成します: ${it.absolutePath}")
            it.mkdirs()
        }
    }

    private fun loadOrGenerateKeyPair(): KeyPair {
        val keystoreFile = File(keystorePath)
        return if (keystoreFile.exists()) {
            try {
                loadKeysFromKeyStore()
            } catch (e: Exception) {
                log.error("キーストアからのキーの読み込みに失敗しました。新しいキーを生成します。エラー: ${e.message}", e)
                generateAndStoreNewKey()
            }
        } else {
            log.info("キーストアファイル(${keystorePath})が見つかりません。新しいキーストアを作成します。")
            generateAndStoreNewKey()
        }
    }

    private fun loadKeysFromKeyStore(): KeyPair {
        val keystore = KeyStore.getInstance(KEYSTORE_TYPE)
        FileInputStream(keystorePath).use { fis ->
            keystore.load(fis, keystorePassword.toCharArray())
        }
        log.info("キーストアの読み込みに成功しました: $keystorePath")

        keyCache.clear()
        keystore.aliases().asSequence().forEach { alias ->
            try {
                val privateKey = keystore.getKey(alias, keystorePassword.toCharArray()) as PrivateKey
                val certificate = keystore.getCertificate(alias) as X509Certificate
                val keyId = extractKeyIdFromCertificate(certificate)
                keyCache[keyId] = KeyPair(certificate.publicKey, privateKey)
                log.info("キーをキャッシュしました - ID: $keyId (エイリアス: $alias)")
            } catch (e: Exception) {
                log.warn("キーストアからエイリアス '$alias' の読み込みに失敗しました", e)
            }
        }
        log.info("合計 ${keyCache.size}個のキーがキャッシュに読み込まれました。")

        if (!keystore.containsAlias(keyAlias)) {
            log.warn("現在のキーエイリアス '$keyAlias' がキーストアに見つかりません。新しいキーを生成します。")
            return generateAndStoreNewKey()
        }
        val currentCertificate = keystore.getCertificate(keyAlias) as X509Certificate
        currentKeyId = extractKeyIdFromCertificate(currentCertificate)
        keyCreationTime = currentCertificate.notBefore.toInstant()

        return keyCache[currentKeyId] ?: throw IllegalStateException("現在のキー '$currentKeyId' がキャッシュに見つかりません。")
    }
    
    private fun generateAndStoreNewKey(): KeyPair {
        log.info("${keySize}ビットのRSAキーペアの生成を開始します...")
        val keyPair = generateSecureKeyPair()
        log.info("キーペアの生成が完了しました。自己署名証明書の生成を開始します...")
        val certificate = generateSelfSignedCertificate(keyPair)
        log.info("証明書の生成が完了しました。キーストアへの保存を開始します...")
        saveKeyToKeyStore(keyPair, certificate, keyAlias)
        currentKeyId = extractKeyIdFromCertificate(certificate)
        keyCreationTime = certificate.notBefore.toInstant()
        keyCache[currentKeyId] = keyPair
        log.info("新しいキーの生成と保存が完了しました - キーID: $currentKeyId")
        return keyPair
    }

    private fun saveKeyToKeyStore(keyPair: KeyPair, certificate: X509Certificate, alias: String) {
        val keystoreFile = File(keystorePath)
        val keystore = KeyStore.getInstance(KEYSTORE_TYPE)

        if (keystoreFile.exists()) {
            FileInputStream(keystoreFile).use { fis -> keystore.load(fis, keystorePassword.toCharArray()) }
        } else {
            keystore.load(null, null)
        }

        if (keystore.containsAlias(alias)) {
            archiveCurrentKey(keystore, alias)
        }
        
        keystore.setKeyEntry(alias, keyPair.private, keystorePassword.toCharArray(), arrayOf(certificate))
        log.info("キーの保存が完了しました - エイリアス: $alias, キーID: ${extractKeyIdFromCertificate(certificate)}")

        FileOutputStream(keystoreFile).use { fos -> keystore.store(fos, keystorePassword.toCharArray()) }
    }

    private fun archiveCurrentKey(keystore: KeyStore, alias: String) {
        try {
            val oldCertificate = keystore.getCertificate(alias) as X509Certificate
            val oldKeyId = extractKeyIdFromCertificate(oldCertificate)
            val archiveAlias = "archived-$oldKeyId-${System.currentTimeMillis()}"

            val key = keystore.getKey(alias, keystorePassword.toCharArray())
            val chain = keystore.getCertificateChain(alias)
            keystore.setKeyEntry(archiveAlias, key, keystorePassword.toCharArray(), chain)
            keystore.deleteEntry(alias)
            log.info("現在のキーをアーカイブしました: エイリアス '$alias' -> '$archiveAlias'")
        } catch (e: Exception) {
            log.error("現在のキーのアーカイブに失敗しました", e)
        }
    }
    
    @Synchronized
    private fun rotateKey() {
        log.info("キーローテーションを開始します...")
        val newKeyPair = generateSecureKeyPair()
        val newCertificate = generateSelfSignedCertificate(newKeyPair)
        saveKeyToKeyStore(newKeyPair, newCertificate, keyAlias)
        currentKeyPair = newKeyPair
        currentKeyId = extractKeyIdFromCertificate(newCertificate)
        keyCreationTime = newCertificate.notBefore.toInstant()
        keyCache[currentKeyId] = newKeyPair
        log.info("キーローテーションに成功しました。新しい現在のキーID: $currentKeyId")
    }

    @Synchronized
    private fun checkKeyRotation() {
        val keyAge = Instant.now().epochSecond - keyCreationTime.epochSecond
        val rotationThreshold = keyRotationDays * 24 * 60 * 60

        if (keyAge > rotationThreshold) {
            log.info("キーの有効期限が迫っています (作成後 ${keyAge / 3600 / 24}日経過)。キーをローテーションします。")
            rotateKey()
        } else {
            val remainingDays = (rotationThreshold - keyAge) / (24 * 60 * 60)
            log.info("キーローテーションまで残り${remainingDays}日です。")
        }
    }

    private fun generateSecureKeyPair(): KeyPair {
        val keyPairGenerator = KeyPairGenerator.getInstance(RSA_ALGORITHM)
        keyPairGenerator.initialize(RSAKeyGenParameterSpec(keySize, RSAKeyGenParameterSpec.F4), secureRandom)
        return keyPairGenerator.generateKeyPair()
    }

    private fun generateSelfSignedCertificate(keyPair: KeyPair): X509Certificate {
        val now = Instant.now()
        val notBefore = Date.from(now)
        val notAfter = Date.from(now.plusSeconds(CERT_VALIDITY_YEARS * 365 * 24 * 60 * 60))
        
        val serialNumber = BigInteger(160, secureRandom)
        val owner = X500Name("CN=EZPZ Token Key, O=EZPZ, C=KR")

        try {
            val contentSigner = JcaContentSignerBuilder(CERT_SIGNATURE_ALGORITHM).build(keyPair.private)
            val certBuilder = JcaX509v3CertificateBuilder(
                owner, // Issuer
                serialNumber, // Serial Number
                notBefore, // Start Date
                notAfter, // End Date
                owner, // Subject
                keyPair.public // Public Key
            )

            return JcaX509CertificateConverter().getCertificate(certBuilder.build(contentSigner))
        } catch (e: Exception) {
            throw SecurityException("自己署名証明書の生成に失敗しました", e)
        }
    }

    private fun extractKeyIdFromCertificate(certificate: X509Certificate): String {
        return certificate.serialNumber.toString(16)
    }

    fun encryptToken(token: String): String {
        return try {
            val paddedToken = createPaddedToken(token, Instant.now().epochSecond, secureRandom)
            val paddedTokenBytes = paddedToken.toByteArray(Charsets.UTF_8)
            val maxSize = getMaxPlaintextSize(currentKeyPair.public)
            
            if (paddedTokenBytes.size > maxSize) {
                throw IllegalArgumentException("パディング後のトークンサイズ(${paddedTokenBytes.size}バイト)が最大許容サイズ(${maxSize}バイト)を超過します。")
            }
            
            val oaepParams = OAEPParameterSpec(HASH_ALGORITHM, MGF_ALGORITHM, MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT)
            val cipher = Cipher.getInstance(RSA_ALGORITHM)
            cipher.init(Cipher.ENCRYPT_MODE, currentKeyPair.public, oaepParams)
            val encryptedData = cipher.doFinal(paddedTokenBytes)
            
            val signature = signData(encryptedData, currentKeyPair.private)
            
            val keyIdBytes = currentKeyId.toByteArray(Charsets.UTF_8)
            val keyIdLength = keyIdBytes.size.toByte()
            val result = byteArrayOf(keyIdLength) + keyIdBytes + encryptedData + signature
            
            Base64.getEncoder().encodeToString(result)
        } catch (e: Exception) {
            log.error("トークンの暗号化に失敗しました: ${e.message}", e)
            throw SecurityException("トークンの暗号化に失敗しました", e)
        }
    }

    fun decryptToken(encryptedToken: String): String {
        return try {
            val combined = Base64.getDecoder().decode(encryptedToken)
            
            val keyIdLength = combined[0].toInt()
            if (keyIdLength <= 0 || keyIdLength > 127) throw SecurityException("無効なキーID長です。")
            
            val keyId = String(combined, 1, keyIdLength, Charsets.UTF_8)
            val keyPair = keyCache[keyId] ?: throw SecurityException("無効なトークンです。指定されたキーIDが見つかりません。")
            
            val publicKey = keyPair.public as RSAPublicKey
            val privateKey = keyPair.private
            val keyBitLength = publicKey.modulus.bitLength()
            
            val payloadOffset = 1 + keyIdLength
            val remaining = combined.sliceArray(payloadOffset until combined.size)
            
            val encryptedSize = keyBitLength / 8
            if (remaining.size < encryptedSize) throw SecurityException("トークンの構造が無効です。")
            
            val encryptedData = remaining.sliceArray(0 until encryptedSize)
            val signature = remaining.sliceArray(encryptedSize until remaining.size)
            
            if (!verifySignature(encryptedData, signature, publicKey)) {
                throw SecurityException("トークンの整合性検証に失敗しました (署名の不一致)。")
            }        
            val oaepParams = OAEPParameterSpec(HASH_ALGORITHM, MGF_ALGORITHM, MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT)
            val cipher = Cipher.getInstance(RSA_ALGORITHM)
            cipher.init(Cipher.DECRYPT_MODE, privateKey, oaepParams)
            val decryptedData = cipher.doFinal(encryptedData)
            val paddedToken = String(decryptedData, Charsets.UTF_8)
            extractAndValidateToken(paddedToken)
        } catch (e: Exception) {
            log.error("トークンの復号に失敗しました: ${e.message}", e)
            throw SecurityException("トークンの復号に失敗しました", e)
        }
    }
    private fun createPaddedToken(token: String, timestamp: Long, random: SecureRandom): String {
        val nonce = ByteArray(16)
        random.nextBytes(nonce)
        val nonceHex = nonce.joinToString("") { "%02x".format(it) }
        return "${timestamp}:${nonceHex}:${token}"
    }
    private fun extractAndValidateToken(paddedToken: String): String {
        val parts = paddedToken.split(":", limit = 3)
        if (parts.size != 3) throw IllegalArgumentException("トークンの形式が無効です。")
        
        val timestamp = parts[0].toLongOrNull() ?: throw IllegalArgumentException("タイムスタンプが無効です。")
        
        val timeDiff = Instant.now().epochSecond - timestamp
        if (timeDiff > 86400 || timeDiff < -600) throw SecurityException("トークンが期限切れか、時間差が大きすぎます。")
        
        return parts[2]
    }

    private fun signData(data: ByteArray, privateKey: PrivateKey): ByteArray {
        val signature = Signature.getInstance(TOKEN_SIGNATURE_ALGORITHM)
        signature.initSign(privateKey)
        signature.update(data)
        return signature.sign()
    }

    private fun verifySignature(data: ByteArray, signatureToVerify: ByteArray, publicKey: PublicKey): Boolean {
        return try {
            val verifier = Signature.getInstance(TOKEN_SIGNATURE_ALGORITHM)
            verifier.initVerify(publicKey)
            verifier.update(data)
            verifier.verify(signatureToVerify)
        } catch (e: Exception) {
            log.warn("署名検証中にエラーが発生しました: ${e.message}")
            false
        }
    }

    private fun getMaxPlaintextSize(publicKey: PublicKey): Int {
        val keyBitLength = (publicKey as? RSAPublicKey)?.modulus?.bitLength()
            ?: throw IllegalArgumentException("公開キーはRSAキーである必要があります。")
        val keyByteLength = keyBitLength / 8
        
        val hash = MessageDigest.getInstance(HASH_ALGORITHM)
        val hashLength = hash.digestLength
        
        // RSA/OAEPの最大平文長 = キー長(バイト) - 2 * ハッシュ長(バイト) - 2
        val maxPlaintextSize = keyByteLength - 2 * hashLength - 2
        
        if (maxPlaintextSize <= 0) {
            throw IllegalStateException("キーサイズが小さすぎて、現在のOAEPパディング設定ではデータを暗号化できません。 Key size: $keyBitLength, Hash: $HASH_ALGORITHM")
        }
        return maxPlaintextSize
    }

    @Synchronized
    private fun cleanupOldArchivedKeys() {
        log.info("古いアーカイブ済みキーのクリーンアップを開始します...")
        val keystoreFile = File(keystorePath)
        if (!keystoreFile.exists()) {
            log.info("キーストアファイルが存在しないため、キークリーンアップをスキップします。")
            return
        }

        try {
            val keystore = KeyStore.getInstance(KEYSTORE_TYPE)
            FileInputStream(keystoreFile).use { fis -> keystore.load(fis, keystorePassword.toCharArray()) }

            val retentionLimit = Instant.now().minusSeconds(archiveRetentionDays * 24 * 60 * 60)
            val aliasesToRemove = mutableListOf<String>()

            keystore.aliases().asSequence().forEach { alias ->
                if (alias.startsWith("archived-")) {
                    try {
                        val certificate = keystore.getCertificate(alias) as X509Certificate
                        val creationDate = certificate.notBefore.toInstant()
                        if (creationDate.isBefore(retentionLimit)) {
                            aliasesToRemove.add(alias)
                        }
                    } catch (e: Exception) {
                        log.warn("アーカイブ済みキー '$alias' の有効期限の確認中にエラーが発生しました", e)
                    }
                }
            }

            if (aliasesToRemove.isNotEmpty()) {
                aliasesToRemove.forEach { alias ->
                    try {
                        keystore.deleteEntry(alias)
                        log.info("保持期間が過ぎたアーカイブ済みキーを削除しました: $alias")
                    } catch (e: KeyStoreException) {
                        log.error("アーカイブ済みキー '$alias' の削除に失敗しました", e)
                    }
                }
                FileOutputStream(keystoreFile).use { fos -> keystore.store(fos, keystorePassword.toCharArray()) }
            } else {
                log.info("削除対象の古いアーカイブ済みキーはありません。")
            }
        } catch (e: Exception) {
            log.error("古いアーカイブ済みキーのクリーンアップ中にエラーが発生しました", e)
        }
    }
} 