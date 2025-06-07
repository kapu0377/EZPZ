package com.example.apiezpz.checklist.controller

import com.example.apiezpz.checklist.dto.ChecklistDTO
import com.example.apiezpz.checklist.service.ChecklistService
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/checklist")
class ChecklistController(
    private val checklistService: ChecklistService
) {
    
    companion object {
        private val log = LoggerFactory.getLogger(ChecklistController::class.java)
    }

    @PostMapping("/register")
    fun registerChecklist(
        @AuthenticationPrincipal userDetails: UserDetails,
        @RequestBody checklistDTO: ChecklistDTO
    ): ResponseEntity<String> {
        val username = userDetails.username
        checklistService.registerChecklist(username, checklistDTO)
        return ResponseEntity.status(HttpStatus.CREATED).body("체크리스트가 성공적으로 등록되었습니다.")
    }

    @GetMapping("/list")
    fun getMyChecklists(@AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<List<ChecklistDTO>> {
        val username = userDetails.username
        log.info("체크리스트 목록 요청 - 사용자: {}", username)
        val checklists = checklistService.list(username)
        log.info("체크리스트 목록 반환 - 사용자: {}, 개수: {}", username, checklists.size)
        return ResponseEntity.ok(checklists)
    }

    @GetMapping("/{id}")
    fun getChecklist(@PathVariable id: Long): ResponseEntity<ChecklistDTO> {
        val checklist = checklistService.readChecklist(id)
        return ResponseEntity.ok(checklist)
    }
    
    @PutMapping("/modify")
    fun modifyChecklist(
        @AuthenticationPrincipal userDetails: UserDetails,
        @RequestBody checklistDTO: ChecklistDTO
    ): ResponseEntity<String> {
        val username = userDetails.username
        checklistService.modifyChecklist(username, checklistDTO)
        return ResponseEntity.ok("체크리스트가 성공적으로 수정되었습니다.")
    }

    @DeleteMapping("/{id}")
    fun deleteChecklist(
        @AuthenticationPrincipal userDetails: UserDetails,
        @PathVariable id: Long
    ): ResponseEntity<String> {
        val username = userDetails.username
        checklistService.removeChecklist(username, id)
        return ResponseEntity.ok("체크리스트가 성공적으로 삭제되었습니다.")
    }

    @PostMapping("/{checklistId}/reset")
    fun resetPacking(@PathVariable checklistId: Long): ResponseEntity<String> {
        checklistService.resetPacking(checklistId)
        return ResponseEntity.ok("체크리스트의 모든 아이템이 초기화되었습니다.")
    }
} 