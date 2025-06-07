package com.example.apiezpz.search.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(
    name = "daily_rank", 
    uniqueConstraints = [UniqueConstraint(columnNames = ["category", "date"])]
)
data class DailyRank(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false)
    var category: String = "",

    @Column(nullable = false)
    var searchCount: Long = 0L,

    @Column(nullable = false)
    var date: LocalDate = LocalDate.now(),

    var createdAt: LocalDateTime? = null
) {
    @PrePersist
    protected fun onCreate() {
        this.createdAt = LocalDateTime.now()
    }
} 