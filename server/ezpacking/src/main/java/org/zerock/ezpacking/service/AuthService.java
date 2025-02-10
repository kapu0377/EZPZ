package org.zerock.ezpacking.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.zerock.ezpacking.domain.dto.request.LoginRequest;
import org.zerock.ezpacking.domain.dto.response.TokenResponse;
import org.zerock.ezpacking.domain.entity.User;
import org.zerock.ezpacking.repository.UserRepository;
import org.zerock.ezpacking.security.JwtTokenProvider;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public TokenResponse login(LoginRequest request) {
        log.info("로그인 시도: username={}", request.getUsername());

        // 사용자 조회
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    log.error("로그인 실패: 사용자를 찾을 수 없습니다 (username={})", request.getUsername());
                    return new UsernameNotFoundException("사용자를 찾을 수 없습니다");
                });

        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.error("로그인 실패: 비밀번호 불일치 (username={})", request.getUsername());
            throw new BadCredentialsException("비밀번호가 일치하지 않습니다");
        }

        log.info("로그인 성공: username={}", user.getUsername());

        try {
            // JWT 토큰 생성을 위한 Map 생성
            Map<String, Object> claims = new HashMap<>();
            claims.put("mid", user.getMid());
            claims.put("username", user.getUsername());
            claims.put("role", user.getRole().name());
            claims.put("name", user.getName());

            // 토큰 생성
            log.debug("토큰 생성 시도: username={}", user.getUsername());
            Map<String, String> tokens = jwtTokenProvider.createAccessToken(claims);
            String accessToken = tokens.get("accessToken");
            String refreshToken = tokens.get("refreshToken");
            log.debug("토큰 생성 성공");

            // 응답 생성
            return TokenResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .mid(user.getMid())
                    .username(user.getUsername())
                    .name(user.getName())
                    .build();

        } catch (Exception e) {
            log.error("토큰 생성 실패: username={}", user.getUsername(), e);
            throw new RuntimeException("토큰 생성에 실패했습니다", e);
        }
    }

    public TokenResponse refresh(String refreshToken) {
        // 1. 리프레시 토큰 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("유효하지 않은 리프레시 토큰입니다.");
        }

        // 2. 토큰 타입 검증
        Claims claims = jwtTokenProvider.extractAllClaims(refreshToken);
        if (!"refresh".equals(claims.get("type"))) {
            throw new RuntimeException("올바른 리프레시 토큰이 아닙니다.");
        }

        String mid = jwtTokenProvider.getMid(refreshToken);
        User user = userRepository.findByMid(mid)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 새로운 클레임 생성
        Map<String, Object> newClaims = new HashMap<>();
        newClaims.put("mid", user.getMid());
        newClaims.put("username", user.getUsername());
        newClaims.put("role", user.getRole().name());
        newClaims.put("name", user.getName());

        // 리프레시 토큰 만료까지 남은 시간 확인 (1시간 이하)
        long remainingTime = jwtTokenProvider.getRefreshTokenRemainingTime(refreshToken);
        long thresholdTime = 3600000; 

        Map<String, String> tokens;
        if (remainingTime < thresholdTime) {
            tokens = jwtTokenProvider.createAccessToken(newClaims);
        } else {
            String newAccessToken = jwtTokenProvider.createToken(newClaims, 
                    jwtTokenProvider.getAccessTokenValidityInMilliseconds());
            tokens = new HashMap<>();
            tokens.put("accessToken", newAccessToken);
            tokens.put("refreshToken", refreshToken);
        }

        return TokenResponse.builder()
                .accessToken(tokens.get("accessToken"))
                .refreshToken(tokens.get("refreshToken"))
                .mid(user.getMid())
                .username(user.getUsername())
                .name(user.getName())
                .build();
    }
}

