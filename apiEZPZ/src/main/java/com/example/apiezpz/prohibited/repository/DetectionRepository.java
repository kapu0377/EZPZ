package com.example.apiezpz.prohibited.repository;

import com.example.apiezpz.prohibited.domain.Detection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DetectionRepository extends JpaRepository<Detection, Long> {
    // DISTINCT를 사용하여 공항명 기준으로 그룹화
    @Query("SELECT DISTINCT a.airportName FROM Detection a")
    List<String> findDistinctAirportNames();

    List<Detection> findByAirportName(String airportName);
}
