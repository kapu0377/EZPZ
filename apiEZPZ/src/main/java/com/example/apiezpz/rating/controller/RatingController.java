package com.example.apiezpz.rating.controller;

import com.example.apiezpz.rating.domain.Airport;
import com.example.apiezpz.rating.domain.Rating;
import com.example.apiezpz.rating.dto.AirportDTO;
import com.example.apiezpz.rating.dto.RatingDTO;
import com.example.apiezpz.rating.repository.AirportRepository;
import com.example.apiezpz.rating.repository.RatingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/airports")
@CrossOrigin(origins = "http://localhost:3000")
public class RatingController {
    @Autowired
    private AirportRepository airportRepository;
    @Autowired
    private RatingRepository ratingRepository;

    @GetMapping
    public ResponseEntity<List<AirportDTO>> getAllAirports() {
        List<Airport> airports = airportRepository.findAll();
        List<AirportDTO> airportDTOs = airports.stream()
                .map(AirportDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(airportDTOs);
    }

    @PostMapping("/{airportId}/ratings")
    public ResponseEntity<Rating> createRating(
            @PathVariable Long airportId,
            @RequestBody RatingDTO ratingDTO) {

        Airport airport = airportRepository.findById(airportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Airport not found"));

        Rating rating = new Rating();
        rating.setAirport(airport);
        rating.setSatisfaction(ratingDTO.getSatisfaction());
        rating.setCleanliness(ratingDTO.getCleanliness());
        rating.setConvenience(ratingDTO.getConvenience());
        rating.setComment(ratingDTO.getComment());

        Rating savedRating = ratingRepository.save(rating);
        return ResponseEntity.ok(savedRating);
    }

    @GetMapping("/{airportId}/ratings/average")
    public ResponseEntity<Map<String, Double>> getAverageRatings(@PathVariable Long airportId) {
        List<Rating> ratings = ratingRepository.findByAirportId(airportId);

        if (ratings.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "avgSatisfaction", 0.0,
                    "avgCleanliness", 0.0,
                    "avgConvenience", 0.0
            ));
        }

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

        Map<String, Double> averages = new HashMap<>();
        averages.put("avgSatisfaction", avgSatisfaction);
        averages.put("avgCleanliness", avgCleanliness);
        averages.put("avgConvenience", avgConvenience);

        return ResponseEntity.ok(averages);
    }
}