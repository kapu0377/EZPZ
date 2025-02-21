package com.example.apiezpz.checklist.repository;

import com.example.apiezpz.checklist.domain.Checklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChecklistRepository extends JpaRepository<Checklist, Long> {
    List<Checklist> findByUsername(String username); // username을 기준으로 체크리스트 조회

//    @Query("SELECT c FROM Checklist c LEFT JOIN FETCH c.categories WHERE c.member.id = :memberId")
//    List<Checklist> findByMemberIdWithCategories(@Param("memberId") Long memberId);    //체크리스트 조회 시 카테고리도 함께 로드
}
