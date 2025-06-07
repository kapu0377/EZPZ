package com.example.apiezpz.auth.service

import com.example.apiezpz.auth.entity.User
import com.example.apiezpz.auth.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class UserCacheService(
    private val userRepository: UserRepository,
    private val redisCacheService: RedisCacheService
) {
    private val log = LoggerFactory.getLogger(UserCacheService::class.java)

    fun getUserByUsername(username: String): User? {
        val cachedUser = redisCacheService.getCachedUser(username)
        if (cachedUser != null) {
            log.debug("Redis에서 사용자 정보 조회됨: username={}", username)
            return cachedUser
        }

        val user = userRepository.findByUsername(username)
        if (user != null) {
            redisCacheService.cacheUser(username, user)
            log.debug("DB에서 사용자 정보 조회 후 캐싱: username={}", username)
        }

        return user
    }

    fun updateUser(user: User) {
        userRepository.save(user)
        
        // Redis 캐시 업데이트
        redisCacheService.cacheUser(user.username, user)
        
        log.info("사용자 정보 업데이트 완료: username={}", user.username)
    }

    fun deleteUser(username: String) {
        // Redis 캐시 삭제
        redisCacheService.removeUserCache(username)
        redisCacheService.removeRefreshTokenCache(username)
        
        log.info("사용자 캐시 삭제 완료: username={}", username)
    }
} 