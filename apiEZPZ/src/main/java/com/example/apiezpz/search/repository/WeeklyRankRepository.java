package com.example.apiezpz.search.repository;

import com.example.apiezpz.search.entity.WeeklyRank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WeeklyRankRepository extends JpaRepository<WeeklyRank, Long> {
    List<WeeklyRank> findByRecordedDate(LocalDate date);

    List<WeeklyRank> findByStartDateBetween(LocalDate startDate, LocalDate endDate);


}