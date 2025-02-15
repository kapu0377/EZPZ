package com.example.apiezpz.search.controller;

import com.example.apiezpz.search.entity.CategoryRank;
import com.example.apiezpz.search.entity.SearchHistory;
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

    @PostMapping("/record")
    public ResponseEntity<?> recordSearch(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String category = request.get("category");
        searchService.recordSearch(username, category);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/top-categories")
    public ResponseEntity<List<CategoryRank>> getTopCategories() {
        return ResponseEntity.ok(searchService.getTopCategories());
    }

    @GetMapping("/history")
    public ResponseEntity<List<SearchHistory>> getUserHistory(@RequestParam String username) {
        return ResponseEntity.ok(searchService.getUserSearchHistory(username));
    }
} 