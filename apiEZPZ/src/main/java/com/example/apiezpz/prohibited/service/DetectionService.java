package com.example.apiezpz.prohibited.service;

import com.example.apiezpz.prohibited.domain.Detection;
import com.example.apiezpz.prohibited.repository.DetectionRepository;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Getter
public class DetectionService {
    @Autowired
    private DetectionRepository detectionRepository;

    public List<String> getAllAirportNames() {
        return detectionRepository.findDistinctAirportNames();
    }

    public List<Detection> getDetectionsByAirportName(String airportName) {
        return detectionRepository.findByAirportName(airportName);
    }

    public List<Detection> getAirportSummary() {
        List<String> airportNames = detectionRepository.findDistinctAirportNames();
        return airportNames.stream().map(name -> {
            int totalCount = detectionRepository.findByAirportName(name)
                    .stream().mapToInt(Detection::getDetectionCount).sum();
            Detection summary = new Detection();
            summary.setAirportName(name);
            summary.setDetectionCount(totalCount);
            return summary;
        }).collect(Collectors.toList());
    }
}
