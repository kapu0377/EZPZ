package com.example.apiezpz.search.repository;

import com.example.apiezpz.search.entity.CategoryRank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRankRepository extends JpaRepository<CategoryRank, Long> {
    Optional<CategoryRank> findByCategory(String category);
    List<CategoryRank> findTop10ByOrderBySearchCountDesc();
} 