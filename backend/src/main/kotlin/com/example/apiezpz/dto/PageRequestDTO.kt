package com.example.apiezpz.dto

import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import java.io.UnsupportedEncodingException
import java.net.URLEncoder
import java.time.LocalDate

data class PageRequestDTO(
    var page: Int = 1,
    var size: Int = 10,
    var type: String? = null,
    var keyword: String? = null,
    var from: LocalDate? = null,
    var to: LocalDate? = null,
    var completed: Boolean? = null
) {
    private var link: String? = null

    fun getTypes(): Array<String>? {
        if (type.isNullOrEmpty()) {
            return null
        }
        return type!!.split("").toTypedArray()
    }

    fun getPageable(vararg props: String): Pageable {
        return PageRequest.of(this.page - 1, this.size, Sort.by(*props).descending())
    }

    fun getLink(): String {
        if (link == null) {
            val builder = StringBuilder()
            builder.append("page=$page")
            builder.append("&size=$size")
            if (!type.isNullOrEmpty()) {
                builder.append("&type=$type")
            }
            if (keyword != null) {
                try {
                    builder.append("&keyword=${URLEncoder.encode(keyword, "UTF-8")}")
                } catch (e: UnsupportedEncodingException) {
                    // 예외 처리
                }
            }
            link = builder.toString()
        }
        return link!!
    }
} 