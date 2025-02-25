package com.example.apiezpz.checklist.repository;

import com.example.apiezpz.checklist.domain.Checklist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChecklistRepository extends JpaRepository<Checklist, Long> {
    List<Checklist> findByUsername(String username); // username을 기준으로 체크리스트 조회
}
