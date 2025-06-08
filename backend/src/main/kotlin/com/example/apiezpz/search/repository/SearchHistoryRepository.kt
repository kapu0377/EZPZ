package com.example.apiezpz.search.repository

import com.example.apiezpz.auth.entity.User
import com.example.apiezpz.search.entity.SearchHistory
import jakarta.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface SearchHistoryRepository : JpaRepository<SearchHistory, Long> {
    fun findByUserOrderBySearchDateDesc(user: User): List<SearchHistory>
    fun findByCategoryOrderBySearchDateDesc(category: String): List<SearchHistory>
    fun findByUserAndSearchDateBetweenOrderBySearchDateDesc(user: User, startDate: LocalDateTime, endDate: LocalDateTime): List<SearchHistory>
    
    fun findByUserAndSearchDateAfterOrderBySearchDateDesc(user: User, startDate: LocalDateTime): List<SearchHistory>
    
    fun findByUserAndSearchDateAfter(user: User, startDate: LocalDateTime, pageable: Pageable): Page<SearchHistory>
    
    fun findByUserAndKeywordContainingOrderBySearchDateDesc(user: User, keyword: String): List<SearchHistory>
    
    fun findByUserAndKeywordIsNotNullAndKeywordNotOrderBySearchDateDesc(user: User, emptyString: String): List<SearchHistory>
    
    fun findByUserAndSearchDateBetweenAndKeywordIsNotNullAndKeywordNotOrderBySearchDateDesc(
        user: User, startDate: LocalDateTime, endDate: LocalDateTime, emptyString: String
    ): List<SearchHistory>

    @Transactional
    fun deleteByUser(user: User)
} 