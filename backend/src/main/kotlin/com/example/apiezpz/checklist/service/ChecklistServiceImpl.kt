package com.example.apiezpz.checklist.service

import com.example.apiezpz.checklist.domain.Checklist
import com.example.apiezpz.checklist.dto.CategoryDTO
import com.example.apiezpz.checklist.dto.ChecklistDTO
import com.example.apiezpz.checklist.repository.ChecklistRepository
import com.example.apiezpz.checklist.repository.ChecklistItemRepository
import jakarta.transaction.Transactional
import org.modelmapper.ModelMapper
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
@Transactional  // save 자동 반영
class ChecklistServiceImpl(
    private val checklistRepository: ChecklistRepository,
    private val modelMapper: ModelMapper,
    private val checklistItemRepository: ChecklistItemRepository
) : ChecklistService {
    
    private val log = LoggerFactory.getLogger(ChecklistServiceImpl::class.java)

    override fun registerChecklist(username: String, checklistDTO: ChecklistDTO) {
        val checklist = modelMapper.map(checklistDTO, Checklist::class.java)
        checklist.username = username // Token에서 가져온 username 저장
        checklistRepository.save(checklist)
    }

    override fun readChecklist(id: Long): ChecklistDTO {
        val checklist = checklistRepository.findById(id)
            .orElseThrow { RuntimeException("해당 체크리스트 존재하지 않음") }
        val checklistDTO = modelMapper.map(checklist, ChecklistDTO::class.java)

        // 체크리스트의 카테고리 목록을 DTO로 변환해서 추가
        val categories = checklist.categories.map { category ->
            modelMapper.map(category, CategoryDTO::class.java)
        }

        checklistDTO.categories = categories
        return checklistDTO
    }

    override fun list(username: String): List<ChecklistDTO> {
        val checklists = checklistRepository.findByUsername(username)
        return checklists.map { checklist ->
            modelMapper.map(checklist, ChecklistDTO::class.java)
        }
    }

    override fun removeChecklist(username: String, id: Long) {
        val checklist = checklistRepository.findById(id)
            .orElseThrow { RuntimeException("해당 체크리스트가 존재하지 않습니다.") }
        if (checklist.username != username) {
            throw RuntimeException("이 체크리스트를 삭제할 권한이 없습니다.")
        }
        checklistRepository.delete(checklist)
    }

    override fun modifyChecklist(username: String, checklistDTO: ChecklistDTO) {
        val checklist = checklistRepository.findById(checklistDTO.id!!)
            .orElseThrow { RuntimeException("해당 체크리스트가 존재하지 않습니다.") }

        if (checklist.username != username) {
            throw RuntimeException("이 체크리스트를 수정할 권한이 없습니다.")
        }

        checklist.title = checklistDTO.title
        checklist.departureDate = checklistDTO.departureDate
        checklist.returnDate = checklistDTO.returnDate

        checklistRepository.save(checklist) //  수정된 내용 저장
    }

    override fun resetPacking(checklistId: Long) {
        // 체크리스트에 속한 모든 아이템의 체크 상태를 false로 변경
        val checklistItems = checklistItemRepository.findByChecklistId(checklistId)
        checklistItems.forEach { item -> item.checked = false }
        checklistItemRepository.saveAll(checklistItems)
    }
} 