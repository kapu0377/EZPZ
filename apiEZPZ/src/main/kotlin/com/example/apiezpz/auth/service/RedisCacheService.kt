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
} 