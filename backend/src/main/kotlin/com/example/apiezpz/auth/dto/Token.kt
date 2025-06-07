package com.example.apiezpz.auth.dto

data class Token(
    val refreshToken: String,
    val accessTokenExpiresIn: Long
) 