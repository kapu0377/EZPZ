package com.example.apiezpz.rating.repository

import com.example.apiezpz.rating.domain.Airport
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface AirportRepository : JpaRepository<Airport, Long> {
    fun findByCode(code: String): Optional<Airport>
} 