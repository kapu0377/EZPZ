package com.example.apiezpz.prohibited.repository

import com.example.apiezpz.prohibited.domain.Prohibit
import org.springframework.data.jpa.repository.JpaRepository

interface ProhibitedItemsRepository : JpaRepository<Prohibit, Long> {
    fun findByGubun(gubun: String): List<Prohibit> // Gubun으로 데이터 조회
} 