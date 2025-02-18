package com.example.apiezpz.rating.service;

import com.example.apiezpz.rating.domain.Airport;
import com.example.apiezpz.rating.domain.Rating;
import com.example.apiezpz.rating.dto.RatingDTO;
import com.example.apiezpz.rating.repository.AirportRepository;
import com.example.apiezpz.rating.repository.RatingRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
@Log4j2
public class RatingServiceImpl implements RatingService {

    private final AirportRepository airportRepository;
    private final RatingRepository ratingRepository;

    @Override
    public Rating createRating(String airportCode, RatingDTO ratingDTO) {
        try {
            log.info("Creating rating for airport code: {}", airportCode);

            Airport airport = airportRepository.findByCode(airportCode)
                    .orElseThrow(() -> new IllegalArgumentException("공항을 찾을 수 없습니다: " + airportCode));

            Rating rating = Rating.builder()
                    .airport(airport)
                    .airportCode(airportCode)  // 추가된 부분
                    .satisfaction(ratingDTO.getSatisfaction())
                    .cleanliness(ratingDTO.getCleanliness())
                    .convenience(ratingDTO.getConvenience())
                    .build();

            log.info("Saving rating: {}", rating);
            return ratingRepository.save(rating);
        } catch (Exception e) {
            log.error("Error creating rating: ", e);
            throw new RuntimeException("평가 저장 중 오류가 발생했습니다", e);
        }
    }

    @Override
    @Transactional
    public Map<String, Double> getAverageRatings(String airportCode) {
        try {
            log.info("Fetching average ratings for airport code: {}", airportCode);

            Airport airport = airportRepository.findByCode(airportCode)
                    .orElseThrow(() -> new IllegalArgumentException("공항을 찾을 수 없습니다: " + airportCode));

            List<Rating> ratings = ratingRepository.findByAirport(airport);

            if (ratings.isEmpty()) {
                log.info("No ratings found for airport: {}", airportCode);
                return initializeEmptyAverages();
            }

            Map<String, Double> averages = calculateAverages(ratings);
            log.info("Calculated averages: {}", averages);
            return averages;
        } catch (Exception e) {
            log.error("Error getting average ratings: ", e);
            throw new RuntimeException("평균 평점 조회 중 오류가 발생했습니다", e);
        }
    }

    private Map<String, Double> calculateAverages(List<Rating> ratings) {
        Map<String, Double> averages = new HashMap<>();

        double avgSatisfaction = ratings.stream()
                .mapToInt(Rating::getSatisfaction)
                .average()
                .orElse(0.0);

        double avgCleanliness = ratings.stream()
                .mapToInt(Rating::getCleanliness)
                .average()
                .orElse(0.0);

        double avgConvenience = ratings.stream()
                .mapToInt(Rating::getConvenience)
                .average()
                .orElse(0.0);

        averages.put("avgSatisfaction", avgSatisfaction);
        averages.put("avgCleanliness", avgCleanliness);
        averages.put("avgConvenience", avgConvenience);

        return averages;
    }

    private Map<String, Double> initializeEmptyAverages() {
        Map<String, Double> emptyAverages = new HashMap<>();
        emptyAverages.put("avgSatisfaction", 0.0);
        emptyAverages.put("avgCleanliness", 0.0);
        emptyAverages.put("avgConvenience", 0.0);
        return emptyAverages;
    }
}