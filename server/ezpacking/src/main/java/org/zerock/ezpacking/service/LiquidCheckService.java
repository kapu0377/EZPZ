package org.zerock.ezpacking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.zerock.ezpacking.domain.dto.request.LiquidCheckRequest;
import org.zerock.ezpacking.domain.dto.response.LiquidCheckResponse;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LiquidCheckService {

    public LiquidCheckResponse checkLiquidAllowance(LiquidCheckRequest request) {
        if (request.isDomesticFlight()) {
            return checkDomesticLiquid(request);
        } else {
            return checkInternationalLiquid(request);
        }
    }

    private LiquidCheckResponse checkDomesticLiquid(LiquidCheckRequest request) {
        String liquidType = request.getLiquidType();

        // 음료류 체크
        if ("BEVERAGE".equals(liquidType)) {
            return new LiquidCheckResponse(
                    true,
                    "기내 반입 가능한 음료류입니다.",
                    Collections.emptyList()
            );
        }

        // 알코올 체크
        if ("ALCOHOL".equals(liquidType)) {
            return checkDomesticAlcohol(request);
        }

        // 화장품/의약품 체크
        if ("COSMETICS".equals(liquidType) || "MEDICINE".equals(liquidType)) {
            return checkDomesticCosmeticsAndMedicine(request);
        }

        // 그 외의 경우 (허용되지 않은 타입)
        return new LiquidCheckResponse(
                false,
                "규정에 명시되지 않은 액체류는 기내 반입이 제한됩니다.",
                Collections.singletonList("규정에 명시되지 않은 액체류")
        );
    }

    private LiquidCheckResponse checkInternationalLiquid(LiquidCheckRequest request) {
        List<String> restrictions = new ArrayList<>();

        // 용기 용량 확인
        if (request.getContainerVolume() > 100) {
            return new LiquidCheckResponse(false,
                    "100ml를 초과하는 용기에 담긴 액체류는 반입이 불가합니다.",
                    Collections.singletonList("용기 용량 100ml 초과"));
        }

        // 총량 확인
        if (request.getTotalVolume() > 1000) {
            return new LiquidCheckResponse(false,
                    "총량이 1L를 초과하는 액체류는 반입이 불가합니다.",
                    Collections.singletonList("총량 1L 초과"));
        }

        // 포장 조건 확인
        if (!request.isInZipLockBag()) {
            return new LiquidCheckResponse(false,
                    "투명한 지퍼백(20cm×20cm 이하)에 담겨있지 않은 액체류는 반입이 불가합니다.",
                    Collections.singletonList("지퍼백 포장 미비"));
        }

        return new LiquidCheckResponse(true,
                "국제선 액체류 규정에 부합합니다.",
                Collections.emptyList());
    }

    private LiquidCheckResponse checkDomesticAlcohol(LiquidCheckRequest request) {
        Double percentage = request.getAlcoholPercentage();

        // 알코올 도수 정보 필수 체크
        if (percentage == null) {
            return new LiquidCheckResponse(
                    false,
                    "알코올 음료의 경우 도수 정보가 필요합니다.",
                    Collections.singletonList("알코올 도수 정보 누락")
            );
        }

        // 알코올 도수에 따른 규정 적용
        if (percentage > 70) {
            // 70도 초과: 절대 반입 불가
            return new LiquidCheckResponse(
                    false,
                    "알코올 도수가 70%를 초과하는 경우 기내 반입이 불가합니다.",
                    Collections.singletonList("알코올 도수 70% 초과")
            );
        } else if (percentage >= 24) {
            // 24-70도: 5L 제한
            if (request.getTotalVolume() > 5000) {
                return new LiquidCheckResponse(
                        false,
                        "24-70% 알코올 음료는 승객당 5리터까지만 반입 가능합니다.",
                        Collections.singletonList("허용량 5L 초과")
                );
            }
            return new LiquidCheckResponse(
                    true,
                    "기내 반입 가능한 알코올 음료입니다. (5L 이하 허용)",
                    Collections.singletonList("24-70% 알코올 음료는 5L까지 허용")
            );
        } else {
            // 24도 미만: 저도수 알코올 음료로 취급
            return new LiquidCheckResponse(
                    true,
                    "기내 반입 가능한 알코올 음료입니다.",
                    Collections.singletonList("24% 미만 알코올 음료는 저도수 알코올음료")
            );
        }
    }
    private LiquidCheckResponse checkDomesticCosmeticsAndMedicine(LiquidCheckRequest request) {
        List<String> restrictions = new ArrayList<>();

        // 용기 용량 체크 (0.5L = 500ml 이하)
        if (request.getContainerVolume() > 500) {
            return new LiquidCheckResponse(
                    false,
                    "화장품/의약품은 0.5L 이하의 용기에 담겨있어야 합니다.",
                    Collections.singletonList("용기 용량 0.5L 초과")
            );
        }

        // 총량 체크 (2L = 2000ml 이하)
        if (request.getTotalVolume() > 2000) {
            return new LiquidCheckResponse(
                    false,
                    "화장품/의약품의 총량은 2L 이하여야 합니다.",
                    Collections.singletonList("총량 2L 초과")
            );
        }

        // 모든 조건을 만족하는 경우
        String typeDescription = "COSMETICS".equals(request.getLiquidType()) ? "화장품" : "의약품";

        return new LiquidCheckResponse(
                true,
                String.format("%s의 기내 반입이 가능합니다.", typeDescription),
                Collections.emptyList()
        );
    }
}