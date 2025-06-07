package com.example.apiezpz.checklist.controller

import com.example.apiezpz.checklist.dto.CategoryDTO
import com.example.apiezpz.checklist.service.CategoryService
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/categories")
class CategoryController(
    private val categoryService: CategoryService
) {
    private val log = LoggerFactory.getLogger(CategoryController::class.java)

    @PostMapping("/{checklistId}")
    @PreAuthorize("isAuthenticated()")
    fun addCategory(@PathVariable checklistId: Long, 
                    @RequestBody categoryDTO: CategoryDTO,
                    @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Void> {
        log.info("카테고리 추가 요청 - 사용자: {}, 체크리스트ID: {}, 카테고리명: {}", userDetails.username, checklistId, categoryDTO.name)
        categoryService.addCategory(checklistId, categoryDTO)
        log.info("카테고리 추가 완료 - 사용자: {}, 체크리스트ID: {}, 카테고리명: {}", userDetails.username, checklistId, categoryDTO.name)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/list/{checklistId}")
    @PreAuthorize("isAuthenticated()")
    fun getCategoriesByChecklist(@PathVariable checklistId: Long,
                                 @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<List<CategoryDTO>> {
        log.info("체크리스트별 카테고리 목록 조회 시작 - 사용자: {}, 체크리스트ID: {}", userDetails.username, checklistId)
        val categories = categoryService.getCategoriesByChecklist(checklistId)
        log.info("체크리스트별 카테고리 목록 조회 완료 - 사용자: {}, 체크리스트ID: {}, 조회된 카테고리 수: {}", userDetails.username, checklistId, categories.size)
        return ResponseEntity.ok(categories)
    }

    @PutMapping("/{categoryId}")
    @PreAuthorize("isAuthenticated()")
    fun updateCategory(@PathVariable categoryId: Long, 
                       @RequestBody categoryDTO: CategoryDTO,
                       @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Void> {
        log.info("카테고리 수정 요청 - 사용자: {}, 카테고리ID: {}, 새로운 이름: {}", userDetails.username, categoryId, categoryDTO.name)
        categoryService.updateCategory(categoryId, categoryDTO.name)
        log.info("카테고리 수정 완료 - 사용자: {}, 카테고리ID: {}, 새로운 이름: {}", userDetails.username, categoryId, categoryDTO.name)
        return ResponseEntity.ok().build()
    }

    @DeleteMapping("/{categoryId}")
    @PreAuthorize("isAuthenticated()")
    fun deleteCategory(@PathVariable categoryId: Long,
                       @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Void> {
        log.info("카테고리 삭제 요청 - 사용자: {}, 카테고리ID: {}", userDetails.username, categoryId)
        categoryService.deleteCategory(categoryId)
        log.info("카테고리 삭제 완료 - 사용자: {}, 카테고리ID: {}", userDetails.username, categoryId)
        return ResponseEntity.ok().build()
    }
} 