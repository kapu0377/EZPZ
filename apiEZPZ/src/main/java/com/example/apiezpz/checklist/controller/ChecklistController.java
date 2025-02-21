package com.example.apiezpz.checklist.controller;

import com.example.apiezpz.auth.security.JwtTokenProvider;
import com.example.apiezpz.checklist.dto.ChecklistDTO;
import com.example.apiezpz.checklist.service.ChecklistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklist")
@Log4j2
@RequiredArgsConstructor
public class ChecklistController {
    private final ChecklistService checklistService;
    private final JwtTokenProvider jwtTokenProvider;

    // 특정 회원의 체크리스트 추가
    @PostMapping(value = "/", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void addChecklist(@RequestHeader("Authorization") String token, @RequestBody ChecklistDTO checklistDTO) {
        String username = jwtTokenProvider.getUsernameFromToken(token.substring(7)); // Bearer 제거 후 username 추출
        checklistService.registerChecklist(username, checklistDTO);
    }


    // 특정 카테고리 조회
    @GetMapping("/{id}")
    public ChecklistDTO getChecklist(@PathVariable("id") Long id){
//        log.info("read id: " + id);
        return checklistService.readChecklist(id);
    }

    // 회원별 체크리스트 목록 조회
    @GetMapping(value = "/list", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<ChecklistDTO> list(@RequestHeader("Authorization") String token) {
        String username = jwtTokenProvider.getUsernameFromToken(token.substring(7)); // 토큰에서 username 추출
        return checklistService.list(username);
    }

    // 체크리스트 삭제
    @DeleteMapping(value= "/{id}")
    public void deleteChecklist(@RequestHeader("Authorization") String token, @PathVariable("id") Long id){
        String username = jwtTokenProvider.getUsernameFromToken(token.substring(7)); // 토큰에서 username 추출
        checklistService.removeChecklist(username, id);
    }


    // 체크리스트 이름 수정
    @PutMapping(value="/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void updateChecklist(@RequestHeader("Authorization") String token, @PathVariable("id") Long id, @RequestBody ChecklistDTO checklistDTO ){
        String username = jwtTokenProvider.getUsernameFromToken(token.substring(7)); // ✅ 토큰에서 username 추출
        checklistDTO.setId(id);
        checklistService.modifyChecklist(username, checklistDTO);
    }


    // 모든 아이템의 체크 상태를 해제하는 엔드포인트
    @PutMapping("/{checklistId}/reset")
    public void resetPacking(@PathVariable Long checklistId) {
        checklistService.resetPacking(checklistId);
    }
}
