package com.example.apiezpz.checklist.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemDTO {
    private Long id;
    private String name;
    private boolean checked;
    private Long categoryId;
}