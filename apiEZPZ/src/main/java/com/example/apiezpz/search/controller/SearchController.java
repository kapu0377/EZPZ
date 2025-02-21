package com.example.apiezpz.search.controller;

import com.example.apiezpz.search.entity.*;
import com.example.apiezpz.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {
    private final SearchService searchService;

    // ✅ 검색 기록 추가 (username, category 기반)
    @PostMapping("/record")
    public ResponseEntity<?> recordSearch(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String category = request.get("category");
        searchService.recordSearch(username, category);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/history")
    public ResponseEntity<List<SearchHistory>> getUserHistory(@RequestParam String username) {
        return ResponseEntity.ok(searchService.getUserSearchHistory(username));
    }
    @GetMapping("/top-categories")
    public ResponseEntity<List<DailyRank>> getDailyRanking() {
        return ResponseEntity.ok(searchService.getDailyRanking());
    }

    @GetMapping("/weekly-ranking")
    public ResponseEntity<List<WeeklyRank>> getWeeklyRanking() {
        return ResponseEntity.ok(searchService.getWeeklyRanking());
    }

    @GetMapping("/monthly-ranking")
    public ResponseEntity<List<MonthlyRank>> getMonthlyRanking() {
        return ResponseEntity.ok(searchService.getMonthlyRanking());
    }
}
