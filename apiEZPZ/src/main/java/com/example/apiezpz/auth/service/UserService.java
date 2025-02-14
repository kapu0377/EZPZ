package com.example.apiezpz.auth.service;

import com.example.apiezpz.auth.dto.SignUpRequest;
import com.example.apiezpz.auth.entity.User;
import com.example.apiezpz.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    public User signup(SignUpRequest request) {

        // 1. 중복 아이디 체크
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        // 2. 비밀번호 암호화 (BCrypt)
        String encodedPassword = bCryptPasswordEncoder.encode(request.getPassword());

        // 3. User Entity 빌드
        User user = User.builder()
                .username(request.getUsername())
                .password(encodedPassword)
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .gender(request.getGender().equals("MALE") ? User.Gender.MALE : User.Gender.FEMALE)
                .build();

        // 4. 저장 후 반환
        return userRepository.save(user);
    }
}