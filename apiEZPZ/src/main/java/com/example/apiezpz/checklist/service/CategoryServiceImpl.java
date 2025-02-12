package com.example.apiezpz.checklist.service;

import com.example.apiezpz.checklist.domain.Category;
import com.example.apiezpz.checklist.domain.Checklist;
import com.example.apiezpz.checklist.dto.CategoryDTO;
import com.example.apiezpz.checklist.repository.CategoryRepository;
import com.example.apiezpz.checklist.repository.ChecklistRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final ChecklistRepository checklistRepository;
    private final ModelMapper modelMapper;

    // ✅ 1️⃣ 카테고리 추가 (체크리스트와 연결)
    @Override
    public void addCategory(Long checklistId, CategoryDTO categoryDTO) {
        Checklist checklist = checklistRepository.findById(checklistId)
                .orElseThrow(() -> new RuntimeException("해당 체크리스트가 존재하지 않습니다."));

        Category category = modelMapper.map(categoryDTO, Category.class);
        category.setChecklist(checklist); // 체크리스트와 연결
        categoryRepository.save(category);
    }

    // ✅ 2️⃣ 체크리스트별 카테고리 목록 조회 (아이템 포함)
    @Override
    public List<CategoryDTO> getCategoriesByChecklist(Long checklistId) {
        List<Category> categories = categoryRepository.findByChecklistId(checklistId);
        return categories.stream()
                .map(category -> modelMapper.map(category, CategoryDTO.class))
                .collect(Collectors.toList());
    }

    // ✅ 3️⃣ 카테고리 수정 (이름 변경)
    @Override
    public void updateCategory(Long categoryId, String newName) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("해당 카테고리가 존재하지 않습니다."));
        category.setName(newName);
    }

    // ✅ 4️⃣ 카테고리 삭제 (연관된 아이템도 함께 삭제)
    @Override
    public void deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("해당 카테고리가 존재하지 않습니다."));
        categoryRepository.delete(category);
    }
}
