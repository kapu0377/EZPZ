package com.example.apiezpz.search.repository;

import com.example.apiezpz.search.entity.DailyRank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyRankRepository extends JpaRepository<DailyRank, Long> {

    Optional<DailyRank> findByCategoryAndDate(String category, LocalDate date);

    List<DailyRank> findByDate(LocalDate date);
    List<DailyRank> findByDateBetween(LocalDate startDate, LocalDate endDate);


}
