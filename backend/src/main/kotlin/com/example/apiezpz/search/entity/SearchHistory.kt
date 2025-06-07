package com.example.apiezpz.search.entity

import com.example.apiezpz.auth.entity.User
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
data class SearchHistory(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    
    @Column(nullable = false)
    var category: String = "",
    
    @Column(nullable = false)
    var keyword: String = "",
    
    @Column(nullable = false)
    var searchDate: LocalDateTime = LocalDateTime.now(),
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    var user: User? = null
) {
    @PrePersist
    protected fun onCreate() {
        searchDate = LocalDateTime.now()
    }
} 