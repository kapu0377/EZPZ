package com.example.apiezpz.auth.security

import com.example.apiezpz.auth.service.RedisCacheService
import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtTokenProvider(
    private val jwtProperties: JwtProperties,
    private val redisCacheService: RedisCacheService
) {
    private val key: SecretKey = if (jwtProperties.secret.length >= 64) {
        Keys.hmacShaKeyFor(jwtProperties.secret.toByteArray())
    } else {
        Jwts.SIG.HS512.key().build()
    }
    private val log = LoggerFactory.getLogger(javaClass)

    val accessTokenExpirationMinutes: Long
        get() = jwtProperties.accessTokenExpirationMinutes

    val refreshTokenExpirationMinutes: Long
        get() = jwtProperties.refreshTokenExpirationMinutes

    fun generateAccessToken(username: String): String {
        val accessToken = generateToken(username, accessTokenExpirationMinutes)
        redisCacheService.cacheAccessToken(username, accessToken, accessTokenExpirationMinutes)
        return accessToken
    }

    fun generateRefreshToken(username: String): String {
        val refreshToken = generateToken(username, refreshTokenExpirationMinutes)
        redisCacheService.cacheRefreshToken(username, refreshToken, refreshTokenExpirationMinutes)
        return refreshToken
    }

    private fun generateToken(username: String, expirationMinutes: Long): String {
        val now = Date()
        val expiryDate = Date(now.time + expirationMinutes * 60 * 1000)
        return Jwts.builder()
            .subject(username)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(key)
            .compact()
    }

    fun validateToken(token: String): Boolean {
        try {
            Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
            return true
        } catch (ex: Exception) {
            log.error("JWT 토큰 검증 실패: {}", ex.message)
            return false
        }
    }

    fun getUsernameFromToken(token: String): String {
        return getClaimsFromToken(token).subject
    }

    fun getTokenExpiryDateTime(token: String): java.time.LocalDateTime {
        val claims = getClaimsFromToken(token)
        val expirationDate = claims.expiration
        return expirationDate.toInstant()
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDateTime()
    }

    fun getRemainingTimeInMinutes(token: String): Long {
        val claims = getClaimsFromToken(token)
        val expirationTime = claims.expiration.time
        val currentTime = System.currentTimeMillis()
        val remainingTime = expirationTime - currentTime
        
        return if (remainingTime > 0) {
            remainingTime / (60 * 1000) // 밀리초를 분으로 변환
        } else {
            0
        }
    }

    fun getClaimsFromToken(token: String): Claims {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
    }
} 