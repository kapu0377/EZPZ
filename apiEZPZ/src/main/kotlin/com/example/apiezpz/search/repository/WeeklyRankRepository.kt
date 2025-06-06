package com.example.apiezpz.search.repository

import com.example.apiezpz.search.entity.WeeklyRank
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface WeeklyRankRepository : JpaRepository<WeeklyRank, Long> {
    fun findByRecordedDate(date: LocalDate): List<WeeklyRank>
    fun findByStartDateBetween(startDate: LocalDate, endDate: LocalDate): List<WeeklyRank>
    fun findTop10ByOrderBySearchCountDesc(): List<WeeklyRank>
} 