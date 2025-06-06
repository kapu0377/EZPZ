package com.example.apiezpz.search.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "monthly_rank")
data class MonthlyRank(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    var category: String? = null,

    var searchCount: Long? = null,

    var startDate: LocalDate? = null,

    var endDate: LocalDate? = null,

    var createdAt: LocalDateTime? = null
) {
    @PrePersist
    protected fun onCreate() {
        this.createdAt = LocalDateTime.now()
    }
} 