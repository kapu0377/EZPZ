package com.example.apiezpz.checklist.controller;

import com.example.apiezpz.checklist.dto.ItemDTO;
import com.example.apiezpz.checklist.service.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@Log4j2
public class ItemController {
    private final ItemService itemService;

    // 아이템 추가
    @PostMapping("/{categoryId}")
    public ResponseEntity<Void> addItem(@PathVariable Long categoryId, @RequestBody ItemDTO itemDTO) {
        itemService.saveItem(categoryId, itemDTO);
        return ResponseEntity.ok().build();
    }

    // 카테고리별 아이템 목록 조회
    @GetMapping("/list/{categoryId}")
    public ResponseEntity<List<ItemDTO>> getItemsByCategory(@PathVariable Long categoryId) {
        List<ItemDTO> items = itemService.getAllItems(categoryId);
        return ResponseEntity.ok(items);
    }

    // 아이템 삭제
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        itemService.deleteItem(itemId);
        return ResponseEntity.ok().build();
    }

    // 아이템 수정
    @PutMapping("/{itemId}")
    public ResponseEntity<Void> updateItem(@PathVariable Long itemId, @RequestBody ItemDTO itemDTO) {
        itemService.updateItem(itemId, itemDTO);
        return ResponseEntity.ok().build();
    }

    // 아이템 체크 상태 변경
//    @PatchMapping("/{itemId}/checked")
//    public ResponseEntity<Void> updateCheckedStatus(@PathVariable Long itemId, @RequestParam boolean checked) {
//        itemService.updateItemCheckedStatus(itemId, checked);
//        return ResponseEntity.ok().build();
//    }
    @PutMapping("/{itemId}/checked")
    public ResponseEntity<Void> updateCheckedStatus(@PathVariable Long itemId) {
        itemService.updateItemCheckedStatus(itemId);
        return ResponseEntity.ok().build();
    }
}
