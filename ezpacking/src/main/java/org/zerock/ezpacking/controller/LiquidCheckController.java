package org.zerock.ezpacking.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.ezpacking.domain.dto.request.LiquidCheckRequest;
import org.zerock.ezpacking.domain.dto.response.LiquidCheckResponse;
import org.zerock.ezpacking.service.LiquidCheckService;

@RestController
@RequestMapping("/api/liquid-check")
@RequiredArgsConstructor
public class LiquidCheckController {

    private final LiquidCheckService liquidCheckService;

    @PostMapping("/check")
    public ResponseEntity<LiquidCheckResponse> checkLiquid(@RequestBody LiquidCheckRequest request) {
        LiquidCheckResponse response = liquidCheckService.checkLiquidAllowance(request);
        return ResponseEntity.ok(response);
    }
}