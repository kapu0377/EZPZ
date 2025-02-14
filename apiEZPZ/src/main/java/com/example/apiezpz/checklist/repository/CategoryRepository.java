package com.example.apiezpz.checklist.repository;

import com.example.apiezpz.checklist.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByChecklistId(Long checklistId); // 체크리스트별 카테고리 조회 (아이템 포함)
    boolean existsByChecklistIdAndName(Long checklistId, String name);  //체크리스트별 카테고리명 존재 여부 확인
}
