package com.example.apiezpz.item.repository

import com.example.apiezpz.item.entity.Item
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface ItemRepository : JpaRepository<Item, Long> {
    // 영어 이름으로 유사 검색 (부분 일치)
    @Query("SELECT i FROM Item i WHERE LOWER(i.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    fun findByNameContainingIgnoreCase(@Param("name") name: String): List<Item>

    // 한글 이름으로 유사 검색 (부분 일치)
    @Query("SELECT i FROM Item i WHERE i.originalText LIKE CONCAT('%', :text, '%')")
    fun findByOriginalTextContaining(@Param("text") originalText: String): List<Item>

    // 통합 검색 (영어 이름 또는 한글 이름)
    @Query("SELECT i FROM Item i WHERE " +
            "LOWER(i.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "i.originalText LIKE CONCAT('%', :keyword, '%')")
    fun searchByKeyword(@Param("keyword") keyword: String): List<Item>
} 