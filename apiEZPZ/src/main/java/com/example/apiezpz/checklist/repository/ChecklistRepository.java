package com.example.apiezpz.checklist.repository;

import com.example.apiezpz.checklist.domain.Checklist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChecklistRepository extends JpaRepository<Checklist, Long> {
    List<Checklist> findByMemberId(Long memberId);
}
