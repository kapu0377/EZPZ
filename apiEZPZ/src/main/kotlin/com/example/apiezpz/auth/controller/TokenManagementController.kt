package com.example.apiezpz.auth.controller

import com.example.apiezpz.auth.security.AdminOnly
import com.example.apiezpz.auth.security.JwtTokenProvider
import com.example.apiezpz.auth.service.RedisCacheService
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId

@RestController
@RequestMapping("/api/admin/token")
class TokenManagementController(
    private val jwtTokenProvider: JwtTokenProvider,
    private val redisCacheService: RedisCacheService
) {
    private val log = LoggerFactory.getLogger(TokenManagementController::class.java)
    
    @Value("\${admin.user.id}")
    private lateinit var adminUserId: String
    
    private fun checkAdminPermission(userDetails: UserDetails) {
        val username = userDetails.username
        log.info("관리자 권한 확인 - 현재 사용자: {}, 관리자 ID: {}", username, adminUserId)
        
        if (username != adminUserId) {
            log.warn("권한 없는 사용자의 관리자 페이지 접근 시도 - 사용자: {}", username)
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "관리자만 접근 가능합니다")
        }
        
        log.info("관리자 권한 확인 완료: {}", username)
    }

    @GetMapping("/status")
    @PreAuthorize("isAuthenticated()")
    fun getTokenStatus(
        @AuthenticationPrincipal userDetails: UserDetails,
        request: HttpServletRequest
    ): ResponseEntity<Map<String, Any>> {
        try {
            checkAdminPermission(userDetails)
            
            val username = userDetails.username
            log.info("토큰 상태 조회 요청: {}", username)

            val accessToken = extractAccessTokenFromRequest(request)
            val refreshToken = redisCacheService.getCachedRefreshToken(username)

            val tokenInfo = mutableMapOf<String, Any>()

            if (accessToken != null) {
                val accessTokenClaims = jwtTokenProvider.getClaimsFromToken(accessToken)
                tokenInfo["accessToken"] = mapOf(
                    "exists" to true,
                    "isValid" to jwtTokenProvider.validateToken(accessToken),
                    "issuedAt" to Instant.ofEpochSecond(accessTokenClaims.issuedAt.time / 1000)
                        .atZone(ZoneId.systemDefault()).toLocalDateTime(),
                    "expiresAt" to Instant.ofEpochSecond(accessTokenClaims.expiration.time / 1000)
                        .atZone(ZoneId.systemDefault()).toLocalDateTime(),
                    "subject" to accessTokenClaims.subject
                )
            } else {
                tokenInfo["accessToken"] = mapOf("exists" to false)
            }

            if (refreshToken != null) {
                val refreshTokenClaims = jwtTokenProvider.getClaimsFromToken(refreshToken)
                tokenInfo["refreshToken"] = mapOf(
                    "exists" to true,
                    "isValid" to jwtTokenProvider.validateToken(refreshToken),
                    "issuedAt" to Instant.ofEpochSecond(refreshTokenClaims.issuedAt.time / 1000)
                        .atZone(ZoneId.systemDefault()).toLocalDateTime(),
                    "expiresAt" to Instant.ofEpochSecond(refreshTokenClaims.expiration.time / 1000)
                        .atZone(ZoneId.systemDefault()).toLocalDateTime(),
                    "subject" to refreshTokenClaims.subject
                )
            } else {
                tokenInfo["refreshToken"] = mapOf("exists" to false)
            }

            tokenInfo["username"] = username
            tokenInfo["lastChecked"] = LocalDateTime.now()
            tokenInfo["userAgent"] = request.getHeader("User-Agent") ?: "Unknown"
            tokenInfo["remoteAddr"] = request.remoteAddr

            return ResponseEntity.ok(tokenInfo)
        } catch (e: Exception) {
            log.error("토큰 상태 조회 실패", e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "토큰 상태 조회 실패"))
        }
    }

    @PostMapping("/force-logout")
    @PreAuthorize("isAuthenticated()")
    fun forceLogout(
        @AuthenticationPrincipal userDetails: UserDetails,
        request: HttpServletRequest
    ): ResponseEntity<Map<String, Any>> {
        try {
            checkAdminPermission(userDetails)
            
            val username = userDetails.username
            log.info("강제 로그아웃 요청: {}", username)

            val accessToken = extractAccessTokenFromRequest(request)
            
            if (accessToken != null) {
                redisCacheService.blacklistAccessToken(
                    accessToken, 
                    jwtTokenProvider.accessTokenExpirationMinutes
                )
                log.info("액세스 토큰 블랙리스트 추가 완료: {}", username)
            }

            redisCacheService.removeRefreshTokenCache(username)
            log.info("리프레시 토큰 캐시 삭제 완료: {}", username)

            return ResponseEntity.ok(mapOf(
                "message" to "강제 로그아웃 완료",
                "username" to username,
                "timestamp" to LocalDateTime.now()
            ))
        } catch (e: Exception) {
            log.error("강제 로그아웃 실패", e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "강제 로그아웃 실패"))
        }
    }

    @PostMapping("/refresh")
    @PreAuthorize("isAuthenticated()")
    fun manualRefresh(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<Map<String, Any>> {
        try {
            checkAdminPermission(userDetails)
            
            val username = userDetails.username
            log.info("수동 토큰 갱신 요청: {}", username)

            val newAccessToken = jwtTokenProvider.generateAccessToken(username)
            
            return ResponseEntity.ok(mapOf(
                "message" to "토큰 갱신 완료",
                "username" to username,
                "timestamp" to LocalDateTime.now()
            ))
        } catch (e: Exception) {
            log.error("수동 토큰 갱신 실패", e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "토큰 갱신 실패"))
        }
    }

    @GetMapping("/admin/all-users")
    @PreAuthorize("isAuthenticated()")
    fun getAllUserTokenInfo(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<List<Map<String, Any?>>> {
        try {
            checkAdminPermission(userDetails)
            
            log.info("전체 사용자 토큰 정보 조회 요청: {}", userDetails.username)
            
            val userTokenInfoList = redisCacheService.getAllUserTokenInfo()
            
            // 사용자 정보에 role 추가
            val enrichedUserList = userTokenInfoList.map { userTokenInfo ->
                val userInfoMap = if (userTokenInfo.userInfo != null) {
                    mapOf(
                        "id" to userTokenInfo.userInfo.id,
                        "email" to userTokenInfo.userInfo.email,
                        "role" to if (userTokenInfo.username == adminUserId) "ADMIN" else "USER"
                    )
                } else {
                    mapOf(
                        "id" to null,
                        "email" to null,
                        "role" to if (userTokenInfo.username == adminUserId) "ADMIN" else "USER"
                    )
                }
                
                mapOf(
                    "username" to userTokenInfo.username,
                    "accessToken" to userTokenInfo.accessToken,
                    "refreshToken" to userTokenInfo.refreshToken,
                    "hasAccessToken" to userTokenInfo.hasAccessToken,
                    "hasRefreshToken" to userTokenInfo.hasRefreshToken,
                    "userInfo" to userInfoMap
                )
            }
            
            return ResponseEntity.ok(enrichedUserList)
        } catch (e: Exception) {
            log.error("전체 사용자 토큰 정보 조회 실패", e)
            return ResponseEntity.internalServerError().body(emptyList())
        }
    }

    @PostMapping("/admin/force-logout/{username}")
    @PreAuthorize("isAuthenticated()")
    fun forceLogoutUser(
        @AuthenticationPrincipal userDetails: UserDetails,
        @PathVariable username: String
    ): ResponseEntity<Map<String, Any>> {
        try {
            checkAdminPermission(userDetails)
            
            log.info("사용자 강제 로그아웃 요청: admin={}, target={}", userDetails.username, username)
            
            if (username == userDetails.username) {
                return ResponseEntity.badRequest().body(mapOf(
                    "error" to "자기 자신을 강제 로그아웃할 수 없습니다"
                ))
            }
            
            redisCacheService.forceLogoutUser(username)
            
            return ResponseEntity.ok(mapOf(
                "message" to "사용자 강제 로그아웃 완료",
                "targetUser" to username,
                "adminUser" to userDetails.username,
                "timestamp" to LocalDateTime.now()
            ))
        } catch (e: Exception) {
            log.error("사용자 강제 로그아웃 실패: target={}", username, e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "강제 로그아웃 실패"))
        }
    }

    @PostMapping("/admin/force-logout-all")
    @PreAuthorize("isAuthenticated()")
    fun forceLogoutAllUsers(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<Map<String, Any>> {
        try {
            checkAdminPermission(userDetails)
            
            log.info("전체 사용자 강제 로그아웃 요청: admin={}", userDetails.username)
            
            val activeUsers = redisCacheService.getAllActiveUsers()
            val targetUsers = activeUsers.filter { it != userDetails.username }
            
            targetUsers.forEach { username ->
                redisCacheService.forceLogoutUser(username)
            }
            
            return ResponseEntity.ok(mapOf(
                "message" to "전체 사용자 강제 로그아웃 완료",
                "loggedOutUsers" to targetUsers,
                "loggedOutCount" to targetUsers.size,
                "adminUser" to userDetails.username,
                "timestamp" to LocalDateTime.now()
            ))
        } catch (e: Exception) {
            log.error("전체 사용자 강제 로그아웃 실패", e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "전체 강제 로그아웃 실패"))
        }
    }

    @GetMapping("/admin/active-users")
    @PreAuthorize("isAuthenticated()")
    fun getActiveUsers(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<Map<String, Any>> {
        try {
            checkAdminPermission(userDetails)
            
            log.info("활성 사용자 목록 조회 요청: {}", userDetails.username)
            
            val activeUsers = redisCacheService.getAllActiveUsers()
            val accessTokens = redisCacheService.getAllAccessTokens()
            val refreshTokens = redisCacheService.getAllRefreshTokens()
            
            return ResponseEntity.ok(mapOf(
                "activeUsers" to activeUsers,
                "activeUserCount" to activeUsers.size,
                "accessTokenCount" to accessTokens.size,
                "refreshTokenCount" to refreshTokens.size,
                "timestamp" to LocalDateTime.now()
            ))
        } catch (e: Exception) {
            log.error("활성 사용자 목록 조회 실패", e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "활성 사용자 조회 실패"))
        }
    }

    @DeleteMapping("/admin/clear-user-cache/{username}")
    @PreAuthorize("isAuthenticated()")
    fun clearUserCache(
        @AuthenticationPrincipal userDetails: UserDetails,
        @PathVariable username: String
    ): ResponseEntity<Map<String, Any>> {
        try {
            checkAdminPermission(userDetails)
            
            log.info("사용자 캐시 삭제 요청: admin={}, target={}", userDetails.username, username)
            
            redisCacheService.removeUserCache(username)
            redisCacheService.removeAccessTokenCache(username)
            redisCacheService.removeRefreshTokenCache(username)
            
            return ResponseEntity.ok(mapOf(
                "message" to "사용자 캐시 삭제 완료",
                "targetUser" to username,
                "adminUser" to userDetails.username,
                "timestamp" to LocalDateTime.now()
            ))
        } catch (e: Exception) {
            log.error("사용자 캐시 삭제 실패: target={}", username, e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "캐시 삭제 실패"))
        }
    }

    @PostMapping("/admin/refresh-user-token/{username}")
    @PreAuthorize("isAuthenticated()")
    fun refreshUserToken(
        @AuthenticationPrincipal userDetails: UserDetails,
        @PathVariable username: String
    ): ResponseEntity<Map<String, Any>> {
        try {
            checkAdminPermission(userDetails)
            
            log.info("사용자 토큰 갱신 요청: admin={}, target={}", userDetails.username, username)
            
            if (username == userDetails.username) {
                return ResponseEntity.badRequest().body(mapOf(
                    "error" to "자기 자신의 토큰은 갱신할 수 없습니다"
                ))
            }
            
            // 새로운 토큰 생성
            val newAccessToken = jwtTokenProvider.generateAccessToken(username)
            val newRefreshToken = jwtTokenProvider.generateRefreshToken(username)
            
            log.info("사용자 토큰 갱신 완료: admin={}, target={}", userDetails.username, username)
            
            return ResponseEntity.ok(mapOf(
                "message" to "사용자 토큰 갱신 완료",
                "targetUser" to username,
                "adminUser" to userDetails.username,
                "accessToken" to "${newAccessToken.substring(0, 20)}...",
                "refreshToken" to "${newRefreshToken.substring(0, 20)}...",
                "timestamp" to LocalDateTime.now()
            ))
        } catch (e: Exception) {
            log.error("사용자 토큰 갱신 실패: target={}", username, e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "토큰 갱신 실패"))
        }
    }

    @PostMapping("/admin/clean-expired-tokens")
    @PreAuthorize("isAuthenticated()")
    fun cleanExpiredTokens(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<Map<String, Any>> {
        try {
            checkAdminPermission(userDetails)
            
            log.info("만료된 토큰 정리 요청: admin={}", userDetails.username)
            
            val beforeAccessCount = redisCacheService.getAllAccessTokens().size
            val beforeRefreshCount = redisCacheService.getAllRefreshTokens().size
            
            // getAllTokens를 호출하면 자동으로 만료된/손상된 토큰들이 정리됨
            val afterAccessCount = redisCacheService.getAllAccessTokens().size
            val afterRefreshCount = redisCacheService.getAllRefreshTokens().size
            
            val removedAccessTokens = beforeAccessCount - afterAccessCount
            val removedRefreshTokens = beforeRefreshCount - afterRefreshCount
            
            log.info("만료된 토큰 정리 완료: admin={}, 제거된 액세스토큰={}, 제거된 리프레시토큰={}", 
                userDetails.username, removedAccessTokens, removedRefreshTokens)
            
            return ResponseEntity.ok(mapOf(
                "message" to "만료된 토큰 정리 완료",
                "removedAccessTokens" to removedAccessTokens,
                "removedRefreshTokens" to removedRefreshTokens,
                "currentAccessTokens" to afterAccessCount,
                "currentRefreshTokens" to afterRefreshCount,
                "adminUser" to userDetails.username,
                "timestamp" to LocalDateTime.now()
            ))
        } catch (e: Exception) {
            log.error("만료된 토큰 정리 실패", e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "토큰 정리 실패"))
        }
    }

    private fun extractAccessTokenFromRequest(request: HttpServletRequest): String? {
        val cookies = request.cookies
        if (cookies != null) {
            for (cookie in cookies) {
                if ("accessToken" == cookie.name) {
                    return cookie.value
                }
            }
        }
        
        val bearerToken = request.getHeader("Authorization")
        return if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            bearerToken.substring(7)
        } else {
            null
        }
    }
} 