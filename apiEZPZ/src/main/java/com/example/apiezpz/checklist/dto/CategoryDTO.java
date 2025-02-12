package com.example.apiezpz.checklist.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private Long id;
    private String name;
    private Long checklistId; // 체크리스트 ID
    private List<ItemDTO> items;    //아이템 리스트 포함
}
