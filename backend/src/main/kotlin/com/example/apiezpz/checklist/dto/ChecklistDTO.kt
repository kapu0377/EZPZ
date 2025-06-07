package com.example.apiezpz.checklist.dto

import java.time.LocalDate

data class ChecklistDTO(
    var id: Long? = null,
    var title: String = "",
    var departureDate: LocalDate? = null,
    var returnDate: LocalDate? = null,
    var categories: List<CategoryDTO> = emptyList()   // 카테고리 목록
) 