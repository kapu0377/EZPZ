package com.example.apiezpz.auth.entity

import jakarta.persistence.*

@Entity
data class RefreshToken(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    
    @Column(unique = true, nullable = false)
    var username: String = "",
    
    @Column(nullable = false)
    var token: String = "",
    
    @Column(nullable = false)
    var expirationTime: Long = 0,
    
    @Column(nullable = false)
    var isRevoked: Boolean = false,
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    var user: User? = null
) 