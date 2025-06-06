package com.example.apiezpz.auth.controller

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/user")
class UserInfoController {
    
    @Value("\${admin.user.id}")
    private lateinit var adminUserId: String

    @GetMapping("/info")
    fun getCurrentUserInfo(@AuthenticationPrincipal userDetails: UserDetails?): ResponseEntity<Map<String, Any>> {
        if (userDetails == null) {
            return ResponseEntity.ok(mapOf(
                "authenticated" to false,
                "isAdmin" to false
            ))
        }
        
        val username = userDetails.username
        val isAdmin = username == adminUserId
        
        return ResponseEntity.ok(mapOf(
            "authenticated" to true,
            "username" to username,
            "isAdmin" to isAdmin,
            "adminUserId" to adminUserId
        ))
    }
} 