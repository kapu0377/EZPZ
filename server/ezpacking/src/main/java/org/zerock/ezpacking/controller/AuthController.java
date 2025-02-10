package org.zerock.ezpacking.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.zerock.ezpacking.domain.dto.request.LoginRequest;
import org.zerock.ezpacking.domain.dto.request.SignUpRequest;
import org.zerock.ezpacking.domain.dto.response.TokenResponse;
import org.zerock.ezpacking.domain.dto.response.UserResponse;
import org.zerock.ezpacking.service.AuthService;
import org.zerock.ezpacking.service.UserService;
import org.zerock.ezpacking.domain.entity.User;

import java.util.Map;

@Log4j2
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {
    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest request) {
        log.info("Login request received for username: {}", request.getUsername());
        TokenResponse response = authService.login(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + response.getAccessToken())
                .body(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<UserResponse> signup(@Valid @RequestBody SignUpRequest request) {
        User user = userService.createUser(request);
        return ResponseEntity.ok(UserResponse.from(user));
    }
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(
            @RequestBody(required = false) Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String refreshToken = null;

        if (body != null && body.containsKey("refreshToken")) {
            refreshToken = body.get("refreshToken");
        } else if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer")) {
            refreshToken = authHeader.substring(7);
        }

        if (refreshToken == null) {
            throw new RuntimeException("리프레시 토큰이 제공되지 않았습니다.");
        }

        TokenResponse response = authService.refresh(refreshToken);
        return ResponseEntity.ok(response);
    }
}