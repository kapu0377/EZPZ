package com.example.apiezpz.auth.controller

import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/user")
class UserInfoController {

    @GetMapping("/info")
    fun getCurrentUserInfo(@AuthenticationPrincipal userDetails: UserDetails?): ResponseEntity<Map<String, Any>> {
        if (userDetails == null) {
            return ResponseEntity.ok(mapOf(
                "authenticated" to false,
                "isAdmin" to false,
                "isTenant" to false,
                "role" to "GUEST"
            ))
        }
        
        val username = userDetails.username
        val authorities = userDetails.authorities.map { it.authority }
        
        // 역할 정보 추출 (ROLE_ 접두사 제거)
        val roles = authorities.filter { it.startsWith("ROLE_") }
            .map { it.removePrefix("ROLE_") }
        
        val isAdmin = roles.contains("ADMIN")
        val isTenant = roles.contains("TENANT")
        val isUser = roles.contains("USER")
        
        // 가장 높은 권한을 primary role로 설정
        val primaryRole = when {
            isTenant -> "TENANT"
            isAdmin -> "ADMIN"
            isUser -> "USER"
            else -> "GUEST"
        }
        
        return ResponseEntity.ok(mapOf(
            "authenticated" to true,
            "username" to username,
            "isAdmin" to isAdmin,
            "isTenant" to isTenant,
            "role" to primaryRole,
            "authorities" to authorities
        ))
    }
} 