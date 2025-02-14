package com.example.apiezpz.checklist.service;


import com.example.apiezpz.checklist.dto.ChecklistDTO;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional
public interface ChecklistService {
    void registerChecklist(Long memberId, ChecklistDTO checklistDTO);  // 회원 ID와 함께 체크리스트 등록
    ChecklistDTO readChecklist(Long id);    // 특정 체크리스트 조회
    List<ChecklistDTO> list(Long memberId); // 회원 ID로 체크리스트 목록 조회
    void removeChecklist(Long memberId, Long id);   // 체크리스트 삭제 (회원 ID도 추가하여 검증)
    void modifyChecklist(Long memberId, ChecklistDTO checklistDTO); // 체크리스트 수정 (회원 ID도 추가하여 검증)
    void resetPacking(Long checklistId); // 특정 체크리스트의 체크 상태 초기화
}
