package com.example.apiezpz.checklist.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistDTO {
    private Long id;
    private String title;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private List<CategoryDTO> categories;   //카테고리 목록
}