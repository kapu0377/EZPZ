package com.example.apiezpz.checklist.controller;

import com.example.apiezpz.checklist.dto.ChecklistDTO;
import com.example.apiezpz.checklist.service.ChecklistService;
import com.example.apiezpz.domain.APIUser;
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

   @PostMapping(value = "/", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void addChecklist(@RequestParam Long memberId, @RequestBody ChecklistDTO checklistDTO) {
        log.info(checklistDTO);
        checklistService.registerChecklist(memberId, checklistDTO);
    }
    @GetMapping("/{id}")
    public ChecklistDTO getChecklist(@PathVariable("id") Long id){
//        log.info("read id: " + id);
        return checklistService.readChecklist(id);
    }
    @GetMapping(value = "/list/{memberId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<ChecklistDTO> list(@PathVariable("memberId") Long memberId){
        return checklistService.list(memberId);
    }
    @DeleteMapping(value= "/{id}")
    public void deleteChecklist(@RequestParam Long memberId, @PathVariable Long id){
        checklistService.removeChecklist(memberId, id);
    }
    @PutMapping(value="/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void updateChecklist(@RequestParam Long memberId, @PathVariable("id") Long id, @RequestBody ChecklistDTO checklistDTO ){
        //잘못된 id가 발생하지 못하도록
        checklistDTO.setId(id);
        checklistService.modifyChecklist(memberId, checklistDTO);
    }
}
