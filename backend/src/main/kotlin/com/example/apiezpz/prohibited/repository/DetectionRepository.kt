package com.example.apiezpz.prohibited.repository

import com.example.apiezpz.prohibited.domain.Detection
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DetectionRepository : JpaRepository<Detection, Long> {
    // DISTINCT를 사용하여 공항명 기준으로 그룹화
    @Query("SELECT DISTINCT a.airportName FROM Detection a")
    fun findDistinctAirportNames(): List<String>

    fun findByAirportName(airportName: String): List<Detection>
} 