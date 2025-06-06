package com.example.apiezpz.dto

import kotlin.math.ceil

data class PageResponseDTO<E>(
    val pageRequestDTO: PageRequestDTO,
    val dtoList: List<E>,
    val total: Int
) {
    val page: Int = pageRequestDTO.page
    val size: Int = pageRequestDTO.size
    val start: Int
    val end: Int
    val last: Int
    val prev: Boolean
    val next: Boolean

    init {
        if (total <= 0) {
            start = 0
            end = 0
            last = 0
            prev = false
            next = false
        } else {
            val tempEnd = (ceil(page / 10.0) * 10).toInt()
            start = tempEnd - 9
            last = ceil(total / size.toDouble()).toInt()
            end = if (tempEnd > last) last else tempEnd
            prev = start > 1
            next = total > end * size
        }
    }

    companion object {
        fun <E> withAll(pageRequestDTO: PageRequestDTO, dtoList: List<E>, total: Int): PageResponseDTO<E> {
            return PageResponseDTO(pageRequestDTO, dtoList, total)
        }
    }
} 