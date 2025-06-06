package com.example.apiezpz.checklist.domain

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "checklists")
data class Checklist(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    
    var title: String? = null,
    
    var departureDate: LocalDate? = null,    // 출발일
    
    var returnDate: LocalDate? = null,   // 도착일

    @Column(nullable = false)
    var username: String = "", // 로그인한 사용자의 username 저장

    @OneToMany(mappedBy = "checklist", cascade = [CascadeType.ALL], orphanRemoval = true)
    var categories: MutableList<Category> = mutableListOf()
) 