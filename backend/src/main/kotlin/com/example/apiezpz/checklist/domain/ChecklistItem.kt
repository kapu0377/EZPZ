package com.example.apiezpz.checklist.domain

import jakarta.persistence.*

@Entity
@Table(name = "checklist_items")
data class ChecklistItem(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    
    @Column(nullable = false)
    var name: String = "",
    
    @Column(nullable = false)
    var checked: Boolean = false,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    var category: Category? = null
) 