package org.zerock.ezpacking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.ezpacking.domain.entity.Item;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    // 영어 이름으로 유사 검색 (부분 일치)
    @Query("SELECT i FROM Item i WHERE LOWER(i.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Item> findByNameContainingIgnoreCase(@Param("name") String name);

    // 한글 이름으로 유사 검색 (부분 일치)
    @Query("SELECT i FROM Item i WHERE i.originalText LIKE CONCAT('%', :text, '%')")
    List<Item> findByOriginalTextContaining(@Param("text") String originalText);

    // 통합 검색 (영어 이름 또는 한글 이름)
    @Query("SELECT i FROM Item i WHERE " +
            "LOWER(i.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "i.originalText LIKE CONCAT('%', :keyword, '%')")
    List<Item> searchByKeyword(@Param("keyword") String keyword);
}