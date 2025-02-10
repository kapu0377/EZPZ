package org.zerock.ezpacking.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.zerock.ezpacking.domain.dto.response.RankingResponse;
import org.zerock.ezpacking.service.DetectionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/detection")
@RequiredArgsConstructor
public class DetectionController {
    private final DetectionService detectionService;

    @GetMapping("/rankings")
    public ResponseEntity<List<RankingResponse>> getDetectionRankings() {
        return ResponseEntity.ok(detectionService.getDetectionRankings());
    }
}