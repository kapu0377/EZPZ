package com.example.apiezpz.checklist.dto

data class CategoryDTO(
    var id: Long? = null,
    var name: String = "",
    var checklistId: Long? = null, // 체크리스트 ID
    var items: List<ItemDTO> = emptyList()    // 아이템 리스트 포함
) 