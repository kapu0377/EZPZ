package com.example.apiezpz.auth.dto

data class TokenRequest(
    var refreshToken: String = "",
    var username: String = "",
    var accessToken: String = ""
) 