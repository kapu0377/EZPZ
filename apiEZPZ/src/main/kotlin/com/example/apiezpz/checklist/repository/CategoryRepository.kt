package com.example.apiezpz.checklist.repository

import com.example.apiezpz.checklist.domain.Category
import org.springframework.data.jpa.repository.JpaRepository

interface CategoryRepository : JpaRepository<Category, Long> {
    fun findByChecklistId(checklistId: Long): List<Category> // 체크리스트별 카테고리 조회 (아이템 포함)
    fun existsByChecklistIdAndName(checklistId: Long, name: String): Boolean  // 체크리스트별 카테고리명 존재 여부 확인
} 