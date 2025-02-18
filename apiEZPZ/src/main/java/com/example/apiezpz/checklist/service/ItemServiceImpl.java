package com.example.apiezpz.checklist.service;

import com.example.apiezpz.checklist.domain.Category;
import com.example.apiezpz.checklist.domain.ChecklistItem;
import com.example.apiezpz.checklist.dto.ItemDTO;
import com.example.apiezpz.checklist.repository.CategoryRepository;
import com.example.apiezpz.checklist.repository.ChecklistItemRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class ItemServiceImpl implements ItemService {
    private final ChecklistItemRepository checklistItemRepository;
    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;

    @Override
    public void saveItem(Long categoryId, ItemDTO itemDTO) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("해당 카테고리가 존재하지 않습니다."));

        // 중복 검사 (선택적으로 사용 가능)
        boolean exists = checklistItemRepository.existsByCategoryIdAndName(categoryId, itemDTO.getName());
        if (exists) {
            throw new RuntimeException("이미 존재하는 아이템입니다.");
        }

        ChecklistItem checklistItem = modelMapper.map(itemDTO, ChecklistItem.class);
        checklistItem.setCategory(category);
        checklistItemRepository.save(checklistItem);
    }

    @Override
    public List<ItemDTO> getAllItems(Long categoryId) {
        List<ChecklistItem> checklistItems = checklistItemRepository.findByCategoryIdOrderByNameAsc(categoryId);
        return checklistItems.stream()
                .map(item -> modelMapper.map(item, ItemDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteItem(Long itemId) {
        ChecklistItem checklistItem = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("해당 아이템이 존재하지 않습니다."));
        checklistItemRepository.delete(checklistItem);
    }

    @Override
    public void updateItem(Long itemId, ItemDTO itemDTO) {
        ChecklistItem checklistItem = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("해당 아이템이 존재하지 않습니다."));

        checklistItem.setName(itemDTO.getName());
        checklistItem.setChecked(itemDTO.isChecked()); // 체크 상태 변경
    }

    @Override
    public void updateItemCheckedStatus(Long itemId) {  //체크 여부 변경시 true-false 전환
        ChecklistItem checklistItem = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("아이템이 존재하지 않습니다."));
        checklistItem.setChecked(!checklistItem.isChecked()); // 체크 상태 반전
        checklistItemRepository.save(checklistItem);
    }

//    @Override
//    public void updateItemCheckedStatus(Long itemId, boolean checked) {
//        ChecklistItem item = checklistItemRepository.findById(itemId)
//                .orElseThrow(() -> new RuntimeException("해당 아이템이 존재하지 않습니다."));
//        item.setChecked(checked);
//    }
}
