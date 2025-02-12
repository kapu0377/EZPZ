package com.example.apiezpz.checklist.repository;

import com.example.apiezpz.checklist.domain.Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {
}
