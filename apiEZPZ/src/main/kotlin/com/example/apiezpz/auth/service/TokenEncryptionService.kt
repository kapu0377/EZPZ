package com.example.apiezpz.auth.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.security.SecureRandom
import java.util.*
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

@Service
class TokenEncryptionService(
    @Value("\${app.token.encryption.key:default-secret-key-must-be-32-chars-long}")
    private val encryptionKey: String
) {
    private val log = LoggerFactory.getLogger(TokenEncryptionService::class.java)
    
    companion object {
        private const val ALGORITHM = "AES"
        private const val TRANSFORMATION = "AES/GCM/NoPadding"
        private const val GCM_IV_LENGTH = 12
        private const val GCM_TAG_LENGTH = 16
    }

    private val secretKey: SecretKey by lazy {
        // 32바이트 키 보장
        val keyBytes = if (encryptionKey.length >= 32) {
            encryptionKey.take(32).toByteArray()
        } else {
            encryptionKey.padEnd(32, '0').toByteArray()
        }
        SecretKeySpec(keyBytes, ALGORITHM)
    }

    /**
     * 토큰을 AES-GCM으로 암호화
     */
    fun encryptToken(token: String): String {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        
        val iv = ByteArray(GCM_IV_LENGTH)
        SecureRandom().nextBytes(iv)
        val parameterSpec = GCMParameterSpec(GCM_TAG_LENGTH * 8, iv)
        
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec)
        val encryptedData = cipher.doFinal(token.toByteArray())
        
        val combined = iv + encryptedData
        return Base64.getEncoder().encodeToString(combined)
    }

    /**
     * 암호화된 토큰을 복호화
     */
    fun decryptToken(encryptedToken: String): String {
        val combined = Base64.getDecoder().decode(encryptedToken)
        
        val iv = combined.sliceArray(0 until GCM_IV_LENGTH)
        val encryptedData = combined.sliceArray(GCM_IV_LENGTH until combined.size)
        
        val cipher = Cipher.getInstance(TRANSFORMATION)
        val parameterSpec = GCMParameterSpec(GCM_TAG_LENGTH * 8, iv)
        
        cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec)
        val decryptedData = cipher.doFinal(encryptedData)
        
        return String(decryptedData)
    }

    /**
     * 토큰이 암호화된 형태인지 확인
     */
    fun isEncrypted(token: String): Boolean {
        return try {
            // JWT 토큰은 점(.)으로 구분되므로, Base64만으로 구성된 경우 암호화된 것으로 판단
            !token.contains('.') && Base64.getDecoder().decode(token).size > GCM_IV_LENGTH + GCM_TAG_LENGTH
        } catch (e: Exception) {
            false
        }
    }

    /**
     * 토큰 무결성 검증 (추가 보안)
     */
    fun verifyTokenIntegrity(token: String): Boolean {
        return try {
            if (isEncrypted(token)) {
                val decrypted = decryptToken(token)
                // JWT 기본 구조 확인
                decrypted.split('.').size == 3
            } else {
                // 암호화되지 않은 JWT 토큰 구조 확인
                token.split('.').size == 3
            }
        } catch (e: Exception) {
            log.warn("토큰 무결성 검증 실패", e)
            false
        }
    }
} 