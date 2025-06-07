package com.example.apiezpz.auth.repository

import com.example.apiezpz.auth.entity.RefreshToken
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.*

interface RefreshTokenRepository : JpaRepository<RefreshToken, String> {
    fun findByUsername(username: String): Optional<RefreshToken>
    
    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.username = :username")
    fun deleteByUsername(@Param("username") username: String)
} 