package com.example.apiezpz.rating.domain

import jakarta.persistence.*

@Entity
@Table(name = "airport")
data class Airport(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(unique = true, nullable = false)
    var name: String = "",
    
    @Column(nullable = false)
    var code: String = ""
) 