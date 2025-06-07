package com.example.apiezpz.checklist.service

import com.example.apiezpz.checklist.domain.Category
import com.example.apiezpz.checklist.dto.CategoryDTO
import com.example.apiezpz.checklist.dto.ItemDTO
import com.example.apiezpz.checklist.exception.CategoryNotFoundException
import com.example.apiezpz.checklist.exception.ChecklistNotFoundException
import com.example.apiezpz.checklist.repository.CategoryRepository
import com.example.apiezpz.checklist.repository.ChecklistRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class CategoryService(
    private val categoryRepository: CategoryRepository,
    private val checklistRepository: ChecklistRepository
) {
    private val log = LoggerFactory.getLogger(CategoryService::class.java)

    // 체크리스트에 카테고리 추가
    fun addCategory(checklistId: Long, categoryDTO: CategoryDTO) {
        log.info("카테고리 추가 시작 - 체크리스트ID: {}, 카테고리명: {}", checklistId, categoryDTO.name)
        
        val checklist = checklistRepository.findById(checklistId)
            .orElseThrow { ChecklistNotFoundException("체크리스트를 찾을 수 없습니다. ID: $checklistId") }

        // 같은 체크리스트에 동일한 이름의 카테고리가 있는지 확인
        if (categoryRepository.existsByChecklistIdAndName(checklistId, categoryDTO.name)) {
            throw IllegalArgumentException("같은 체크리스트에 동일한 이름의 카테고리가 이미 존재합니다: ${categoryDTO.name}")
        }

        val category = Category(
            name = categoryDTO.name,
            checklist = checklist
        )

        categoryRepository.save(category)
        log.info("카테고리 추가 완료 - 체크리스트ID: {}, 카테고리명: {}", checklistId, categoryDTO.name)
    }

    // 체크리스트별 카테고리 목록 조회 (아이템 포함)
    @Transactional(readOnly = true)
    fun getCategoriesByChecklist(checklistId: Long): List<CategoryDTO> {
        log.info("체크리스트별 카테고리 조회 시작 - 체크리스트ID: {}", checklistId)
        
        // 체크리스트 존재 여부 확인
        if (!checklistRepository.existsById(checklistId)) {
            throw ChecklistNotFoundException("체크리스트를 찾을 수 없습니다. ID: $checklistId")
        }

        val categories = categoryRepository.findByChecklistId(checklistId)
        val result = categories.map { category ->
            val items = category.checklistItems.map { item ->
                ItemDTO(
                    id = item.id,
                    name = item.name,
                    checked = item.checked,
                    categoryId = category.id
                )
            }

            CategoryDTO(
                id = category.id,
                name = category.name,
                checklistId = checklistId,
                items = items
            )
        }
        
        log.info("체크리스트별 카테고리 조회 완료 - 체크리스트ID: {}, 조회된 카테고리 수: {}", checklistId, result.size)
        return result
    }

    // 카테고리 이름 수정
    fun updateCategory(categoryId: Long, newName: String) {
        log.info("카테고리 수정 시작 - 카테고리ID: {}, 새로운 이름: {}", categoryId, newName)
        
        val category = categoryRepository.findById(categoryId)
            .orElseThrow { CategoryNotFoundException("카테고리를 찾을 수 없습니다. ID: $categoryId") }

        val checklistId = category.checklist?.id ?: throw IllegalStateException("카테고리에 체크리스트가 설정되지 않았습니다.")
        
        // 같은 체크리스트에 동일한 이름의 다른 카테고리가 있는지 확인 (자기 자신 제외)
        val categories = categoryRepository.findByChecklistId(checklistId)
        val isDuplicate = categories.any { it.id != categoryId && it.name == newName }
        
        if (isDuplicate) {
            throw IllegalArgumentException("같은 체크리스트에 동일한 이름의 카테고리가 이미 존재합니다: $newName")
        }

        category.name = newName
        categoryRepository.save(category)
        
        log.info("카테고리 수정 완료 - 카테고리ID: {}, 새로운 이름: {}", categoryId, newName)
    }

    // 카테고리 삭제 (관련된 모든 아이템도 함께 삭제됨 - Cascade 설정에 의해)
    fun deleteCategory(categoryId: Long) {
        log.info("카테고리 삭제 시작 - 카테고리ID: {}", categoryId)
        
        val category = categoryRepository.findById(categoryId)
            .orElseThrow { CategoryNotFoundException("카테고리를 찾을 수 없습니다. ID: $categoryId") }

        val itemCount = category.checklistItems.size
        categoryRepository.delete(category)
        
        log.info("카테고리 삭제 완료 - 카테고리ID: {}, 함께 삭제된 아이템 수: {}", categoryId, itemCount)
    }
} 