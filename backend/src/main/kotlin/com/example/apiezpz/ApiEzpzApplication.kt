package com.example.apiezpz

import com.example.apiezpz.search.entity.DailyRank
import com.example.apiezpz.search.entity.MonthlyRank
import com.example.apiezpz.search.entity.WeeklyRank
import com.example.apiezpz.search.repository.DailyRankRepository
import com.example.apiezpz.search.repository.MonthlyRankRepository
import com.example.apiezpz.search.repository.WeeklyRankRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.EnableAspectJAutoProxy
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.annotation.Transactional
import java.time.*
import java.time.temporal.TemporalAdjusters

@SpringBootApplication
@EnableScheduling
@EnableAspectJAutoProxy
@EnableJpaRepositories(basePackages = ["com.example.apiezpz"])
@EnableRedisRepositories(basePackages = ["com.example.apiezpz.nonexistent"])
class ApiEzpzApplication(
    private val dailyRankRepository: DailyRankRepository,
    private val weeklyRankRepository: WeeklyRankRepository,
    private val monthlyRankRepository: MonthlyRankRepository
) {
    private val log = LoggerFactory.getLogger(ApiEzpzApplication::class.java)

    @Scheduled(cron = "0 0 0 * * MON", zone = "Asia/Tokyo") // 매주 월요일 실행
    @Transactional
    fun transferDailyToWeeklyAndReset() {
        val today = LocalDate.now(ZoneId.of("Asia/Tokyo"))
        val lastWeekStart = today.minusWeeks(1).with(DayOfWeek.MONDAY)
        val lastWeekEnd = today.minusWeeks(1).with(DayOfWeek.SUNDAY)

        val lastWeekData = dailyRankRepository.findByDateBetween(lastWeekStart, lastWeekEnd)

        val weeklyCounts = lastWeekData.groupBy { it.category }
            .mapValues { (_, ranks) -> ranks.sumOf { it.searchCount } }

        val weeklyRanks = weeklyCounts.map { (category, count) ->
            WeeklyRank(
                category = category,
                searchCount = count,
                startDate = lastWeekStart,
                endDate = lastWeekEnd,
                recordedDate = today
            )
        }

        weeklyRankRepository.saveAll(weeklyRanks)
        log.info("주간 랭킹이 업데이트되었습니다: {}", LocalDateTime.now())
    }

    @Scheduled(cron = "0 0 0 1 * *", zone = "Asia/Tokyo") // 매월 1일 실행
    @Transactional
    fun backupMonthlyRank() {
        val now = LocalDate.now(ZoneId.of("Asia/Tokyo"))
        val lastMonth = YearMonth.from(now).minusMonths(1)
        val startDate = lastMonth.atDay(1)
        val endDate = lastMonth.atEndOfMonth()

        val weeklyRanks = weeklyRankRepository.findByStartDateBetween(startDate, endDate)

        val monthlyCounts = weeklyRanks.groupBy { it.category }
            .mapValues { (_, ranks) -> ranks.sumOf { it.searchCount } }

        val monthlyRanks = monthlyCounts.map { (category, count) ->
            MonthlyRank(
                category = category,
                searchCount = count,
                startDate = startDate,
                endDate = endDate
            )
        }

        monthlyRankRepository.saveAll(monthlyRanks)
        log.info("[Monthly Backup] {} 백업 완료.", lastMonth)
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            SpringApplication.run(ApiEzpzApplication::class.java, *args)
        }
    }
} 