package com.example.apiezpz.checklist.controller

import com.example.apiezpz.auth.service.AuthService
import com.example.apiezpz.checklist.dto.ItemDTO
import com.example.apiezpz.checklist.service.ItemService
import com.example.apiezpz.item.dto.ItemSearchResponse
import com.example.apiezpz.item.repository.ItemRepository
import com.example.apiezpz.search.service.SearchService
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/items")
class ItemController(
    private val itemService: ItemService,
    private val searchService: SearchService,
    private val authService: AuthService,
    private val itemRepository: ItemRepository
) {
    private val log = LoggerFactory.getLogger(ItemController::class.java)

    // 아이템 추가
    @PostMapping("/{categoryId}")
    @PreAuthorize("isAuthenticated()")
    fun addItem(@PathVariable categoryId: Long, 
                @RequestBody itemDTO: ItemDTO,
                @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Void> {
        log.info("아이템 추가 요청 - 사용자: {}, 카테고리ID: {}, 아이템명: {}", userDetails.username, categoryId, itemDTO.name)
        itemService.saveItem(categoryId, itemDTO)
        log.info("아이템 추가 완료 - 사용자: {}, 카테고리ID: {}, 아이템명: {}", userDetails.username, categoryId, itemDTO.name)
        return ResponseEntity.ok().build()
    }

    // 카테고리별 아이템 목록 조회
    @GetMapping("/list/{categoryId}")
    @PreAuthorize("isAuthenticated()")
    fun getItemsByCategory(@PathVariable categoryId: Long,
                          @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<List<ItemDTO>> {
        log.info("카테고리별 아이템 목록 조회 시작 - 사용자: {}, 카테고리ID: {}", userDetails.username, categoryId)
        val items = itemService.getAllItems(categoryId)
        log.info("카테고리별 아이템 목록 조회 완료 - 사용자: {}, 카테고리ID: {}, 조회된 아이템 수: {}", userDetails.username, categoryId, items.size)
        return ResponseEntity.ok(items)
    }

    // 아이템 삭제
    @DeleteMapping("/{itemId}")
    @PreAuthorize("isAuthenticated()")
    fun deleteItem(@PathVariable itemId: Long,
                   @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Void> {
        log.info("아이템 삭제 요청 - 사용자: {}, 아이템ID: {}", userDetails.username, itemId)
        itemService.deleteItem(itemId)
        log.info("아이템 삭제 완료 - 사용자: {}, 아이템ID: {}", userDetails.username, itemId)
        return ResponseEntity.ok().build()
    }

    // 아이템 수정
    @PutMapping("/{itemId}")
    @PreAuthorize("isAuthenticated()")
    fun updateItem(@PathVariable itemId: Long, 
                   @RequestBody itemDTO: ItemDTO,
                   @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Void> {
        log.info("아이템 수정 요청 - 사용자: {}, 아이템ID: {}, 새로운 이름: {}", userDetails.username, itemId, itemDTO.name)
        itemService.updateItem(itemId, itemDTO)
        log.info("아이템 수정 완료 - 사용자: {}, 아이템ID: {}, 새로운 이름: {}", userDetails.username, itemId, itemDTO.name)
        return ResponseEntity.ok().build()
    }

    // 아이템 체크 상태 변경
    @PutMapping("/{itemId}/checked")
    @PreAuthorize("isAuthenticated()")
    fun updateCheckedStatus(@PathVariable itemId: Long,
                           @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Void> {
        log.info("아이템 체크 상태 변경 요청 - 사용자: {}, 아이템ID: {}", userDetails.username, itemId)
        itemService.updateItemCheckedStatus(itemId)
        log.info("아이템 체크 상태 변경 완료 - 사용자: {}, 아이템ID: {}", userDetails.username, itemId)
        return ResponseEntity.ok().build()
    }

    // 아이템 검색 (공개 API)
    @GetMapping("/search")
    fun searchItems(@RequestParam keyword: String): ResponseEntity<List<ItemSearchResponse>> {
        log.info("아이템 검색 요청 - 키워드: {}", keyword)
        val results = itemRepository.searchByKeyword(keyword).map { item ->
            ItemSearchResponse(
                isAllowed = item.isAllowed,
                isConditional = item.isConditional,
                originalText = item.originalText ?: "",
                restrictions = item.restrictions ?: "",
                name = item.name,
                category = item.category
            )
        }
        log.info("아이템 검색 완료 - 키워드: {}, 결과 수: {}", keyword, results.size)
        return ResponseEntity.ok(results)
    }
} 