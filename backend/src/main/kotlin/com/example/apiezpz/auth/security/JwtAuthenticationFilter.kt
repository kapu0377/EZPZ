package com.example.apiezpz.auth.security

import com.example.apiezpz.auth.service.UserCacheService
import com.example.apiezpz.auth.service.RedisCacheService
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.util.StringUtils
import org.springframework.web.filter.OncePerRequestFilter
import java.io.IOException

class JwtAuthenticationFilter(
    private val tokenProvider: JwtTokenProvider,
    private val customUserDetailsService: CustomUserDetailsService,
    private val userCacheService: UserCacheService,
    private val redisCacheService: RedisCacheService
) : OncePerRequestFilter() {

    companion object {
        private val log = LoggerFactory.getLogger(JwtAuthenticationFilter::class.java)
    }

    @Throws(ServletException::class, IOException::class)
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val requestUri = request.requestURI
        log.info("JWT 필터 처리 시작 - URI: {}", requestUri)

        try {
            val token = resolveToken(request)
            log.info("토큰 추출 결과 - URI: {}, 토큰 존재: {}", requestUri, token != null)
            
            if (token != null && token.length > 10) {
                log.info("토큰 앞부분: {}...", token.substring(0, 10))
            }

            if (StringUtils.hasText(token)) {
                log.info("토큰 검증 시작 - URI: {}", requestUri)

                if (tokenProvider.validateToken(token!!)) {
                    log.info("토큰이 유효함 - URI: {}", requestUri)

                    // 토큰이 블랙리스트에 있는지 확인
                    if (redisCacheService.isTokenBlacklisted(token)) {
                        log.warn("블랙리스트에 있는 토큰입니다 - URI: {}", requestUri)
                    } else {
                        val username = tokenProvider.getUsernameFromToken(token)
                        log.info("토큰에서 추출한 username: {} - URI: {}", username, requestUri)

                        if (username != null) {
                            // accessToken이 유효한 경우에만 사용자 정보 조회 (캐시 사용하지 않음)
                            val userDetails: UserDetails = customUserDetailsService.loadUserByUsername(username)
                            val authentication = UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.authorities
                            )
                            SecurityContextHolder.getContext().authentication = authentication
                            log.info("Security Context에 '{}' 인증 정보를 저장했습니다 (토큰 기반), uri: {}", username, requestUri)
                        } else {
                            log.warn("유효한 토큰이지만 username(subject)을 추출할 수 없습니다 - URI: {}", requestUri)
                        }
                    }
                } else {
                    log.warn("유효하지 않은 JWT 토큰입니다 - URI: {}", requestUri)
                }
            } else {
                log.warn("요청에 JWT 토큰이 없습니다 - URI: {}", requestUri)
            }
        } catch (ex: Exception) {
            log.error("JWT 토큰 처리 중 오류 발생 - URI: {}", requestUri, ex)
        } finally {
            filterChain.doFilter(request, response)
        }
    }

    private fun resolveToken(request: HttpServletRequest): String? {
        log.info("토큰 추출 시작 - URI: {}", request.requestURI)
        
        // 쿠키에서 accessToken 우선 확인 (HttpOnly 쿠키 방식)
        val cookies = request.cookies
        log.info("쿠키 개수: {}", cookies?.size ?: 0)
        
        if (cookies != null) {
            for (cookie in cookies) {
                log.info("쿠키 발견: {} = {}", cookie.name, if (cookie.name == "accessToken") "***토큰***" else cookie.value)
                if ("accessToken" == cookie.name) {
                    log.info("accessToken 쿠키에서 토큰 발견")
                    return cookie.value
                }
            }
        }
        
        // 쿠키에 없으면 Authorization 헤더에서 Bearer 토큰 확인 (백업용)
        val bearerToken = request.getHeader("Authorization")
        log.info("Authorization 헤더: {}", if (bearerToken != null) "Bearer ***" else "없음")
        
        return if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            log.info("Authorization 헤더에서 토큰 발견")
            bearerToken.substring(7)
        } else {
            log.info("토큰을 찾을 수 없음")
            null
        }
    }
} 