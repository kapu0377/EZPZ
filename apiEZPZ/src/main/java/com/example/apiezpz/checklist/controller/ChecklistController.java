package com.example.apiezpz.checklist.controller;

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

    // 특정 회원의 체크리스트 추가
   @PostMapping(value = "/", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void addChecklist(@RequestParam Long memberId, @RequestBody ChecklistDTO checklistDTO) {
        log.info(checklistDTO);
        checklistService.registerChecklist(memberId, checklistDTO);
    }

    // 특정 카테고리 조회
    @GetMapping("/{id}")
    public ChecklistDTO getChecklist(@PathVariable("id") Long id){
//        log.info("read id: " + id);
        return checklistService.readChecklist(id);
    }

    // 회원별 체크리스트 목록 조회
    @GetMapping(value = "/list/{memberId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<ChecklistDTO> list(@PathVariable("memberId") Long memberId){
        return checklistService.list(memberId);
    }

    // 체크리스트 삭제
    @DeleteMapping(value= "/{id}")
    public void deleteChecklist(@RequestParam Long memberId, @PathVariable("id") Long id){
        checklistService.removeChecklist(memberId, id);
    }

    // 체크리스트 이름 수정
    @PutMapping(value="/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void updateChecklist(@RequestParam Long memberId, @PathVariable("id") Long id, @RequestBody ChecklistDTO checklistDTO ){
        //잘못된 id가 발생하지 못하도록
        checklistDTO.setId(id);
        checklistService.modifyChecklist(memberId, checklistDTO);
    }
}
