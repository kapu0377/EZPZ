package com.example.apiezpz.checklist.controller;

import com.example.apiezpz.checklist.dto.CategoryDTO;
import com.example.apiezpz.checklist.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Log4j2
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    // 체크리스트에 카테고리 추가
    @PostMapping("/{checklistId}")
    public ResponseEntity<Void> addCategory(@PathVariable Long checklistId, @RequestBody CategoryDTO categoryDTO) {
        categoryService.addCategory(checklistId, categoryDTO);
        return ResponseEntity.ok().build();
    }

    // 체크리스트별 카테고리 목록 조회
    @GetMapping("/list/{checklistId}")
    public ResponseEntity<List<CategoryDTO>> getCategoriesByChecklist(@PathVariable Long checklistId) {
        List<CategoryDTO> categories = categoryService.getCategoriesByChecklist(checklistId);
        return ResponseEntity.ok(categories);
    }

    // 카테고리 이름 수정
    @PutMapping("/{categoryId}")
    public ResponseEntity<Void> updateCategory(@PathVariable Long categoryId,  @RequestBody CategoryDTO categoryDTO) {
        categoryService.updateCategory(categoryId, categoryDTO.getName());
        return ResponseEntity.ok().build();
    }

    // 카테고리 삭제
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long categoryId) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok().build();
    }
}
