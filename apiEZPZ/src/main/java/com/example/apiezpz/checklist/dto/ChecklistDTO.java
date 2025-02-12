package com.example.apiezpz.checklist.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistDTO {
    private Long id;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private List<CategoryDTO> categories;
}