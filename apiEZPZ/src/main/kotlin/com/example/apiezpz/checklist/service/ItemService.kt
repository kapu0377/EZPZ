package com.example.apiezpz.checklist.service

import com.example.apiezpz.checklist.domain.ChecklistItem
import com.example.apiezpz.checklist.dto.ItemDTO
import com.example.apiezpz.checklist.exception.CategoryNotFoundException
import com.example.apiezpz.checklist.exception.ItemNotFoundException
import com.example.apiezpz.checklist.repository.CategoryRepository
import com.example.apiezpz.checklist.repository.ChecklistItemRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class ItemService(
    private val itemRepository: ChecklistItemRepository,
    private val categoryRepository: CategoryRepository
) {
    private val log = LoggerFactory.getLogger(ItemService::class.java)

    // 아이템 저장
    fun saveItem(categoryId: Long, itemDTO: ItemDTO) {
        log.info("아이템 저장 시작 - 카테고리ID: {}, 아이템명: {}", categoryId, itemDTO.name)
        
        val category = categoryRepository.findById(categoryId)
            .orElseThrow { CategoryNotFoundException("카테고리를 찾을 수 없습니다. ID: $categoryId") }

        // 같은 카테고리에 동일한 이름의 아이템이 있는지 확인
        if (itemRepository.existsByCategoryIdAndName(categoryId, itemDTO.name)) {
            throw IllegalArgumentException("같은 카테고리에 동일한 이름의 아이템이 이미 존재합니다: ${itemDTO.name}")
        }

        val item = ChecklistItem(
            name = itemDTO.name,
            checked = itemDTO.checked,
            category = category
        )

        itemRepository.save(item)
        log.info("아이템 저장 완료 - 카테고리ID: {}, 아이템명: {}", categoryId, itemDTO.name)
    }

    // 카테고리별 모든 아이템 조회
    @Transactional(readOnly = true)
    fun getAllItems(categoryId: Long): List<ItemDTO> {
        log.info("카테고리별 아이템 조회 시작 - 카테고리ID: {}", categoryId)
        
        // 카테고리 존재 여부 확인
        if (!categoryRepository.existsById(categoryId)) {
            throw CategoryNotFoundException("카테고리를 찾을 수 없습니다. ID: $categoryId")
        }

        val items = itemRepository.findByCategoryIdOrderByNameAsc(categoryId)
        val result = items.map { item ->
            ItemDTO(
                id = item.id,
                name = item.name,
                checked = item.checked,
                categoryId = categoryId
            )
        }
        
        log.info("카테고리별 아이템 조회 완료 - 카테고리ID: {}, 조회된 아이템 수: {}", categoryId, result.size)
        return result
    }

    // 아이템 삭제
    fun deleteItem(itemId: Long) {
        log.info("아이템 삭제 시작 - 아이템ID: {}", itemId)
        
        if (!itemRepository.existsById(itemId)) {
            throw ItemNotFoundException("아이템을 찾을 수 없습니다. ID: $itemId")
        }

        itemRepository.deleteById(itemId)
        log.info("아이템 삭제 완료 - 아이템ID: {}", itemId)
    }

    // 아이템 수정
    fun updateItem(itemId: Long, itemDTO: ItemDTO) {
        log.info("아이템 수정 시작 - 아이템ID: {}, 새로운 이름: {}", itemId, itemDTO.name)
        
        val item = itemRepository.findById(itemId)
            .orElseThrow { ItemNotFoundException("아이템을 찾을 수 없습니다. ID: $itemId") }

        // 같은 카테고리에 동일한 이름의 다른 아이템이 있는지 확인 (자기 자신 제외)
        val categoryId = item.category?.id ?: throw IllegalStateException("아이템에 카테고리가 설정되지 않았습니다.")
        val existingItems = itemRepository.findByCategoryIdOrderByNameAsc(categoryId)
        val isDuplicate = existingItems.any { it.id != itemId && it.name == itemDTO.name }
        
        if (isDuplicate) {
            throw IllegalArgumentException("같은 카테고리에 동일한 이름의 아이템이 이미 존재합니다: ${itemDTO.name}")
        }

        item.name = itemDTO.name
        itemRepository.save(item)
        
        log.info("아이템 수정 완료 - 아이템ID: {}, 새로운 이름: {}", itemId, itemDTO.name)
    }

    // 아이템 체크 상태 변경
    fun updateItemCheckedStatus(itemId: Long) {
        log.info("아이템 체크 상태 변경 시작 - 아이템ID: {}", itemId)
        
        val item = itemRepository.findById(itemId)
            .orElseThrow { ItemNotFoundException("아이템을 찾을 수 없습니다. ID: $itemId") }

        item.checked = !item.checked
        itemRepository.save(item)
        
        log.info("아이템 체크 상태 변경 완료 - 아이템ID: {}, 새로운 상태: {}", itemId, item.checked)
    }
} 