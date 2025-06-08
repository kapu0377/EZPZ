package com.example.apiezpz.auth.dto

import com.example.apiezpz.auth.entity.User

data class UpdateRoleRequest(
    val newRole: User.Role
) 