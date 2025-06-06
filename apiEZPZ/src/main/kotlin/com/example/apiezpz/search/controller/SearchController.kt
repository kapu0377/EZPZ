package com.example.apiezpz.search.controller

import com.example.apiezpz.auth.entity.User
import com.example.apiezpz.auth.service.AuthService
import com.example.apiezpz.item.dto.ItemSearchResponse
import com.example.apiezpz.search.entity.MonthlyRank
import com.example.apiezpz.search.entity.WeeklyRank
import com.example.apiezpz.search.service.SearchService
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/search")
class SearchController(
    private val searchService: SearchService,
    private val authService: AuthService
) {
    private val log = LoggerFactory.getLogger(SearchController::class.java)

    @GetMapping("/weekly-ranking")
    fun getWeeklyRanking(): ResponseEntity<List<WeeklyRank>> {
        log.info("주간 랭킹 조회 요청")
        val rankings = searchService.getWeeklyRanking()
        log.info("주간 랭킹 조회 완료 - 결과 수: {}", rankings.size)
        return ResponseEntity.ok(rankings)
    }

    @GetMapping("/monthly-ranking")
    fun getMonthlyRanking(): ResponseEntity<List<MonthlyRank>> {
        log.info("월간 랭킹 조회 요청")
        val rankings = searchService.getMonthlyRanking()
        log.info("월간 랭킹 조회 완료 - 결과 수: {}", rankings.size)
        return ResponseEntity.ok(rankings)
    }

    @GetMapping("/top-categories")
    fun getTopCategories(): ResponseEntity<List<Map<String, Any>>> {
        log.info("인기 카테고리 조회 요청")
        val categories = searchService.getTopCategories()
        val formattedCategories = categories.map { (category, count) ->
            mapOf(
                "category" to category,
                "searchCount" to count
            )
        }
        log.info("인기 카테고리 조회 완료 - 결과 수: {}", formattedCategories.size)
        return ResponseEntity.ok(formattedCategories)
    }
} 