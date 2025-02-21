package com.example.apiezpz.rating.service;

import com.example.apiezpz.rating.domain.Rating;
import com.example.apiezpz.rating.dto.RatingDTO;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public interface RatingService {
    Rating createRating(String airportCode, RatingDTO ratingDTO);
    @Transactional
    Map<String, Double> getAverageRatings(String airportCode);
}