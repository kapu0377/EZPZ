package org.zerock.api01.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.zerock.api01.domain.Checklist;
import org.zerock.api01.repository.ChecklistRepository;

import java.util.List;

@RestController
@RequestMapping("/api/checklist")
public class ChecklistController {

    @Autowired
    private ChecklistRepository checklistRepository;

    // ✅ 모든 항목 조회
    @GetMapping
    public List<Checklist> getAllItems() {
        return checklistRepository.findAll();
    }

    // ✅ 항목 추가
    @PostMapping
    public Checklist addItem(@RequestBody Checklist item) {
        return checklistRepository.save(item);
    }

    // ✅ 항목 업데이트
    @PutMapping("/{id}")
    public Checklist updateItem(@PathVariable Long id, @RequestBody Checklist updatedItem) {
        Checklist item = checklistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setIsChecked(updatedItem.getIsChecked());
        return checklistRepository.save(item);
    }

    // ✅ 항목 삭제
    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable Long id) {
        checklistRepository.deleteById(id);
    }
}
