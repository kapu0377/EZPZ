package com.example.apiezpz.auth.controller

import com.example.apiezpz.auth.entity.User
import com.example.apiezpz.auth.repository.UserRepository
import com.example.apiezpz.auth.security.JwtTokenProvider
import com.example.apiezpz.auth.service.RedisCacheService
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.Instant

@RestController
@RequestMapping("/api/admin/token")
class TokenManagementController(
    private val jwtTokenProvider: JwtTokenProvider,
    private val redisCacheService: RedisCacheService,
    private val userRepository: UserRepository
) {
    private val log = LoggerFactory.getLogger(TokenManagementController::class.java)

    private fun checkSpecificRole(userDetails: UserDetails, vararg roles: User.Role): Boolean {
        val userRoles = userDetails.authorities.mapNotNull { it.authority.removePrefix("ROLE_").let { roleName -> User.Role.values().find { it.name == roleName } } }
        return userRoles.any { it in roles }
    }
    
    private fun ensureAdminOrTenant(userDetails: UserDetails) {
        if (!checkSpecificRole(userDetails, User.Role.ADMIN, User.Role.TENANT)) {
            log.warn("권한 없는 사용자의 관리자 기능 접근 시도 - 사용자: {}", userDetails.username)
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 또는 테넌트만 접근 가능합니다.")
        }
        log.info("관리자/테넌트 권한 확인 완료: {}", userDetails.username)
    }

    private fun ensureTenant(userDetails: UserDetails) {
        if (!checkSpecificRole(userDetails, User.Role.TENANT)) {
            log.warn("권한 없는 사용자의 테넌트 기능 접근 시도 - 사용자: {}", userDetails.username)
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "테넌트만 접근 가능합니다.")
        }
        log.info("테넌트 권한 확인 완료: {}", userDetails.username)
    }

    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
    fun getTokenStatus(
        @AuthenticationPrincipal userDetails: UserDetails,
        request: HttpServletRequest
    ): ResponseEntity<Map<String, Any>> {
        val username = userDetails.username
        log.info("토큰 상태 조회 요청: {} (요청자 역할: {})", username, userDetails.authorities)

        try {
            val currentUsername = userDetails.username
            log.info("토큰 상태 조회 요청: {}", currentUsername)

            val accessToken = extractAccessTokenFromRequest(request)
            val refreshToken = redisCacheService.getCachedRefreshToken(currentUsername)

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
                try {
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
                } catch (e: Exception) {
                    log.warn("캐시된 리프레시 토큰 클레임 추출 실패 (만료 또는 형식 오류 가능성): {}", e.message)
                    tokenInfo["refreshToken"] = mapOf("exists" to true, "isValid" to false, "error" to "토큰 파싱 실패")
                }
            } else {
                tokenInfo["refreshToken"] = mapOf("exists" to false)
            }

            tokenInfo["username"] = currentUsername
            tokenInfo["lastChecked"] = LocalDateTime.now()
            tokenInfo["userAgent"] = request.getHeader("User-Agent") ?: "Unknown"
            tokenInfo["remoteAddr"] = request.remoteAddr

            return ResponseEntity.ok(tokenInfo)
        } catch (e: Exception) {
            log.error("토큰 상태 조회 실패", e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "토큰 상태 조회 실패: ${e.message}"))
        }
    }

    @PostMapping("/force-logout")
    @PreAuthorize("isAuthenticated()")
    fun forceLogout(
        @AuthenticationPrincipal userDetails: UserDetails,
        request: HttpServletRequest
    ): ResponseEntity<Map<String, Any>> {
        ensureAdminOrTenant(userDetails)

        val username = userDetails.username
        log.info("강제 로그아웃(본인 세션 무효화) 요청: {}", username)

        try {
            val currentUsername = userDetails.username
            log.info("강제 로그아웃 요청: {}", currentUsername)

            val accessToken = extractAccessTokenFromRequest(request)
            
            if (accessToken != null) {
                redisCacheService.blacklistAccessToken(
                    accessToken, 
                    5
                )
                log.info("현재 사용 중인 액세스 토큰 블랙리스트 추가 완료: {}", currentUsername)
            }

            redisCacheService.removeRefreshTokenCache(currentUsername)
            log.info("모든 리프레시 토큰 캐시 삭제 완료: {}", currentUsername)

            redisCacheService.removeAccessTokenCache(currentUsername)
            log.info("액세스 토큰 캐시 삭제 완료: {}", currentUsername)

            return ResponseEntity.ok(mapOf(
                "message" to "강제 로그아웃(본인 세션 무효화) 완료",
                "username" to currentUsername,
                "timestamp" to LocalDateTime.now()
            ))
        } catch (e: Exception) {
            log.error("강제 로그아웃(본인 세션 무효화) 실패", e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "강제 로그아웃 실패: ${e.message}"))
        }
    }

    @PostMapping("/refresh")
    @PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
    fun manualRefresh(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<Map<String, Any>> {
        val username = userDetails.username
        log.info("수동 토큰 갱신 요청: {} (요청자 역할: {})", username, userDetails.authorities)

        try {
            val currentUsername = userDetails.username
            log.info("수동 토큰 갱신 요청: {}", currentUsername)

            val newAccessToken = jwtTokenProvider.generateAccessToken(currentUsername)

            return ResponseEntity.ok(mapOf(
                "message" to "새 액세스 토큰 수동 발급 완료",
                "username" to currentUsername,
                "newAccessToken" to newAccessToken,
                "expiresIn" to jwtTokenProvider.accessTokenExpirationMinutes * 60,
                "timestamp" to LocalDateTime.now()
            ))
        } catch (e: Exception) {
            log.error("수동 토큰 갱신 실패", e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "토큰 갱신 실패: ${e.message}"))
        }
    }

    @GetMapping("/admin/all-users")
    @PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
    fun getAllUserTokenInfo(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<List<Map<String, Any?>>> {
        log.info("전체 사용자 토큰 정보 조회 요청: {} (요청자 역할: {})", userDetails.username, userDetails.authorities)

        try {
            log.info("전체 사용자 토큰 정보 조회 요청: {}", userDetails.username)
            
            // 1. DB에서 모든 사용자 조회
            val allUsersFromDB = userRepository.findAll()
            
            // 2. Redis에서 토큰 정보 조회
            val activeUserTokens = redisCacheService.getAllUserTokenInfo().associateBy { it.username }
            
            // 3. DB 사용자와 Redis 토큰 정보 결합
            val enrichedUserList = allUsersFromDB.map { dbUser ->
                val tokenInfo = activeUserTokens[dbUser.username]
                
                val userInfoMap = mapOf<String, Any?>(
                    "id" to dbUser.id,
                    "email" to dbUser.email,
                    "role" to dbUser.role.name
                )
                
                mapOf<String, Any?>(
                    "username" to dbUser.username,
                    "accessToken" to (tokenInfo?.accessToken),
                    "refreshToken" to (tokenInfo?.refreshToken),
                    "hasAccessToken" to (tokenInfo?.hasAccessToken ?: false),
                    "hasRefreshToken" to (tokenInfo?.hasRefreshToken ?: false),
                    "userInfo" to userInfoMap,
                    "isSelf" to (dbUser.username == userDetails.username),
                    "isActive" to (tokenInfo != null)
                )
            }
            
            log.info("조회된 사용자 수: DB={}, Redis활성={}", allUsersFromDB.size, activeUserTokens.size)
            
            return ResponseEntity.ok(enrichedUserList)
        } catch (e: Exception) {
            log.error("전체 사용자 토큰 정보 조회 실패", e)
            return ResponseEntity.internalServerError().body(emptyList())
        }
    }

    @PostMapping("/admin/force-logout/{targetUsername}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
    fun forceLogoutUser(
        @AuthenticationPrincipal userDetails: UserDetails,
        @PathVariable targetUsername: String
    ): ResponseEntity<Map<String, Any>> {
        log.info("특정 사용자 강제 로그아웃 요청: admin={}, target={} (요청자 역할: {})", userDetails.username, targetUsername, userDetails.authorities)

        try {
            log.info("사용자 강제 로그아웃 요청: admin={}, target={}", userDetails.username, targetUsername)
            
            if (targetUsername == userDetails.username) {
                return ResponseEntity.badRequest().body(mapOf(
                    "error" to "자기 자신을 이 엔드포인트로 강제 로그아웃할 수 없습니다. '/api/admin/token/force-logout'을 사용하세요."
                ))
            }

            val performingUserRole = userDetails.authorities.mapNotNull { it.authority.removePrefix("ROLE_").let { roleName -> User.Role.values().find { it.name == roleName } } }.firstOrNull()
            val targetUserEntity = redisCacheService.getCachedUser(targetUsername)

            if (performingUserRole == User.Role.ADMIN && targetUserEntity != null && (targetUserEntity.role == User.Role.ADMIN || targetUserEntity.role == User.Role.TENANT)) {
                 log.warn("ADMIN 권한으로 다른 ADMIN/TENANT 강제 로그아웃 시도: admin={}, target={}", userDetails.username, targetUsername)
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to "ADMIN은 다른 ADMIN 또는 TENANT를 강제 로그아웃할 수 없습니다."))
            }
            
            redisCacheService.forceLogoutUser(targetUsername)
            
            return ResponseEntity.ok(mapOf(
                "message" to "사용자 강제 로그아웃 완료",
                "targetUser" to targetUsername,
                "adminUser" to userDetails.username,
                "timestamp" to LocalDateTime.now()
            ))
        } catch (e: Exception) {
            log.error("사용자 강제 로그아웃 실패: target={}", targetUsername, e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "강제 로그아웃 실패: ${e.message}"))
        }
    }

    @PostMapping("/admin/force-logout-all")
    @PreAuthorize("hasRole('TENANT')")
    fun forceLogoutAllUsers(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<Map<String, Any>> {
        log.info("전체 사용자 강제 로그아웃 요청: admin={} (요청자 역할: {})", userDetails.username, userDetails.authorities)

        try {
            log.info("전체 사용자 강제 로그아웃 요청: admin={}", userDetails.username)
            
            val activeUsers = redisCacheService.getAllActiveUsers()
            val loggedOutUsersList = mutableListOf<String>()

            val performingUserRole = userDetails.authorities.mapNotNull { it.authority.removePrefix("ROLE_").let { roleName -> User.Role.values().find { it.name == roleName } } }.firstOrNull()

            activeUsers.forEach { usernameToLogout ->
                if (usernameToLogout == userDetails.username) return@forEach

                val targetUserEntity = redisCacheService.getCachedUser(usernameToLogout)
                if (targetUserEntity != null && targetUserEntity.role == User.Role.TENANT) {
                     log.info("다른 TENANT 유저 제외: {}", usernameToLogout)
                    return@forEach
                }
                
                redisCacheService.forceLogoutUser(usernameToLogout)
                loggedOutUsersList.add(usernameToLogout)
            }
            
            return ResponseEntity.ok(mapOf(
                "message" to "전체 사용자 강제 로그아웃 완료 (본인 및 다른 테넌트 제외)",
                "loggedOutUsers" to loggedOutUsersList,
                "loggedOutCount" to loggedOutUsersList.size,
                "adminUser" to userDetails.username,
                "timestamp" to LocalDateTime.now()
            ))
        } catch (e: Exception) {
            log.error("전체 사용자 강제 로그아웃 실패", e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "전체 강제 로그아웃 실패: ${e.message}"))
        }
    }

    @GetMapping("/admin/active-users")
    @PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
    fun getActiveUsers(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<Set<String>> {
        log.info("활성 사용자 목록 조회 요청: {} (요청자 역할: {})", userDetails.username, userDetails.authorities)

        try {
            log.info("활성 사용자 목록 조회 요청: {}", userDetails.username)
            val activeUsers = redisCacheService.getAllActiveUsers()
            return ResponseEntity.ok(activeUsers)
        } catch (e: Exception) {
            log.error("활성 사용자 목록 조회 실패", e)
            return ResponseEntity.internalServerError().body(emptySet())
        }
    }

    @GetMapping("/admin/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
    fun checkTokenStatus(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<Map<String, Any>> {
        try {
            val hasAccessToken = redisCacheService.getCachedAccessToken(userDetails.username) != null
            val hasRefreshToken = redisCacheService.getCachedRefreshToken(userDetails.username) != null
            
            return ResponseEntity.ok(mapOf(
                "username" to userDetails.username,
                "hasAccessToken" to hasAccessToken,
                "hasRefreshToken" to hasRefreshToken,
                "isActive" to (hasAccessToken || hasRefreshToken),
                "timestamp" to LocalDateTime.now()
            ))
        } catch (e: Exception) {
            log.error("토큰 상태 확인 실패: {}", userDetails.username, e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "토큰 상태 확인 실패"))
        }
    }

    @GetMapping("/admin/redis-debug")
    @PreAuthorize("hasRole('TENANT')")
    fun getRedisDebugInfo(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<Map<String, Any>> {
        log.info("Redis 디버그 정보 조회 요청: {} (요청자 역할: {})", userDetails.username, userDetails.authorities)

        try {
            log.info("Redis 디버그 정보 조회 요청 시작: {}", userDetails.username)
            val debugInfo = redisCacheService.getRedisDebugInfo()
            log.info("Redis 디버그 정보 조회 완료: {} 개 항목", debugInfo.size)
            return ResponseEntity.ok(debugInfo)
        } catch (e: Exception) {
            log.error("Redis 디버그 정보 조회 실패", e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "Redis 디버그 정보 조회 실패: ${e.message}"))
        }
    }

    @DeleteMapping("/admin/clear-user-cache/{targetUsername}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
    fun clearUserCache(
        @AuthenticationPrincipal userDetails: UserDetails,
        @PathVariable targetUsername: String
    ): ResponseEntity<Map<String, Any>> {
        log.info("사용자 캐시 삭제 요청: admin={}, target={} (요청자 역할: {})", userDetails.username, targetUsername, userDetails.authorities)

        try {
            log.info("사용자 캐시 삭제 요청: admin={}, target={}", userDetails.username, targetUsername)

            val performingUserRole = userDetails.authorities.mapNotNull { it.authority.removePrefix("ROLE_").let { roleName -> User.Role.values().find { it.name == roleName } } }.firstOrNull()
            val targetUserEntity = redisCacheService.getCachedUser(targetUsername)

            if (performingUserRole == User.Role.ADMIN && targetUserEntity != null && (targetUserEntity.role == User.Role.ADMIN || targetUserEntity.role == User.Role.TENANT)) {
                 log.warn("ADMIN 권한으로 다른 ADMIN/TENANT 캐시 삭제 시도: admin={}, target={}", userDetails.username, targetUsername)
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to "ADMIN은 다른 ADMIN 또는 TENANT의 캐시를 삭제할 수 없습니다."))
            }

            redisCacheService.removeUserCache(targetUsername)
            redisCacheService.removeAccessTokenCache(targetUsername)
            redisCacheService.removeRefreshTokenCache(targetUsername)
            
            return ResponseEntity.ok(mapOf(
                "message" to "사용자 캐시 삭제 완료",
                "targetUser" to targetUsername,
                "adminUser" to userDetails.username,
                "timestamp" to LocalDateTime.now()
            ))
        } catch (e: Exception) {
            log.error("사용자 캐시 삭제 실패: target={}", targetUsername, e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "캐시 삭제 실패: ${e.message}"))
        }
    }

    @DeleteMapping("/admin/clear-all-user-caches")
    @PreAuthorize("hasRole('TENANT')")
    fun clearAllUserCaches(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<Map<String, Any>> {
        log.info("전체 사용자 캐시 삭제 요청: {} (요청자 역할: {})", userDetails.username, userDetails.authorities)

        try {
            log.info("전체 사용자 캐시 삭제 요청: {}", userDetails.username)
            
            val activeUsers = redisCacheService.getAllActiveUsers()
            val clearedUsers = mutableListOf<String>()

            activeUsers.forEach { usernameToClear ->
                if (usernameToClear == userDetails.username) return@forEach

                val targetUserEntity = redisCacheService.getCachedUser(usernameToClear)
                if (targetUserEntity != null && targetUserEntity.role == User.Role.TENANT) {
                     log.info("다른 TENANT 유저 캐시 삭제 제외: {}", usernameToClear)
                    return@forEach
                }

                redisCacheService.removeUserCache(usernameToClear)
                redisCacheService.removeAccessTokenCache(usernameToClear)
                redisCacheService.removeRefreshTokenCache(usernameToClear)
                clearedUsers.add(usernameToClear)
            }
            
            return ResponseEntity.ok(mapOf(
                "message" to "전체 사용자 캐시 삭제 완료 (본인 및 다른 테넌트 제외)",
                "clearedUserCount" to clearedUsers.size,
                "adminUser" to userDetails.username,
                "timestamp" to LocalDateTime.now()
            ))
        } catch (e: Exception) {
            log.error("전체 사용자 캐시 삭제 실패", e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "전체 캐시 삭제 실패: ${e.message}"))
        }
    }

    @PostMapping("/admin/refresh-token/{targetUsername}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
    fun refreshUserToken(
        @AuthenticationPrincipal userDetails: UserDetails,
        @PathVariable targetUsername: String
    ): ResponseEntity<Map<String, Any>> {
        log.info("특정 사용자 토큰 수동 갱신 요청: admin={}, target={} (요청자 역할: {})", userDetails.username, targetUsername, userDetails.authorities)

        try {
            log.info("특정 사용자 토큰 수동 갱신 요청: admin={}, target={}", userDetails.username, targetUsername)

            val performingUserRole = userDetails.authorities.mapNotNull { it.authority.removePrefix("ROLE_").let { roleName -> User.Role.values().find { it.name == roleName } } }.firstOrNull()
            val targetUserEntity = redisCacheService.getCachedUser(targetUsername)

            if (performingUserRole == User.Role.ADMIN && targetUserEntity != null && (targetUserEntity.role == User.Role.ADMIN || targetUserEntity.role == User.Role.TENANT)) {
                 log.warn("ADMIN 권한으로 다른 ADMIN/TENANT 토큰 갱신 시도: admin={}, target={}", userDetails.username, targetUsername)
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to "ADMIN은 다른 ADMIN 또는 TENANT의 토큰을 갱신할 수 없습니다."))
            }

            val newAccessToken = jwtTokenProvider.generateAccessToken(targetUsername)
            val newRefreshToken = jwtTokenProvider.generateRefreshToken(targetUsername)

            return ResponseEntity.ok(mapOf(
                "message" to "사용자 토큰 갱신 완료",
                "targetUser" to targetUsername,
                "newAccessToken" to newAccessToken,
                "newRefreshToken" to newRefreshToken,
                "adminUser" to userDetails.username,
                "timestamp" to LocalDateTime.now()
            ))
        } catch (e: Exception) {
            log.error("사용자 토큰 갱신 실패: target={}", targetUsername, e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "토큰 갱신 실패: ${e.message}"))
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