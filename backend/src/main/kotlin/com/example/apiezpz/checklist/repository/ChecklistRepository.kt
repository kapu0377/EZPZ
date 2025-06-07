package com.example.apiezpz.checklist.repository

import com.example.apiezpz.checklist.domain.Checklist
import jakarta.transaction.Transactional
import org.springframework.data.jpa.repository.JpaRepository

interface ChecklistRepository : JpaRepository<Checklist, Long> {
    fun findByUsername(username: String): List<Checklist> // username을 기준으로 체크리스트 조회
    
    // 회원의 username을 기준으로 체크리스트 삭제
    @Transactional
    fun deleteByUsername(username: String)
} 