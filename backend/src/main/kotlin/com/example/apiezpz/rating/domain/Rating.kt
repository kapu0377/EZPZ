package com.example.apiezpz.rating.domain

import jakarta.persistence.*

@Entity
@Table(name = "ratings")
data class Rating(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "airport_id", nullable = false)
    var airport: Airport? = null,
    
    @Column(name = "airport_code", nullable = false)
    var airportCode: String = "",

    @Column(nullable = false)
    var satisfaction: Int = 0,
    
    @Column(nullable = false)
    var cleanliness: Int = 0,
    
    @Column(nullable = false)
    var convenience: Int = 0
) {
    @PrePersist
    fun prePersist() {
        airport?.let {
            this.airportCode = it.code
        }
    }
} 