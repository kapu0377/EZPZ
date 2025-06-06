package com.example.apiezpz.prohibited.domain

import jakarta.persistence.*

@Entity
@Table(name = "prohibit")
data class Prohibit(
    @Column(name = "GUBUN")
    var gubun: String? = null,
    
    @Column(name = "CARRY_BAN")
    var carryBan: String? = null,
    
    @Column(name = "CABIN")
    var cabin: String? = null,
    
    @Column(name = "TRUST")
    var trust: String? = null,
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SEQ")
    var seq: Long? = null
) 