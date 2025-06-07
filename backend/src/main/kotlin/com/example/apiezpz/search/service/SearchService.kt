package com.example.apiezpz.search.service

import com.example.apiezpz.auth.entity.User
import com.example.apiezpz.item.dto.ItemSearchResponse
import com.example.apiezpz.item.repository.ItemRepository
import com.example.apiezpz.search.entity.DailyRank
import com.example.apiezpz.search.entity.MonthlyRank
import com.example.apiezpz.search.entity.SearchHistory
import com.example.apiezpz.search.entity.WeeklyRank
import com.example.apiezpz.search.repository.DailyRankRepository
import com.example.apiezpz.search.repository.MonthlyRankRepository
import com.example.apiezpz.search.repository.SearchHistoryRepository
import com.example.apiezpz.search.repository.WeeklyRankRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class SearchService(
    private val itemRepository: ItemRepository,
    private val searchHistoryRepository: SearchHistoryRepository,
    private val dailyRankRepository: DailyRankRepository,
    private val weeklyRankRepository: WeeklyRankRepository,
    private val monthlyRankRepository: MonthlyRankRepository
) {

    fun searchItems(keyword: String, user: User): List<ItemSearchResponse> {
        // 검색 기록 저장
        saveSearchHistory(user, keyword, "ITEM")
        
        // 아이템 검색
        val items = itemRepository.searchByKeyword(keyword)
        
        return items.map { item ->
            ItemSearchResponse(
                isAllowed = item.isAllowed,
                isConditional = item.isConditional,
                originalText = item.originalText ?: "",
                restrictions = item.restrictions ?: "",
                name = item.name,
                category = item.category
            )
        }
    }

    fun getWeeklyRanking(): List<WeeklyRank> {
        return weeklyRankRepository.findTop10ByOrderBySearchCountDesc()
    }

    fun getMonthlyRanking(): List<MonthlyRank> {
        return monthlyRankRepository.findTop10ByOrderBySearchCountDesc()
    }

    fun getTopCategories(): Map<String, Long> {
        val searchHistories = searchHistoryRepository.findAll()
        return searchHistories
            .groupBy { it.category }
            .mapValues { (_, histories) -> histories.size.toLong() }
            .toList()
            .sortedByDescending { it.second }
            .take(10)
            .toMap()
    }

    private fun saveSearchHistory(user: User, keyword: String, category: String) {
        val searchHistory = SearchHistory(
            user = user,
            keyword = keyword,
            category = category,
            searchDate = LocalDateTime.now()
        )
        searchHistoryRepository.save(searchHistory)
    }
} 