package com.example.apiezpz;

import com.example.apiezpz.search.entity.DailyRank;
import com.example.apiezpz.search.entity.WeeklyRank;
import com.example.apiezpz.search.entity.MonthlyRank;
import com.example.apiezpz.search.repository.DailyRankRepository;
import com.example.apiezpz.search.repository.WeeklyRankRepository;
import com.example.apiezpz.search.repository.MonthlyRankRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@SpringBootApplication
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class ApiEzpzApplication {

    private final DailyRankRepository dailyRankRepository;
    private final WeeklyRankRepository weeklyRankRepository;
    private final MonthlyRankRepository monthlyRankRepository;

    public static void main(String[] args) {
        SpringApplication.run(ApiEzpzApplication.class, args);
    }




    @Scheduled(cron = "0 0 0 * * MON", zone = "Asia/Tokyo") // 매주 월요일 실행
    @Transactional
    public void transferDailyToWeeklyAndReset() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Tokyo"));
        LocalDate lastWeekStart = today.minusWeeks(1).with(DayOfWeek.MONDAY);
        LocalDate lastWeekEnd = today.minusWeeks(1).with(DayOfWeek.SUNDAY);

        List<DailyRank> lastWeekData = dailyRankRepository.findByDateBetween(lastWeekStart, lastWeekEnd);

        Map<String, Long> weeklyCounts = lastWeekData.stream()
                .collect(Collectors.groupingBy(DailyRank::getCategory, Collectors.summingLong(DailyRank::getSearchCount)));

        List<WeeklyRank> weeklyRanks = weeklyCounts.entrySet().stream().map(entry -> {
            WeeklyRank weeklyRank = new WeeklyRank();
            weeklyRank.setCategory(entry.getKey());
            weeklyRank.setSearchCount(entry.getValue());
            weeklyRank.setStartDate(lastWeekStart);
            weeklyRank.setEndDate(lastWeekEnd);
            weeklyRank.setRecordedDate(today);
            return weeklyRank;
        }).collect(Collectors.toList());

        weeklyRankRepository.saveAll(weeklyRanks);
        log.info("주간 랭킹이 업데이트되었습니다: {}", LocalDateTime.now());

    }



    @Scheduled(cron = "0 0 0 1 * *", zone = "Asia/Tokyo") // 매월 1일 실행
    @Transactional
    public void backupMonthlyRank() {
        LocalDate now = LocalDate.now(ZoneId.of("Asia/Tokyo"));
        YearMonth lastMonth = YearMonth.from(now).minusMonths(1);
        LocalDate startDate = lastMonth.atDay(1);
        LocalDate endDate = lastMonth.atEndOfMonth();

        List<WeeklyRank> weeklyRanks = weeklyRankRepository.findByStartDateBetween(startDate, endDate);

        Map<String, Long> monthlyCounts = weeklyRanks.stream()
                .collect(Collectors.groupingBy(WeeklyRank::getCategory, Collectors.summingLong(WeeklyRank::getSearchCount)));

        List<MonthlyRank> monthlyRanks = monthlyCounts.entrySet().stream().map(entry -> {
            MonthlyRank monthlyRank = new MonthlyRank();
            monthlyRank.setCategory(entry.getKey());
            monthlyRank.setSearchCount(entry.getValue());
            monthlyRank.setStartDate(startDate);
            monthlyRank.setEndDate(endDate);
            return monthlyRank;
        }).collect(Collectors.toList());

        monthlyRankRepository.saveAll(monthlyRanks);
        log.info("[Monthly Backup] {} 백업 완료.", lastMonth);
    }


}
