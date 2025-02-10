package org.zerock.ezpacking.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.ezpacking.domain.dto.response.ItemSearchResponse;
import org.zerock.ezpacking.domain.dto.response.RankingResponse;
import org.zerock.ezpacking.service.ItemSearchService;
import org.zerock.ezpacking.service.SearchRankingService;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ItemSearchController {

    private final ItemSearchService itemSearchService;
    private final SearchRankingService searchRankingService;

    @GetMapping("/items/search")
    public ResponseEntity<ItemSearchResponse> searchItems(
            @RequestParam(required = false) String name) {
        ItemSearchResponse result = itemSearchService.searchItems(name);

        // 검색어가 있고, 실제 DB에서 찾은 결과가 있는 경우에만 랭킹에 기록
        if (name != null && !name.trim().isEmpty() && result.getOriginalText() != null) {
            searchRankingService.recordSuccessfulSearch(name, result);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/rankings/search")
    public ResponseEntity<List<RankingResponse>> getSearchRankings() {
        return ResponseEntity.ok(searchRankingService.getTop5SearchRankings());
    }
}