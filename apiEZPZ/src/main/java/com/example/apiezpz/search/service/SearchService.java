package com.example.apiezpz.search.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.apiezpz.auth.entity.User;
import com.example.apiezpz.auth.repository.UserRepository;
import com.example.apiezpz.search.entity.DailyRank;
import com.example.apiezpz.search.entity.MonthlyRank;
import com.example.apiezpz.search.entity.SearchHistory;
import com.example.apiezpz.search.entity.WeeklyRank;
import com.example.apiezpz.search.repository.DailyRankRepository;
import com.example.apiezpz.search.repository.MonthlyRankRepository;
import com.example.apiezpz.search.repository.SearchHistoryRepository;
import com.example.apiezpz.search.repository.WeeklyRankRepository;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
@Transactional
public class SearchService {
    private final SearchHistoryRepository searchHistoryRepository;
    private final UserRepository userRepository;
    private final DailyRankRepository dailyRankRepository;
    private final WeeklyRankRepository weeklyRankRepository;
    private final MonthlyRankRepository monthlyRankRepository;

    public void recordSearch(String username, String category) {
        User user = userRepository.findByUsername(username);
        SearchHistory searchHistory = new SearchHistory();
        searchHistory.setCategory(category);
        searchHistory.setUser(user);
        searchHistory.setSearchDate(LocalDateTime.now(ZoneId.of("Asia/Tokyo")));
        searchHistory.setKeyword(category);
        searchHistoryRepository.save(searchHistory);

        LocalDate today = LocalDate.now(ZoneId.of("Asia/Tokyo"));
        DailyRank dailyRank = dailyRankRepository.findByCategoryAndDate(category, today)
                .orElseGet(() -> {
                    DailyRank newRank = new DailyRank();
                    newRank.setCategory(category);
                    newRank.setSearchCount(0L);
                    newRank.setDate(today);
                    return newRank;
                });

        dailyRank.setSearchCount(dailyRank.getSearchCount() + 1);
        dailyRankRepository.save(dailyRank);
    }

    public void saveSearchHistory(String username, String keyword, String searchDateStr) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다: " + username);
        }

        SearchHistory searchHistory = new SearchHistory();
        searchHistory.setUser(user);
        searchHistory.setKeyword(keyword);
        searchHistory.setCategory(keyword);
        
        LocalDateTime searchDate;
        if (searchDateStr != null && !searchDateStr.isEmpty()) {
            searchDate = LocalDateTime.parse(searchDateStr);
        } else {
            searchDate = LocalDateTime.now(ZoneId.of("Asia/Tokyo"));
        }
        searchHistory.setSearchDate(searchDate);
        
        searchHistoryRepository.save(searchHistory);
        
        updateSearchRanking(keyword);
    }
    
    // 검색 랭킹 업데이트 (중복 코드 제거)
    private void updateSearchRanking(String category) {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Tokyo"));
        DailyRank dailyRank = dailyRankRepository.findByCategoryAndDate(category, today)
                .orElseGet(() -> {
                    DailyRank newRank = new DailyRank();
                    newRank.setCategory(category);
                    newRank.setSearchCount(0L);
                    newRank.setDate(today);
                    return newRank;
                });

        dailyRank.setSearchCount(dailyRank.getSearchCount() + 1);
        dailyRankRepository.save(dailyRank);
    }

    // 특정 사용자의 검색 기록 조회
    public List<SearchHistory> getUserSearchHistory(String username) {
        User user = userRepository.findByUsername(username);
        return searchHistoryRepository.findByUserOrderBySearchDateDesc(user);
    }
    
    // 특정 기간 내 사용자의 검색 기록 조회
    public List<SearchHistory> getUserSearchHistoryByDateRange(String username, LocalDateTime startDate, LocalDateTime endDate) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다: " + username);
        }
        return searchHistoryRepository.findByUserAndSearchDateBetweenOrderBySearchDateDesc(user, startDate, endDate);
    }

    public List<DailyRank> getDailyRanking() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Tokyo"));
        return dailyRankRepository.findByDate(today);
    }

    // 주간 랭킹 조회 (이번 주 기준)
    public List<WeeklyRank> getWeeklyRanking() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Tokyo"));
        LocalDate monday = today.with(DayOfWeek.MONDAY);
        return weeklyRankRepository.findByStartDateBetween(monday, today);
    }

    // 월간 랭킹 조회 (이번 달 기준)
    public List<MonthlyRank> getMonthlyRanking() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Tokyo"));
        YearMonth thisMonth = YearMonth.from(today);
        LocalDate startDate = thisMonth.atDay(1);
        LocalDate endDate = thisMonth.atEndOfMonth();
        return monthlyRankRepository.findByStartDateBetween(startDate, endDate);
    }
}
