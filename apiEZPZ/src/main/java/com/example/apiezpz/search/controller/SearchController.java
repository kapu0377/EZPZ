package com.example.apiezpz.search.controller;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.apiezpz.search.entity.DailyRank;
import com.example.apiezpz.search.entity.MonthlyRank;
import com.example.apiezpz.search.entity.SearchHistory;
import com.example.apiezpz.search.entity.WeeklyRank;
import com.example.apiezpz.search.service.SearchService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {
    private final SearchService searchService;

    // 검색 기록 추가 (username, category 기반)
    @PostMapping("/record")
    public ResponseEntity<?> recordSearch(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String category = request.get("category");
        searchService.recordSearch(username, category);
        return ResponseEntity.ok().build();
    }
    
    // 검색 기록 저장 API
    @PostMapping("/history/save")
    public ResponseEntity<?> saveSearchHistory(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String keyword = request.get("keyword");
        String searchDate = request.get("searchDate");
        
        searchService.saveSearchHistory(username, keyword, searchDate);
        return ResponseEntity.ok().build();
    }

    // 사용자의 전체 검색 기록 조회
    @GetMapping("/history")
    public ResponseEntity<List<SearchHistory>> getUserHistory(@RequestParam String username) {
        return ResponseEntity.ok(searchService.getUserSearchHistory(username));
    }
    
    // 날짜 범위로 사용자 검색 기록 조회
    @GetMapping("/history/date-range")
    public ResponseEntity<List<SearchHistory>> getUserHistoryByDateRange(
            @RequestParam String username,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(searchService.getUserSearchHistoryByDateRange(username, startDate, endDate));
    }
    
    // 최근 N일 동안의 검색 기록 조회
    @GetMapping("/history/days")
    public ResponseEntity<List<SearchHistory>> getUserHistoryByDays(
            @RequestParam String username,
            @RequestParam Integer days) {
        LocalDateTime endDate = LocalDateTime.now(ZoneId.of("Asia/Tokyo"));
        LocalDateTime startDate = endDate.minus(days, ChronoUnit.DAYS);
        return ResponseEntity.ok(searchService.getUserSearchHistoryByDateRange(username, startDate, endDate));
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
    
    // 검색 기록 저장을 위한 새 API 엔드포인트
    @PostMapping("/history/new-save")
    public ResponseEntity<?> newSaveSearchHistory(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String keyword = request.get("keyword");
        String searchDate = request.get("searchDate");
        
        searchService.saveSearchHistory(username, keyword, searchDate);
        return ResponseEntity.ok().build();
    }
}
