package com.example.apiezpz.search.repository;

import com.example.apiezpz.search.entity.MonthlyRank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MonthlyRankRepository extends JpaRepository<MonthlyRank, Long> {
    List<MonthlyRank> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate today1, LocalDate today2);
    List<MonthlyRank> findByStartDateBetween(LocalDate startDate, LocalDate endDate);

}
