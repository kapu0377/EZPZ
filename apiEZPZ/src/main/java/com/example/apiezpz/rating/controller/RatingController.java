package com.example.apiezpz.rating.controller;

import com.example.apiezpz.rating.domain.Rating;
import com.example.apiezpz.rating.dto.RatingDTO;
import com.example.apiezpz.rating.service.RatingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.Map;

@RestController
@RequestMapping("/api/airports")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Log4j2
public class RatingController {
    private final RatingService ratingService;

    @PostMapping("/{airportCode}/ratings")
    public ResponseEntity<?> createRating(
            @PathVariable(value = "airportCode", required = true) String airportCode,
            @RequestBody RatingDTO ratingDTO) {
        log.info("Received rating request for airport: {}", airportCode);
        try {
            Rating savedRating = ratingService.createRating(airportCode, ratingDTO);
            return ResponseEntity.ok(savedRating);
        } catch (IllegalArgumentException e) {
            log.error("Airport not found: {}", airportCode, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error creating rating", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("평가 저장 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @GetMapping("/{airportCode}/ratings/average")
    public ResponseEntity<?> getAverageRatings(
            @PathVariable(value = "airportCode", required = true) String airportCode) {
        log.info("Fetching average ratings for airport: {}", airportCode);
        try {
            Map<String, Double> averages = ratingService.getAverageRatings(airportCode);
            return ResponseEntity.ok(averages);
        } catch (IllegalArgumentException e) {
            log.error("Airport not found: {}", airportCode, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error fetching average ratings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("평균 평점 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}