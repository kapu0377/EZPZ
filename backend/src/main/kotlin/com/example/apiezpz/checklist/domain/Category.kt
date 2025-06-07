package com.example.apiezpz.checklist.domain

import jakarta.persistence.*

@Entity
@Table(name = "categories")
data class Category(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    
    @Column(nullable = false)
    var name: String = "",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_id")
    var checklist: Checklist? = null,

    @OneToMany(mappedBy = "category", cascade = [CascadeType.ALL], orphanRemoval = true)
    var checklistItems: MutableList<ChecklistItem> = mutableListOf()
) {
    // 아이템 추가 편의 메서드
    fun addItem(checklistItem: ChecklistItem) {
        checklistItems.add(checklistItem)
        checklistItem.category = this
    }

    // 아이템 삭제 편의 메서드
    fun removeItem(checklistItem: ChecklistItem) {
        checklistItems.remove(checklistItem)
        checklistItem.category = null
    }
} 