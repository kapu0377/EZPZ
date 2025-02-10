package org.zerock.ezpacking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.zerock.ezpacking.domain.dto.response.RankingResponse;
import org.zerock.ezpacking.repository.DetectionRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DetectionService {
    private final DetectionRepository detectionRepository;

    public List<RankingResponse> getDetectionRankings() {
        return detectionRepository.findTop5ByOrderByCountDesc()
                .stream()
                .map(item -> RankingResponse.builder()
                        .name(item.getItemName())
                        .count(item.getCount())
                        .build())
                .collect(Collectors.toList());
    }
}