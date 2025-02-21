package com.example.apiezpz.checklist.service;


import com.example.apiezpz.checklist.dto.ChecklistDTO;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional
public interface ChecklistService {
    void registerChecklist(String username, ChecklistDTO checklistDTO); // ✅ username 기반 체크리스트 등록
    ChecklistDTO readChecklist(Long id);    // 특정 체크리스트 조회
    List<ChecklistDTO> list(String username); // ✅ username 기반 체크리스트 목록 조회
    void removeChecklist(String username, Long id);   // ✅ username 기반 체크리스트 삭제
    void modifyChecklist(String username, ChecklistDTO checklistDTO); // ✅ username 기반 체크리스트 수정
    void resetPacking(Long checklistId); // 특정 체크리스트의 체크 상태 초기화
}
