package com.example.apiezpz.auth.dto

data class UserRoleInfo(
    val id: Long,
    val username: String,
    val email: String?,
    val currentRole: String
) 