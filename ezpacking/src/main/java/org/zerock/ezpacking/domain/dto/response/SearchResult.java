package org.zerock.ezpacking.domain.dto.response;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResult {
    private String item;
    private String status;
    private String details;
}