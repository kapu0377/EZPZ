package com.example.apiezpz.auth.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import com.example.apiezpz.checklist.repository.ChecklistRepository;
import com.example.apiezpz.comment.repository.CommentRepository;
import com.example.apiezpz.post.repository.PostRepository;
import com.example.apiezpz.search.repository.SearchHistoryRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.apiezpz.auth.dto.LoginRequest;
import com.example.apiezpz.auth.dto.SignUpRequest;
import com.example.apiezpz.auth.dto.Token;
import com.example.apiezpz.auth.entity.RefreshToken;
import com.example.apiezpz.auth.entity.User;
import com.example.apiezpz.auth.repository.RefreshTokenRepository;
import com.example.apiezpz.auth.repository.UserRepository;
import com.example.apiezpz.auth.security.JwtTokenProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    private final ChecklistRepository checklistRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final SearchHistoryRepository searchHistoryRepository;

    // 1) 회원가입
    public void signup(SignUpRequest request) {
        log.debug("회원가입 요청: username={}", request.getUsername());
        
        if (userRepository.findByUsername(request.getUsername()) != null) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .gender(User.Gender.valueOf(request.getGender()))
                .build();

        userRepository.save(user);
        log.debug("회원가입 성공: username={}", request.getUsername());
    }

    // 2) 로그인 -> Access & Refresh 토큰 발급
    public Token login(LoginRequest request) {
        try {
            log.info("로그인 시도 - username: {}", request.getUsername());
            
            User user = userRepository.findByUsername(request.getUsername());
            if (user == null) {
                log.error("사용자를 찾을 수 없음 - username: {}", request.getUsername());
                throw new IllegalArgumentException("존재하지 않는 아이디입니다.");
            }
            
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
            }
            
            log.info("사용자 조회 성공 - username: {}", user.getUsername());

            refreshTokenRepository.deleteByUsername(user.getUsername());
            
            String accessToken = jwtTokenProvider.generateAccessToken(user.getUsername());
            String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUsername());
            
            RefreshToken refreshTokenEntity = new RefreshToken();
            refreshTokenEntity.setUsername(user.getUsername());
            refreshTokenEntity.setToken(refreshToken);
            refreshTokenEntity.setExpirationTime(System.currentTimeMillis() + 
                    (jwtTokenProvider.getRefreshTokenExpirationMinutes() * 60 * 1000));
            refreshTokenEntity.setUser(user);
            refreshTokenRepository.save(refreshTokenEntity);
            
            return Token.builder()
                    .accessToken(accessToken)
                    .accessTokenExpiresIn(calcExpirySeconds(accessToken))
                    .username(user.getUsername())
                    .name(user.getName())
                    .build();
        } catch (Exception e) {
            log.error("로그인 처리 중 오류 발생", e);
            throw e;
        }
    }
    // 3) 토큰 재발급
    public Token reissue(String username) {
        RefreshToken refreshToken = refreshTokenRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("로그아웃 된 사용자입니다"));
    
        User user = userRepository.findByUsername(username);
        String newAccessToken = jwtTokenProvider.generateAccessToken(username);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(username);
        
        // 리프레시 토큰 업데이트
        refreshToken.setToken(newRefreshToken);
        refreshToken.setExpirationTime(System.currentTimeMillis() + 
                (jwtTokenProvider.getRefreshTokenExpirationMinutes() * 60 * 1000));
        refreshTokenRepository.save(refreshToken);
    
        return Token.builder()
                .accessToken(newAccessToken)
                .accessTokenExpiresIn(calcExpirySeconds(newAccessToken))
                .username(user.getUsername())
                .name(user.getName())
                .build();
    }
    // 4) 로그아웃
    public void logout(String username) {
        refreshTokenRepository.deleteByUsername(username);
    }

    // 5) 회원수정
    public void updateUser(String username, SignUpRequest updatedUserInfo) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        // 변경 가능한 필드 업데이트
        user.setName(updatedUserInfo.getName());
        user.setPhone(updatedUserInfo.getPhone());
        user.setEmail(updatedUserInfo.getEmail());
        user.setAddress(updatedUserInfo.getAddress());

        // 비밀번호 변경이 요청된 경우만 업데이트
        if (updatedUserInfo.getPassword() != null && !updatedUserInfo.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updatedUserInfo.getPassword()));
        }

        userRepository.save(user);
    }

   // 만료까지 남은 시간 계산 메서드
    private Long calcExpirySeconds(String token) {
        LocalDateTime expiry = jwtTokenProvider.getTokenExpiryDateTime(token);
        LocalDateTime now = LocalDateTime.now();
        long diffInSeconds = ChronoUnit.SECONDS.between(now, expiry);
        return Math.max(diffInSeconds, 0);
    }

    public void deleteUser(String username, String password) {
        User user = userRepository.findByUsername(username);
        // 입력된 비밀번호 검증
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return; // 비밀번호 불일치
        }
        // 1.토큰 삭제
        refreshTokenRepository.deleteByUsername(user.getUsername());
        // 2.탈퇴회원 관련 데이터 삭제 (체크리스트, 게시글, 댓글, 검색기록)
        checklistRepository.deleteByUsername(user.getUsername());
        postRepository.deleteByWriter(user.getUsername());
        commentRepository.deleteByWriter(user.getUsername());
        searchHistoryRepository.deleteByUser(user);
        // 3.회원 삭제
        userRepository.delete(user);
        System.out.println("회원 탈퇴 완료: " + username);
    }

    public boolean verifyPassword(String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("존재하지 않는 사용자입니다.");
        }

        return passwordEncoder.matches(password, user.getPassword());
    }

}