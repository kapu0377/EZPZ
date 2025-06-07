package com.example.apiezpz.item.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime

@Entity
@Table(name = "items")
@EntityListeners(AuditingEntityListener::class)
data class Item(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false)
    var name: String = "",

    @Column(nullable = false)
    var category: String = "",

    @Column(columnDefinition = "TEXT")
    var originalText: String? = null,

    @Column(nullable = false)
    var isAllowed: Boolean = false,

    @Column(nullable = false)
    var isConditional: Boolean = false,

    @Column
    var restrictions: String? = null,

    @CreatedDate
    var createdAt: LocalDateTime? = null,

    var createdDate: LocalDateTime? = null,
    
    @LastModifiedDate
    var updatedAt: LocalDateTime? = null
) 