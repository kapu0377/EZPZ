package com.example.apiezpz.item.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.apiezpz.item.dto.ItemSearchResponse;
import com.example.apiezpz.item.service.ItemSearchService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@Slf4j
public class ItemSearchController {

    private final ItemSearchService itemSearchService;

    @GetMapping("/search")
    public ResponseEntity<ItemSearchResponse> searchItems(
            @RequestParam String keyword,
            @RequestParam(required = false) String username) {
        log.info("검색 요청 - keyword: {}, username: {}", keyword, username);
        ItemSearchResponse response = itemSearchService.searchItems(keyword, username);
        return ResponseEntity.ok(response);
    }

}