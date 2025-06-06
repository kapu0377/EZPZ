package com.example.apiezpz.auth.service

import com.example.apiezpz.auth.dto.SignUpRequest
import com.example.apiezpz.auth.entity.User
import com.example.apiezpz.auth.repository.UserRepository
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository
) {
    private val bCryptPasswordEncoder = BCryptPasswordEncoder()

    fun signup(request: SignUpRequest): User {
        // 1. 중복 아이디 체크
        if (userRepository.existsByUsername(request.username)) {
            throw IllegalArgumentException("이미 사용 중인 아이디입니다.")
        }

        // 2. 비밀번호 암호화 (BCrypt)
        val encodedPassword = bCryptPasswordEncoder.encode(request.password)

        // 3. User Entity 빌드
        val user = User(
            username = request.username,
            password = encodedPassword,
            name = request.name,
            phone = request.phone,
            email = request.email,
            address = request.address,
            gender = if (request.gender == "MALE") User.Gender.MALE else User.Gender.FEMALE
        )

        // 4. 저장 후 반환
        return userRepository.save(user)
    }
} 