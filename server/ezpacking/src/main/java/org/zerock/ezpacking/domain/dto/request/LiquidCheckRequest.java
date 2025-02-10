package org.zerock.ezpacking.domain.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LiquidCheckRequest {
    private boolean isDomesticFlight;    // 국내선 여부
    private String  liquidType;       // 액체 종류
    private Double containerVolume;      // 용기 용량
    private Double totalVolume;          // 총 용량
    private Double alcoholPercentage;    // 알코올 도수 (해당하는 경우)
    private boolean isInZipLockBag;      // 지퍼백 포장 여부 (국제선)
}