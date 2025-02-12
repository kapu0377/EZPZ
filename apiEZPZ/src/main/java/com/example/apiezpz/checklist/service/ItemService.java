package com.example.apiezpz.checklist.service;

import com.example.apiezpz.checklist.domain.Item;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public interface ItemService {
    void saveItem(Item item);
}
