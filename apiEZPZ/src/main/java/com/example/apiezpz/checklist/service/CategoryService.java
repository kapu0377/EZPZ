package com.example.apiezpz.checklist.service;

import com.example.apiezpz.checklist.dto.CategoryDTO;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional
public interface CategoryService {
    void addCategory(Long checklistId, CategoryDTO categoryDTO);    //카테고리 추가(중복 방지)
    List<CategoryDTO> getCategoriesByChecklist(Long checklistId); //체크리스트별 카테고리 목록 조회(아이템 포함)
    void updateCategory(Long categoryId, String newName);  //카테고리 수정(이름 변경)
    void deleteCategory(Long checklistId);  //카테고리 삭제
}