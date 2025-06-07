package com.example.apiezpz.search.repository

import com.example.apiezpz.search.entity.DailyRank
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.*

@Repository
interface DailyRankRepository : JpaRepository<DailyRank, Long> {
    fun findByCategoryAndDate(category: String, date: LocalDate): Optional<DailyRank>
    fun findByDate(date: LocalDate): List<DailyRank>
    fun findByDateBetween(startDate: LocalDate, endDate: LocalDate): List<DailyRank>
} 