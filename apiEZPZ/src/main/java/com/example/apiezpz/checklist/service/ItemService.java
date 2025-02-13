package com.example.apiezpz.checklist.service;

import com.example.apiezpz.checklist.dto.ItemDTO;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional
public interface ItemService {
    void saveItem(Long categoryId, ItemDTO itemDTO);    //아이템 추가(중복 검사)
    List<ItemDTO> getAllItems(Long categoryId); //카테고리별 아이템 목록 조회(정렬?)
    void deleteItem(Long itemId);   //아이템 삭제
    void updateItem(Long itemId, ItemDTO itemDTO);  //아이템(이름,체크상태) 수정
//    void updateItemCheckedStatus(Long itemId, boolean checked); //아이템 체크상태 변경
    void updateItemCheckedStatus(Long itemId); //아이템 체크상태 변경

}
