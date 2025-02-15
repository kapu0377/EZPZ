package com.example.apiezpz.controller;

import com.example.apiezpz.domain.Prohibit;
import com.example.apiezpz.service.ProhibitedItemsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import java.util.List;


@RestController
@RequestMapping("/api/prohibit-items")
public class ProhibitedItemsController {

    private final ProhibitedItemsService prohibitedItemsService;

    public ProhibitedItemsController(ProhibitedItemsService service) {
        prohibitedItemsService = service;
    }

    @GetMapping
    public List<Prohibit> getAllItems() {
        return prohibitedItemsService.getAllItems();
    }

    @GetMapping("/category")
    public List<Prohibit> getItemsByCategory(@RequestParam String gubun) {
        return prohibitedItemsService.getItemsByCategory(gubun);
    }
}

