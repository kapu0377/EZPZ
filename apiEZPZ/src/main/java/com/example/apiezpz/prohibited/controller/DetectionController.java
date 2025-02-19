package com.example.apiezpz.prohibited.controller;

import com.example.apiezpz.prohibited.domain.Detection;
import com.example.apiezpz.prohibited.service.DetectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/airport-detections")
public class DetectionController {
    @Autowired
    private DetectionService detectionService;

    // ✅ 중복 제거된 공항 목록 반환
    @GetMapping("/distinct")
    public List<Detection> getAirportSummary() {
        return detectionService.getAirportSummary();
    }

    // ✅ 특정 공항의 적발 내역 가져오기
    @GetMapping("/name/{airportName}")
    public List<Detection> getAirportDetectionByName(@PathVariable String airportName) {
        return detectionService.getDetectionsByAirportName(airportName);
    }
}
