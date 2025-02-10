package org.zerock.ezpacking.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LiquidCheckResponse {
    private boolean isAllowed;           // 반입 가능 여부
    private String message;              // 결과 메시지
    private List<String> restrictions;   // 적용된 제한사항들
}