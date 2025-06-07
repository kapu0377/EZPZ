package com.example.apiezpz.prohibited.domain

import jakarta.persistence.*

@Entity
@Table(name = "detection")
data class Detection(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    var airportName: String? = null, // 공항명 (청주공항 등)

    var category: String? = null, // 적발된 물품 유형 (날카로운 물체, 공구류 등)

    var detectionCount: Int = 0 // 적발 건수
) 