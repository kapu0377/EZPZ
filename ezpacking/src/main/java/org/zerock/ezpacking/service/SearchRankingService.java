package org.zerock.ezpacking.service;

import org.springframework.cache.annotation.Cacheable;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.ezpacking.domain.dto.response.ItemSearchResponse;
import org.zerock.ezpacking.domain.dto.response.RankingResponse;
import org.zerock.ezpacking.domain.entity.SearchHistory;
import org.zerock.ezpacking.repository.SearchHistoryRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class SearchRankingService {
    private final SearchHistoryRepository searchHistoryRepository;

    /**
     * 검색 결과에 따라 검색 기록을 저장하는 메서드입니다.
     * 검색 결과가 있는 경우에만 랭킹에 반영됩니다.
     *
     * @param keyword 검색어
     * @param searchResult 검색 결과
     */
    @Transactional
    public void recordSuccessfulSearch(String keyword, ItemSearchResponse searchResult) {
        // 검색 결과가 있는 경우에만 랭킹에 기록
        SearchHistory existingHistory = searchHistoryRepository.findByKeyword(keyword)
                .orElse(null);

        if (existingHistory != null) {
            // 기존 검색어의 경우 카운트를 증가시키고 검색 결과 정보를 업데이트
            existingHistory.incrementCount();
            existingHistory.updateLastSearchResult(
                    searchResult.isAllowed(),
                    searchResult.isConditional(),
                    searchResult.getRestrictions()
            );
            searchHistoryRepository.save(existingHistory);
        } else {
            // 새로운 검색어의 경우 검색 결과 정보와 함께 저장
            SearchHistory searchHistory = SearchHistory.builder()
                    .keyword(keyword)
                    .count(1L)
                    .carryOnAllowed(searchResult.isAllowed())
                    .checkedAllowed(searchResult.isConditional())
                    .restrictions(searchResult.getRestrictions())
                    .build();
            searchHistoryRepository.save(searchHistory);
        }
    }

    /**
     * 상위 5개의 인기 검색어와 그 결과를 조회하는 메서드입니다.
     * 각 검색어의 반입 가능 여부 정보도 함께 제공됩니다.
     */
    @Cacheable(value = "searchRankings")
    public List<RankingResponse> getTop5SearchRankings() {
        return searchHistoryRepository.findTop5ByOrderByCountDesc()
                .stream()
                .map(history -> RankingResponse.builder()
                        .name(history.getKeyword())
                        .count(history.getCount())
                        .carryOnAllowed(history.isCarryOnAllowed())
                        .checkedAllowed(history.isCheckedAllowed())
                        .restrictions(history.getRestrictions())
                        .build())
                .collect(Collectors.toList());
    }
}