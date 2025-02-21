package com.example.apiezpz.search.service;

import java.time.*;
import java.util.List;

import com.example.apiezpz.search.entity.*;
import com.example.apiezpz.search.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.apiezpz.auth.entity.User;
import com.example.apiezpz.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
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



    public List<SearchHistory> getUserSearchHistory(String username) {
        User user = userRepository.findByUsername(username);
        return searchHistoryRepository.findByUserOrderBySearchDateDesc(user);
    }



    public List<DailyRank> getDailyRanking() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Tokyo"));
        return dailyRankRepository.findByDate(today);
    }

    // ✅ 주간 랭킹 조회 (이번 주 기준)
    public List<WeeklyRank> getWeeklyRanking() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Tokyo"));
        LocalDate monday = today.with(DayOfWeek.MONDAY);
        return weeklyRankRepository.findByStartDateBetween(monday, today);
    }

    // ✅ 월간 랭킹 조회 (이번 달 기준)
    public List<MonthlyRank> getMonthlyRanking() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Tokyo"));
        YearMonth thisMonth = YearMonth.from(today);
        LocalDate startDate = thisMonth.atDay(1);
        LocalDate endDate = thisMonth.atEndOfMonth();
        return monthlyRankRepository.findByStartDateBetween(startDate, endDate);
    }
}
