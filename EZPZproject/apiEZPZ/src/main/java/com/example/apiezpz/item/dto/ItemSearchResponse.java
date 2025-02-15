package com.example.apiezpz.item.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder
public class ItemSearchResponse {
    private boolean isAllowed;
    private boolean isConditional;
    private String originalText;
    private String restrictions;
    private String name;
    private String category;
}