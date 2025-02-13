package com.example.apiezpz.item.service;

import com.example.apiezpz.item.dto.ItemSearchResponse;
import com.example.apiezpz.item.entity.Item;
import com.example.apiezpz.item.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Log4j2
public class ItemSearchService {
    private final ItemRepository itemRepository;

    @Transactional(readOnly = true)
    public ItemSearchResponse searchItems(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return ItemSearchResponse.builder()
                    .isAllowed(true)
                    .isConditional(false)
                    .originalText("검색어를 입력해주세요.")
                    .build();
        }

        Set<Item> items = new HashSet<>();
        items.addAll(itemRepository.findByNameContainingIgnoreCase(keyword));
        items.addAll(itemRepository.findByOriginalTextContaining(keyword));

        if (items.isEmpty()) {
            log.info("No items found for keyword: {}", keyword);
            // 검색 결과가 없을 경우 기본적으로 반입 가능으로 처리
            return ItemSearchResponse.builder()
                    .isAllowed(true)
                    .isConditional(false)
                    .originalText("해당 물품은 기본적으로 기내 반입이 가능합니다.")
                    .build();
        }

        // 검색된 물품들 중에서 판단
        boolean hasProhibitedItem = items.stream()
                .anyMatch(item -> !item.isAllowed());

        boolean isConditional = items.stream()
                .anyMatch(Item::isConditional);

        Item representativeItem = items.iterator().next();

        if (hasProhibitedItem) {
            // 완전 금지 물품이 있는 경우
            return ItemSearchResponse.builder()
                    .isAllowed(false)
                    .isConditional(false)
                    .originalText(representativeItem.getOriginalText())
                    .name(representativeItem.getName())
                    .category(representativeItem.getCategory())
                    .restrictions(representativeItem.getRestrictions())
                    .build();
        } else if (isConditional) {
            // 조건부 허용 물품인 경우
            return ItemSearchResponse.builder()
                    .isAllowed(true)
                    .isConditional(true)
                    .originalText(representativeItem.getOriginalText())
                    .name(representativeItem.getName())
                    .category(representativeItem.getCategory())
                    .restrictions(representativeItem.getRestrictions())
                    .build();
        } else {
            // 완전 허용 물품인 경우
            return ItemSearchResponse.builder()
                    .isAllowed(true)
                    .isConditional(false)
                    .originalText(representativeItem.getOriginalText())
                    .name(representativeItem.getName())
                    .category(representativeItem.getCategory())
                    .build();
        }
    }
}