package com.example.apiezpz.rating.repository;

import com.example.apiezpz.rating.domain.Airport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AirportRepository extends JpaRepository<Airport, Long> {
    // 기본적인 CRUD 메서드는 JpaRepository에서 제공

    // 공항 이름으로 검색하는 메서드 추가
//    Optional<Airport> findByName(String name);
    // 공항 코드로 검색하는 메서드 추가
//    Optional<Airport> findByCode(String code);
    // 공항 이름에 특정 문자열이 포함된 공항들 검색
//    List<Airport> findByNameContaining(String keyword);
}
