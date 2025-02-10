package org.zerock.api01.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.zerock.api01.domain.APIUser;
import org.zerock.api01.domain.Checklist;
import org.zerock.api01.repository.APIUserRepository;
import org.zerock.api01.repository.ChecklistRepository;

import java.util.List;

@RestController
@RequestMapping("/api/checklists")
public class ChecklistController {
    @Autowired
    private ChecklistRepository checklistRepository;

    @Autowired
    private APIUserRepository userRepository;

    // 특정 유저의 체크리스트 불러오기
    @GetMapping("/{userId}")
    public List<Checklist> getUserChecklist(@PathVariable Long userId) {
        return checklistRepository.findByUserId(userId);
    }

    // 체크리스트 추가
    @PostMapping("/{userId}")
    public Checklist addChecklist(@PathVariable Long userId, @RequestBody Checklist checklist) {
        APIUser user = userRepository.findById(userId).orElseThrow();
        checklist.setUser(user);
        return checklistRepository.save(checklist);
    }

    // 체크 상태 업데이트
    @PutMapping("/{id}")
    public Checklist updateChecklist(@PathVariable Long id, @RequestBody Checklist updatedChecklist) {
        Checklist checklist = checklistRepository.findById(id).orElseThrow();
        checklist.setIsChecked(updatedChecklist.getIsChecked());
        return checklistRepository.save(checklist);
    }

    // 항목 삭제
    @DeleteMapping("/{id}")
    public void deleteChecklist(@PathVariable Long id) {
        checklistRepository.deleteById(id);
    }
}

