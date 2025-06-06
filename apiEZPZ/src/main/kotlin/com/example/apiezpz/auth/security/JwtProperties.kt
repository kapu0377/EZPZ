package com.example.apiezpz.auth.security

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@ConfigurationProperties(prefix = "jwt")
@Component
data class JwtProperties(
    var secret: String = "",
    var accessTokenExpirationMinutes: Long = 0,
    var refreshTokenExpirationMinutes: Long = 0
) 