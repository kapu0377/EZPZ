package com.example.apiezpz.rating.repository

import com.example.apiezpz.rating.domain.Airport
import com.example.apiezpz.rating.domain.Rating
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface RatingRepository : JpaRepository<Rating, Long> {
    fun findByAirport(airport: Airport): List<Rating>
} 