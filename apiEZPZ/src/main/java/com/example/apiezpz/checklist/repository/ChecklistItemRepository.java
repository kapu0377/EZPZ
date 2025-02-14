package com.example.apiezpz.checklist.repository;

import com.example.apiezpz.checklist.domain.ChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {
    List<ChecklistItem> findByCategoryIdOrderByNameAsc(Long categoryId); // 특정 카테고리의 모든 아이템 조회 (이름순 정렬)
    boolean existsByCategoryIdAndName(Long categoryId, String name);    // 특정 카테고리에 같은 이름의 아이템이 존재하는지 확인

    @Query("SELECT i FROM ChecklistItem i WHERE i.category.checklist.id = :checklistId")
    List<ChecklistItem> findByChecklistId(@Param("checklistId") Long checklistId);   // 특정 체크리스트에 속한 모든 아이템 조회
}
