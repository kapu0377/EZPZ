package com.example.apiezpz.rating.repository;

import com.example.apiezpz.rating.domain.Airport;
import com.example.apiezpz.rating.domain.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByAirport(Airport airport);
}
