package org.zerock.ezpacking.domain.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankingResponse {
    private String name;
    private Long count;
    private boolean carryOnAllowed;
    private boolean checkedAllowed;
    private String restrictions;
}