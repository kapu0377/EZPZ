package org.zerock.ezpacking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.zerock.ezpacking.domain.entity.Detection;

import java.util.List;

@Repository
public interface DetectionRepository extends JpaRepository<Detection, Long> {
    @Query("SELECT d FROM Detection d ORDER BY d.count DESC LIMIT 5")
    List<Detection> findTop5ByOrderByCountDesc();
}