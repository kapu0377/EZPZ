package com.example.apiezpz.search.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.apiezpz.auth.entity.User;
import com.example.apiezpz.search.entity.SearchHistory;

import jakarta.transaction.Transactional;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    List<SearchHistory> findByUserOrderBySearchDateDesc(User user);
    List<SearchHistory> findByCategoryOrderBySearchDateDesc(String category);
    List<SearchHistory> findByUserAndSearchDateBetweenOrderBySearchDateDesc(User user, LocalDateTime startDate, LocalDateTime endDate);
    
    List<SearchHistory> findByUserAndSearchDateAfterOrderBySearchDateDesc(User user, LocalDateTime startDate);
    
    List<SearchHistory> findByUserAndKeywordContainingOrderBySearchDateDesc(User user, String keyword);
    
    List<SearchHistory> findByUserAndKeywordIsNotNullAndKeywordNotOrderBySearchDateDesc(User user, String emptyString);
    
    List<SearchHistory> findByUserAndSearchDateBetweenAndKeywordIsNotNullAndKeywordNotOrderBySearchDateDesc(
            User user, LocalDateTime startDate, LocalDateTime endDate, String emptyString);

    @Transactional
    void deleteByUser(User user);
}