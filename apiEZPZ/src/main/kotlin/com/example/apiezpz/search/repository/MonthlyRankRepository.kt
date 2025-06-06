package com.example.apiezpz.search.repository

import com.example.apiezpz.search.entity.MonthlyRank
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface MonthlyRankRepository : JpaRepository<MonthlyRank, Long> {
    fun findByStartDateLessThanEqualAndEndDateGreaterThanEqual(today1: LocalDate, today2: LocalDate): List<MonthlyRank>
    fun findByStartDateBetween(startDate: LocalDate, endDate: LocalDate): List<MonthlyRank>
    fun findTop10ByOrderBySearchCountDesc(): List<MonthlyRank>
} 