package com.example.apiezpz.search.repository;

import com.example.apiezpz.auth.entity.User;
import com.example.apiezpz.search.entity.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    List<SearchHistory> findByUserOrderBySearchDateDesc(User user);
    List<SearchHistory> findByCategoryOrderBySearchDateDesc(String category);
} 