package com.example.apiezpz.checklist.service

import com.example.apiezpz.checklist.dto.ChecklistDTO
import org.springframework.transaction.annotation.Transactional

@Transactional
interface ChecklistService {
    fun registerChecklist(username: String, checklistDTO: ChecklistDTO) // username 기반 체크리스트 등록
    fun readChecklist(id: Long): ChecklistDTO    // 특정 체크리스트 조회
    fun list(username: String): List<ChecklistDTO> // username 기반 체크리스트 목록 조회
    fun removeChecklist(username: String, id: Long)   //  username 기반 체크리스트 삭제
    fun modifyChecklist(username: String, checklistDTO: ChecklistDTO) //  username 기반 체크리스트 수정
    fun resetPacking(checklistId: Long) // 특정 체크리스트의 체크 상태 초기화
} 