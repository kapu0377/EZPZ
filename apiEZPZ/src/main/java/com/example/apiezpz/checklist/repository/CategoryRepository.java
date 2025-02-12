package com.example.apiezpz.checklist.repository;

import com.example.apiezpz.checklist.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    // 체크리스트별 카테고리 조회 (아이템 포함)
    List<Category> findByChecklistId(Long checklistId);
}
