package com.example.apiezpz.auth.service

import com.example.apiezpz.auth.entity.User
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Service
import java.util.concurrent.TimeUnit

@Service
class RedisCacheService(
    private val redisTemplate: RedisTemplate<String, Any>,
    private val objectMapper: ObjectMapper,
    private val tokenEncryptionService: TokenEncryptionService
) {
    private val log = LoggerFactory.getLogger(RedisCacheService::class.java)
    
    companion object {
        private const val REFRESH_TOKEN_PREFIX = "refresh_token:"
        private const val ACCESS_TOKEN_PREFIX = "access_token:"
        private const val USER_CACHE_PREFIX = "user:"
        private const val BLACKLIST_TOKEN_PREFIX = "blacklist_token:"
    }

    fun cacheRefreshToken(username: String, refreshToken: String, expirationMinutes: Long) {
        try {
            val key = REFRESH_TOKEN_PREFIX + username
            val encryptedToken = tokenEncryptionService.encryptToken(refreshToken)
            redisTemplate.opsForValue().set(key, encryptedToken, expirationMinutes, TimeUnit.MINUTES)
        } catch (e: Exception) {
            log.error("RefreshToken 캐시 저장 실패: username={}", username, e)
        }
    }

    fun getCachedRefreshToken(username: String): String? {
        return try {
            val key = REFRESH_TOKEN_PREFIX + username
            val cachedToken = redisTemplate.opsForValue().get(key)
            
            if (cachedToken != null) {
                val tokenString = cachedToken.toString()
                tokenEncryptionService.decryptToken(tokenString)
            } else {
                null
            }
        } catch (e: Exception) {
            log.error("RefreshToken 캐시 조회 실패: username={}", username, e)
            null
        }
    }

    fun removeRefreshTokenCache(username: String) {
        try {
            val key = REFRESH_TOKEN_PREFIX + username
            redisTemplate.delete(key)
        } catch (e: Exception) {
            log.error("RefreshToken 캐시 삭제 실패: username={}", username, e)
        }
    }

    fun updateRefreshTokenExpiration(username: String, expirationMinutes: Long) {
        try {
            val key = REFRESH_TOKEN_PREFIX + username
            redisTemplate.expire(key, expirationMinutes, TimeUnit.MINUTES)
        } catch (e: Exception) {
            log.error("RefreshToken 캐시 만료시간 업데이트 실패: username={}", username, e)
        }
    }

    fun cacheAccessToken(username: String, accessToken: String, expirationMinutes: Long) {
        try {
            val key = ACCESS_TOKEN_PREFIX + username
            val encryptedToken = tokenEncryptionService.encryptToken(accessToken)
            redisTemplate.opsForValue().set(key, encryptedToken, expirationMinutes, TimeUnit.MINUTES)
        } catch (e: Exception) {
            log.error("AccessToken 캐시 저장 실패: username={}", username, e)
        }
    }

    fun getCachedAccessToken(username: String): String? {
        return try {
            val key = ACCESS_TOKEN_PREFIX + username
            val cachedToken = redisTemplate.opsForValue().get(key)
            
            if (cachedToken != null) {
                val tokenString = cachedToken.toString()
                tokenEncryptionService.decryptToken(tokenString)
            } else {
                null
            }
        } catch (e: Exception) {
            log.error("AccessToken 캐시 조회 실패: username={}", username, e)
            null
        }
    }

    fun removeAccessTokenCache(username: String) {
        try {
            val key = ACCESS_TOKEN_PREFIX + username
            redisTemplate.delete(key)
        } catch (e: Exception) {
            log.error("AccessToken 캐시 삭제 실패: username={}", username, e)
        }
    }

    fun cacheUser(username: String, user: User) {
        try {
            val key = USER_CACHE_PREFIX + username
            redisTemplate.opsForValue().set(key, user, 30, TimeUnit.MINUTES)
        } catch (e: Exception) {
            log.error("사용자 정보 캐시 저장 실패: username={}", username, e)
        }
    }

    fun getCachedUser(username: String): User? {
        return try {
            val key = USER_CACHE_PREFIX + username
            val cachedUser = redisTemplate.opsForValue().get(key)
            
            when {
                cachedUser == null -> null
                cachedUser is User -> cachedUser
                else -> {
                    try {
                        objectMapper.convertValue(cachedUser, User::class.java)
                    } catch (conversionException: Exception) {
                        removeUserCache(username)
                        null
                    }
                }
            }
        } catch (e: Exception) {
            log.error("사용자 정보 캐시 조회 실패: username={}", username, e)
            null
        }
    }

    fun removeUserCache(username: String) {
        try {
            val key = USER_CACHE_PREFIX + username
            redisTemplate.delete(key)
        } catch (e: Exception) {
            log.error("사용자 정보 캐시 삭제 실패: username={}", username, e)
        }
    }

    fun blacklistAccessToken(token: String, expirationMinutes: Long) {
        try {
            val key = BLACKLIST_TOKEN_PREFIX + token
            redisTemplate.opsForValue().set(key, "blacklisted", expirationMinutes, TimeUnit.MINUTES)
        } catch (e: Exception) {
            log.error("액세스 토큰 블랙리스트 추가 실패", e)
        }
    }

    fun isTokenBlacklisted(token: String): Boolean {
        return try {
            val key = BLACKLIST_TOKEN_PREFIX + token
            redisTemplate.hasKey(key)
        } catch (e: Exception) {
            log.error("토큰 블랙리스트 확인 실패", e)
            false
        }
    }

    fun getAllRefreshTokens(): Map<String, String> {
        val tokens = mutableMapOf<String, String>()
        try {
            val keys = redisTemplate.keys("${REFRESH_TOKEN_PREFIX}*")
            keys?.forEach { key ->
                val username = key.removePrefix(REFRESH_TOKEN_PREFIX)
                val encryptedToken = redisTemplate.opsForValue().get(key)
                if (encryptedToken != null) {
                    try {
                        val decryptedToken = tokenEncryptionService.decryptToken(encryptedToken.toString())
                        // 토큰 형식 검증 (JWT는 점으로 구분된 3개 부분)
                        if (decryptedToken.split('.').size == 3) {
                            tokens[username] = decryptedToken
                        } else {
                            log.warn("잘못된 토큰 형식, 캐시에서 제거: username={}", username)
                            redisTemplate.delete(key)
                        }
                    } catch (e: Exception) {
                        log.error("토큰 복호화 실패, 캐시에서 제거: username={}", username, e)
                        // 복호화 실패한 토큰은 Redis에서 제거
                        redisTemplate.delete(key)
                    }
                }
            }
        } catch (e: Exception) {
            log.error("모든 리프레시 토큰 조회 실패", e)
        }
        return tokens
    }

    fun getAllAccessTokens(): Map<String, String> {
        val tokens = mutableMapOf<String, String>()
        try {
            val keys = redisTemplate.keys("${ACCESS_TOKEN_PREFIX}*")
            keys?.forEach { key ->
                val username = key.removePrefix(ACCESS_TOKEN_PREFIX)
                val encryptedToken = redisTemplate.opsForValue().get(key)
                if (encryptedToken != null) {
                    try {
                        val decryptedToken = tokenEncryptionService.decryptToken(encryptedToken.toString())
                        // 토큰 형식 검증 (JWT는 점으로 구분된 3개 부분)
                        if (decryptedToken.split('.').size == 3) {
                            tokens[username] = decryptedToken
                        } else {
                            log.warn("잘못된 토큰 형식, 캐시에서 제거: username={}", username)
                            redisTemplate.delete(key)
                        }
                    } catch (e: Exception) {
                        log.error("토큰 복호화 실패, 캐시에서 제거: username={}", username, e)
                        // 복호화 실패한 토큰은 Redis에서 제거
                        redisTemplate.delete(key)
                    }
                }
            }
        } catch (e: Exception) {
            log.error("모든 액세스 토큰 조회 실패", e)
        }
        return tokens
    }

    fun getAllActiveUsers(): Set<String> {
        val activeUsers = mutableSetOf<String>()
        try {
            val accessKeys = redisTemplate.keys("${ACCESS_TOKEN_PREFIX}*")
            val refreshKeys = redisTemplate.keys("${REFRESH_TOKEN_PREFIX}*")
            
            accessKeys?.forEach { key ->
                activeUsers.add(key.removePrefix(ACCESS_TOKEN_PREFIX))
            }
            refreshKeys?.forEach { key ->
                activeUsers.add(key.removePrefix(REFRESH_TOKEN_PREFIX))
            }
        } catch (e: Exception) {
            log.error("활성 사용자 조회 실패", e)
        }
        return activeUsers
    }

    fun forceLogoutUser(username: String) {
        try {
            val accessToken = getCachedAccessToken(username)
            if (accessToken != null) {
                blacklistAccessToken(accessToken, 60)
            }
            
            removeAccessTokenCache(username)
            removeRefreshTokenCache(username)
            removeUserCache(username)
            
            log.info("사용자 강제 로그아웃 완료: username={}", username)
        } catch (e: Exception) {
            log.error("사용자 강제 로그아웃 실패: username={}", username, e)
        }
    }

    fun forceLogoutAllUsers() {
        try {
            val activeUsers = getAllActiveUsers()
            activeUsers.forEach { username ->
                forceLogoutUser(username)
            }
            log.info("모든 사용자 강제 로그아웃 완료: {} users", activeUsers.size)
        } catch (e: Exception) {
            log.error("모든 사용자 강제 로그아웃 실패", e)
        }
    }

    data class UserTokenInfo(
        val username: String,
        val accessToken: String?,
        val refreshToken: String?,
        val hasAccessToken: Boolean,
        val hasRefreshToken: Boolean,
        val userInfo: User?
    )

    fun getAllUserTokenInfo(): List<UserTokenInfo> {
        val userTokenInfoList = mutableListOf<UserTokenInfo>()
        try {
            val activeUsers = getAllActiveUsers()
            
            activeUsers.forEach { username ->
                val accessToken = getCachedAccessToken(username)
                val refreshToken = getCachedRefreshToken(username)
                val userInfo = getCachedUser(username)
                
                userTokenInfoList.add(
                    UserTokenInfo(
                        username = username,
                        accessToken = accessToken?.let { "${it.substring(0, 20)}..." },
                        refreshToken = refreshToken?.let { "${it.substring(0, 20)}..." },
                        hasAccessToken = accessToken != null,
                        hasRefreshToken = refreshToken != null,
                        userInfo = userInfo
                    )
                )
            }
        } catch (e: Exception) {
            log.error("사용자 토큰 정보 조회 실패", e)
        }
        return userTokenInfoList.sortedBy { it.username }
    }

    fun getRedisDebugInfo(): Map<String, Any> {
        val debugInfo = mutableMapOf<String, Any>()
        
        try {
            // Redis 연결 상태 확인
            val connectionInfo = try {
                redisTemplate.connectionFactory?.connection?.ping()
                "Connected"
            } catch (e: Exception) {
                "Disconnected: ${e.message ?: "알 수 없는 오류"}"
            }
            
            // 모든 키 조회
            val allKeys = redisTemplate.keys("*") ?: emptySet()
            val accessTokenKeys = redisTemplate.keys("${ACCESS_TOKEN_PREFIX}*") ?: emptySet()
            val refreshTokenKeys = redisTemplate.keys("${REFRESH_TOKEN_PREFIX}*") ?: emptySet()
            val userCacheKeys = redisTemplate.keys("${USER_CACHE_PREFIX}*") ?: emptySet()
            val blacklistKeys = redisTemplate.keys("${BLACKLIST_TOKEN_PREFIX}*") ?: emptySet()
            
            // 각 키의 TTL 정보
            val accessTokenDetails = accessTokenKeys.map { key ->
                val ttl = redisTemplate.getExpire(key)
                val username = key.removePrefix(ACCESS_TOKEN_PREFIX)
                mapOf(
                    "key" to key,
                    "username" to username,
                    "ttl" to ttl,
                    "hasValue" to redisTemplate.hasKey(key)
                )
            }
            
            val refreshTokenDetails = refreshTokenKeys.map { key ->
                val ttl = redisTemplate.getExpire(key)
                val username = key.removePrefix(REFRESH_TOKEN_PREFIX)
                mapOf(
                    "key" to key,
                    "username" to username,
                    "ttl" to ttl,
                    "hasValue" to redisTemplate.hasKey(key)
                )
            }
            
            debugInfo["connectionStatus"] = connectionInfo
            debugInfo["totalKeys"] = allKeys.size
            debugInfo["allKeys"] = allKeys.toList()
            debugInfo["accessTokenKeys"] = accessTokenKeys.size
            debugInfo["refreshTokenKeys"] = refreshTokenKeys.size
            debugInfo["userCacheKeys"] = userCacheKeys.size
            debugInfo["blacklistKeys"] = blacklistKeys.size
            debugInfo["accessTokenDetails"] = accessTokenDetails
            debugInfo["refreshTokenDetails"] = refreshTokenDetails
            debugInfo["prefixes"] = mapOf(
                "ACCESS_TOKEN_PREFIX" to ACCESS_TOKEN_PREFIX,
                "REFRESH_TOKEN_PREFIX" to REFRESH_TOKEN_PREFIX,
                "USER_CACHE_PREFIX" to USER_CACHE_PREFIX,
                "BLACKLIST_TOKEN_PREFIX" to BLACKLIST_TOKEN_PREFIX
            )
            
            log.info("Redis 디버그 정보 - 전체키: {}, 액세스토큰키: {}, 리프레시토큰키: {}", 
                allKeys.size, accessTokenKeys.size, refreshTokenKeys.size)
            
        } catch (e: Exception) {
            log.error("Redis 디버그 정보 수집 실패", e)
            debugInfo["error"] = e.message ?: "알 수 없는 오류"
        }
        
        return debugInfo
    }

    fun testRedisConnection(): Map<String, Any> {
        return try {
            val testKey = "test:${System.currentTimeMillis()}"
            val testValue = "test-value"
            
            // Redis에 값 저장
            redisTemplate.opsForValue().set(testKey, testValue, java.time.Duration.ofSeconds(10))
            
            // Redis에서 값 조회
            val retrievedValue = redisTemplate.opsForValue().get(testKey)
            
            // 테스트 키 삭제
            redisTemplate.delete(testKey)
            
            val isWorking = testValue == retrievedValue
            
            mapOf<String, Any>(
                "redisWorking" to isWorking,
                "testKey" to testKey,
                "testValue" to testValue,
                "retrievedValue" to (retrievedValue ?: "null"),
                "message" to if (isWorking) "Redis 연결 정상" else "Redis 연결 문제"
            )
        } catch (e: Exception) {
            log.error("Redis 연결 테스트 실패", e)
            mapOf<String, Any>(
                "redisWorking" to false,
                "error" to (e.message ?: "알 수 없는 오류"),
                "message" to "Redis 연결 실패"
            )
        }
    }
} 