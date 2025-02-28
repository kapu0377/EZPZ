package com.example.apiezpz.auth.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.apiezpz.auth.dto.LoginRequest;
import com.example.apiezpz.auth.dto.SignUpRequest;
import com.example.apiezpz.auth.dto.Token;
import com.example.apiezpz.auth.dto.TokenRequest;
import com.example.apiezpz.auth.entity.RefreshToken;
import com.example.apiezpz.auth.entity.User;
import com.example.apiezpz.auth.repository.RefreshTokenRepository;
import com.example.apiezpz.auth.repository.UserRepository;
import com.example.apiezpz.auth.security.JwtTokenProvider;
import com.example.apiezpz.auth.service.AuthService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignUpRequest request) {
        try {
            authService.signup(request);
            return ResponseEntity.ok("회원가입 성공");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            log.info("로그인 요청 데이터: {}", request);
            Token tokenDto = authService.login(request);
            log.info("생성된 토큰 정보: {}", tokenDto);
            
            if (tokenDto == null || tokenDto.getAccessToken() == null) {
                log.error("토큰 생성 실패");
                return ResponseEntity.badRequest().body("토큰 생성 실패");
            }
            
            return ResponseEntity.ok().body(tokenDto);
        } catch (Exception e) {
            log.error("로그인 처리 중 오류 발생: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reissue")
    public ResponseEntity<?> reissue(@RequestBody TokenRequest tokenRequest) {
        try {
            log.info("토큰 재발급 요청 - accessToken: {}", tokenRequest.getAccessToken());
            
            String username = jwtTokenProvider.getUsernameFromToken(tokenRequest.getAccessToken());
            if (username == null) {
                log.error("토큰에서 username 추출 실패");
                return ResponseEntity.badRequest().body("유효하지 않은 토큰입니다.");
            }
            
            log.info("토큰에서 추출한 username: {}", username);
            
            RefreshToken refreshToken = refreshTokenRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("로그아웃 된 사용자입니다."));
                
            if (!jwtTokenProvider.validateToken(refreshToken.getToken())) {
                log.error("유효하지 않은 리프레시 토큰");
                return ResponseEntity.badRequest().body("리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.");
            }
            
            Token tokenDto = authService.reissue(username);
            log.info("새로운 토큰 발급 완료 - accessToken: {}", tokenDto.getAccessToken());
            
            return ResponseEntity.ok(tokenDto);
        } catch (Exception e) {
            log.error("토큰 재발급 중 오류 발생", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody TokenRequest tokenRequest) {
        try {
            String username = jwtTokenProvider.getUsernameFromToken(tokenRequest.getAccessToken());
            if (username == null) {
                return ResponseEntity.badRequest().body("유효하지 않은 토큰입니다.");
            }
            
            authService.logout(username);
            return ResponseEntity.ok("로그아웃 성공");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 회원수정
    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestHeader("Authorization") String token, @RequestBody SignUpRequest updatedUserInfo) {
        try {
            String username = jwtTokenProvider.getUsernameFromToken(token.replace("Bearer ", ""));
            authService.updateUser(username, updatedUserInfo);
            return ResponseEntity.ok("회원 정보가 수정되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //회원 정보
    @GetMapping("/me")
    public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtTokenProvider.getUsernameFromToken(token.replace("Bearer ", ""));
            User user = userRepository.findByUsername(username);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("사용자를 찾을 수 없습니다.");
            }

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("name", user.getName());
            userInfo.put("phone", user.getPhone());
            userInfo.put("email", user.getEmail());
            userInfo.put("address", user.getAddress());

            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 실패");
        }
    }

    //회원 탈퇴
    @DeleteMapping("/delete")
    @PreAuthorize("isAuthenticated()") // 인증된 사용자만 접근 가능
    public ResponseEntity<?> deleteUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> requestBody // 클라이언트에서 비밀번호 받기
    ) {
        try {
            String username = userDetails.getUsername();
            String inputPassword = requestBody.get("password"); // 클라이언트에서 입력한 비밀번호

            authService.deleteUser(username, inputPassword); // 비밀번호 검증 후 삭제 실행

            return ResponseEntity.ok("회원 탈퇴가 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("회원 탈퇴 중 오류 발생: " + e.getMessage());
        }
    }

    @PostMapping("/verify-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> verifyPassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> requestBody
    ) {
        try {
            String username = userDetails.getUsername();
            String inputPassword = requestBody.get("password");
            
            boolean isValid = authService.verifyPassword(username, inputPassword);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("valid", isValid);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호 검증 실패: " + e.getMessage());
        }
    }

}