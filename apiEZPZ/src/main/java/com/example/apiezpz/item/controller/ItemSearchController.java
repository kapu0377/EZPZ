package com.example.apiezpz.item.controller;

import com.example.apiezpz.item.dto.ItemSearchResponse;
import com.example.apiezpz.item.service.ItemSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ItemSearchController {

    private final ItemSearchService itemSearchService;

    @GetMapping("/items/search")
    public ResponseEntity<ItemSearchResponse> searchItems(
            @RequestParam(required = false) String name) {
        ItemSearchResponse result = itemSearchService.searchItems(name);

        return ResponseEntity.ok(result);
    }

}