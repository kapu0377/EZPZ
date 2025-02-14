package com.example.apiezpz.search.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.apiezpz.auth.entity.User;
import com.example.apiezpz.auth.repository.UserRepository;
import com.example.apiezpz.search.entity.CategoryRank;
import com.example.apiezpz.search.entity.SearchHistory;
import com.example.apiezpz.search.repository.CategoryRankRepository;
import com.example.apiezpz.search.repository.SearchHistoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class SearchService {
    private final SearchHistoryRepository searchHistoryRepository;
    private final CategoryRankRepository categoryRankRepository;
    private final UserRepository userRepository;

    public void recordSearch(String username, String category) {
        // 검색 기록 저장
        User user = userRepository.findByUsername(username);
        SearchHistory searchHistory = new SearchHistory();
        searchHistory.setCategory(category);
        searchHistory.setUser(user);
        searchHistoryRepository.save(searchHistory);

        // 카테고리 순위 업데이트
        CategoryRank categoryRank = categoryRankRepository.findByCategory(category)
                .orElse(new CategoryRank());
        
        if (categoryRank.getId() == null) {
            categoryRank.setCategory(category);
            categoryRank.setSearchCount(1L);
        } else {
            categoryRank.setSearchCount(categoryRank.getSearchCount() + 1);
        }
        
        categoryRankRepository.save(categoryRank);
    }

    public List<CategoryRank> getTopCategories() {
        return categoryRankRepository.findTop10ByOrderBySearchCountDesc();
    }

    public List<SearchHistory> getUserSearchHistory(String username) {
        User user = userRepository.findByUsername(username);
        return searchHistoryRepository.findByUserOrderBySearchDateDesc(user);
    }

    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Tokyo")  // 매일 자정에 실행
    @Transactional
    public void resetDailyRankings() {
        categoryRankRepository.deleteAll();
        System.out.println("카테고리 랭크 항목들이 리셋되었습니다: " + LocalDateTime.now());
    }
} 