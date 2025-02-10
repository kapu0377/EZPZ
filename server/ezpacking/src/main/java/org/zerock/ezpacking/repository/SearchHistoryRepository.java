package org.zerock.ezpacking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.zerock.ezpacking.domain.entity.SearchHistory;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    Optional<SearchHistory> findByKeyword(String keyword);

    // Object[] 배열 대신 SearchHistory 엔티티를 직접 반환하도록 수정
    List<SearchHistory> findTop5ByOrderByCountDesc();
}