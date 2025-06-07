package com.example.apiezpz.item.dto

data class ItemSearchResponse(
    var isAllowed: Boolean = false,
    var isConditional: Boolean = false,
    var originalText: String = "",
    var restrictions: String = "",
    var name: String = "",
    var category: String = ""
) 