package com.example.apiezpz.auth.security

import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.annotation.Before
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.server.ResponseStatusException
import org.springframework.http.HttpStatus

@Aspect
@Component
class AdminOnlyAspect {
    
    private val log = LoggerFactory.getLogger(AdminOnlyAspect::class.java)

    @Before("@annotation(AdminOnly) || @within(AdminOnly)")
    fun checkAdminOnly() {
        val authentication = SecurityContextHolder.getContext().authentication
        
        log.info("AdminOnly 검증 시작")
        log.info("현재 인증 정보: {}", authentication)
        
        if (authentication == null || !authentication.isAuthenticated) {
            log.warn("인증되지 않은 사용자의 관리자 페이지 접근 시도")
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증이 필요합니다")
        }
        
        val username = authentication.name
        val authorities = authentication.authorities.map { it.authority }
        
        log.info("현재 로그인된 사용자: {}", username)
        log.info("사용자 권한: {}", authorities)
        
        // ADMIN 또는 TENANT 역할 확인
        val hasAdminRole = authorities.any { it == "ROLE_ADMIN" || it == "ROLE_TENANT" }
        
        if (!hasAdminRole) {
            log.warn("권한 없는 사용자의 관리자 페이지 접근 시도 - 사용자: {}, 권한: {}", username, authorities)
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 권한이 필요합니다")
        }
        
        log.info("관리자 권한 확인 완료 - 사용자: {}, 권한: {}", username, authorities)
    }
} 