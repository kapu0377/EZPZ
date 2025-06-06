package com.example.apiezpz.checklist.repository

import com.example.apiezpz.checklist.domain.ChecklistItem
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface ChecklistItemRepository : JpaRepository<ChecklistItem, Long> {
    fun findByCategoryIdOrderByNameAsc(categoryId: Long): List<ChecklistItem> // 특정 카테고리의 모든 아이템 조회 (이름순 정렬)
    fun existsByCategoryIdAndName(categoryId: Long, name: String): Boolean    // 특정 카테고리에 같은 이름의 아이템이 존재하는지 확인

    @Query("SELECT i FROM ChecklistItem i WHERE i.category.checklist.id = :checklistId")
    fun findByChecklistId(@Param("checklistId") checklistId: Long): List<ChecklistItem>   // 특정 체크리스트에 속한 모든 아이템 조회
} 