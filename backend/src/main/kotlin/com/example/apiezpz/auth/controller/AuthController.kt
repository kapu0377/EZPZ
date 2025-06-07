package com.example.apiezpz.auth.controller

import com.example.apiezpz.auth.dto.LoginRequest
import com.example.apiezpz.auth.dto.SignUpRequest
import com.example.apiezpz.auth.dto.TokenRequest
import com.example.apiezpz.auth.service.AuthService
import com.example.apiezpz.auth.security.JwtTokenProvider
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.CookieValue
import org.springframework.http.ResponseEntity
import org.springframework.http.ResponseCookie
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
    private val jwtTokenProvider: JwtTokenProvider
) {
    
    private val log = LoggerFactory.getLogger(AuthController::class.java)

    @PostMapping("/signup")
    fun signup(@RequestBody request: SignUpRequest): ResponseEntity<String> {
        return try {
            authService.signup(request)
            ResponseEntity.ok("회원가입 성공")
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest, response: HttpServletResponse): ResponseEntity<*> {
        return try {
            log.info("로그인 요청 데이터: {}", request)
            val loginResult = authService.login(request)
            log.info("생성된 토큰 정보: {}", loginResult.token)
            
            val accessTokenCookie = ResponseCookie.from("accessToken", loginResult.accessToken)
                .httpOnly(true)
                .secure(false) // 개발 환경에서는 false로 설정 (HTTPS가 아니므로)
                .sameSite("Lax")
                .maxAge(jwtTokenProvider.accessTokenExpirationMinutes * 60)
                .path("/")
                .build()
            
            response.addHeader("Set-Cookie", accessTokenCookie.toString())
            
            ResponseEntity.ok().body(loginResult.token)
        } catch (e: Exception) {
            log.error("로그인 처리 중 오류 발생: ", e)
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/reissue")
    fun reissue(@RequestBody request: TokenRequest, 
                @CookieValue(value = "accessToken", required = false) accessToken: String?,
                response: HttpServletResponse): ResponseEntity<*> {
        log.info("토큰 재발급 요청: {}", request)
        
        // 액세스 토큰과 리프레시 토큰이 둘 다 없는 경우 체크
        val hasAccessToken = !accessToken.isNullOrEmpty() && jwtTokenProvider.validateToken(accessToken)
        val hasValidRefreshToken = !request.refreshToken.isBlank()
        
        // 둘 다 없는 경우 조용히 로그인 필요 상태 반환 (알럿 없이)
        if (!hasAccessToken && !hasValidRefreshToken) {
            log.info("액세스 토큰과 리프레시 토큰이 모두 없음 - 로그인 필요")
            return ResponseEntity.status(401).body(mapOf<String, Any>(
                "error" to "LOGIN_REQUIRED",
                "message" to "로그인이 필요합니다.",
                "silent" to true // 프론트엔드에서 알럿을 띄우지 않도록 플래그
            ))
        }
        
        // accessToken 쿠키에서 username 추출 시도
        val username = try {
            if (hasAccessToken) {
                val extractedUsername = jwtTokenProvider.getUsernameFromToken(accessToken!!)
                log.info("accessToken 쿠키에서 username 추출 성공: {}", extractedUsername)
                extractedUsername
            } else {
                // accessToken이 없거나 유효하지 않으면 요청 본문의 username 사용
                log.warn("accessToken이 유효하지 않음, 요청 본문 username 사용: '{}'", request.username)
                if (request.username.isBlank()) {
                    log.error("accessToken도 유효하지 않고 요청 본문의 username도 비어있음")
                    return ResponseEntity.status(400).body(mapOf<String, Any>(
                        "error" to "USERNAME_REQUIRED",
                        "message" to "사용자명을 확인할 수 없습니다."
                    ))
                }
                request.username
            }
        } catch (e: Exception) {
            log.error("토큰에서 username 추출 실패: {}", e.message, e)
            // 예외 발생 시에도 요청 본문의 username 사용
            if (request.username.isBlank()) {
                return ResponseEntity.status(400).body(mapOf<String, Any>(
                    "error" to "USERNAME_PARSE_ERROR",
                    "message" to "사용자명 추출에 실패했습니다."
                ))
            }
            request.username
        }
        
        try {
            val reissueResult = authService.reissue(username, request.refreshToken)
            
            val accessTokenCookie = ResponseCookie.from("accessToken", reissueResult.accessToken)
                .httpOnly(true)
                .secure(false) // 개발 환경에서는 false로 설정 (HTTPS가 아니므로)
                .sameSite("Lax")
                .maxAge(jwtTokenProvider.accessTokenExpirationMinutes * 60)
                .path("/")
                .build()
            
            response.addHeader("Set-Cookie", accessTokenCookie.toString())
            
            return ResponseEntity.ok().body(reissueResult.token)
        } catch (e: Exception) {
            log.error("토큰 재발급 실패: {}", e.message)
            return ResponseEntity.status(401).body(mapOf<String, Any>(
                "error" to "TOKEN_REISSUE_FAILED",
                "message" to (e.message ?: "토큰 재발급에 실패했습니다."),
                "requiresLogin" to true
            ))
        }
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    fun getUserProfile(@AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<*> {
        return try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body("인증되지 않은 사용자입니다.")
            }
            
            val username = userDetails.username
            // val user = userCacheService.getUserByUsername(username)
            
            val userInfo = mapOf(
                "authenticated" to true,
                "username" to username
            )
            
            ResponseEntity.ok(userInfo)
        } catch (e: Exception) {
            log.error("사용자 정보 조회 중 오류 발생", e)
            ResponseEntity.status(401).body("인증 실패")
        }
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    fun logout(@AuthenticationPrincipal userDetails: UserDetails,
               @CookieValue(value = "accessToken", required = false) accessToken: String?,
               response: HttpServletResponse): ResponseEntity<*> {
        return try {
            val username = userDetails.username
            log.info("로그아웃 요청 - username: {}", username)
            
            // 액세스 토큰이 있으면 블랙리스트에 추가
            if (!accessToken.isNullOrEmpty() && jwtTokenProvider.validateToken(accessToken)) {
                val remainingMinutes = jwtTokenProvider.getRemainingTimeInMinutes(accessToken)
                authService.blacklistAccessToken(accessToken, remainingMinutes)
                log.info("액세스 토큰 블랙리스트 추가 완료 - username: {}", username)
            }
            
            // 로그아웃 처리 (DB와 Redis에서 리프레시 토큰 삭제)
            authService.logout(username)
            
            // 쿠키 삭제
            val deleteCookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(false) // 개발 환경에서는 false로 설정 (HTTPS가 아니므로)
                .sameSite("Lax")
                .maxAge(0)
                .path("/")
                .build()
            
            response.addHeader("Set-Cookie", deleteCookie.toString())
            
            ResponseEntity.ok(mapOf("message" to "로그아웃 성공"))
        } catch (e: Exception) {
            log.error("로그아웃 처리 중 오류 발생", e)
            ResponseEntity.status(500).body(mapOf("error" to "로그아웃 실패"))
        }
    }
} 