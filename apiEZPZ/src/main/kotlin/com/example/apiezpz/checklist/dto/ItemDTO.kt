package com.example.apiezpz.checklist.dto

data class ItemDTO(
    var id: Long? = null,
    var name: String = "",
    var checked: Boolean = false,
    var categoryId: Long? = null
) 