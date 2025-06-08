package com.example.apiezpz.auth.service

import com.example.apiezpz.auth.dto.SignUpRequest
import com.example.apiezpz.auth.dto.UserRoleInfo
import com.example.apiezpz.auth.entity.User
import com.example.apiezpz.auth.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.security.access.AccessDeniedException

@Service
class UserService(
    private val userRepository: UserRepository
) {
    private val bCryptPasswordEncoder = BCryptPasswordEncoder()
    private val log = LoggerFactory.getLogger(UserService::class.java)

    @Transactional
    fun signup(request: SignUpRequest): User {
        log.info("회원가입 시도: {}", request.username)
        if (userRepository.existsByUsername(request.username)) {
            log.warn("이미 사용 중인 아이디로 회원가입 시도: {}", request.username)
            throw IllegalArgumentException("이미 사용 중인 아이디입니다.")
        }

        val encodedPassword = bCryptPasswordEncoder.encode(request.password)
        val user = User(
            username = request.username,
            password = encodedPassword,
            name = request.name,
            phone = request.phone,
            email = request.email,
            address = request.address,
            gender = if (request.gender.equals("MALE", ignoreCase = true)) User.Gender.MALE else User.Gender.FEMALE,
            role = User.Role.USER // 기본 역할은 USER
        )
        val savedUser = userRepository.save(user)
        log.info("회원가입 성공: {}, 역할: {}", savedUser.username, savedUser.role)
        return savedUser
    }

    @Transactional(readOnly = true)
    fun getAllUsersWithRoles(): List<UserRoleInfo> {
        log.debug("모든 사용자 정보 (역할 포함) 조회 요청")
        return userRepository.findAll().map {
            UserRoleInfo(
                id = it.id!!, // User 엔티티에서 id는 non-null로 가정
                username = it.username,
                email = it.email,
                currentRole = it.role.name
            )
        }
    }

    @Transactional
    fun updateUserRole(usernameToUpdate: String, newRole: User.Role, performingUser: UserDetails): User {
        log.info("사용자 역할 변경 요청: 대상={}, 새 역할={}, 요청자={}", usernameToUpdate, newRole, performingUser.username)

        val performingUserEntity = userRepository.findByUsername(performingUser.username)
            ?: throw IllegalStateException("요청자 정보를 찾을 수 없습니다: ${performingUser.username}")

        // 1. 요청자가 TENANT인지 확인
        if (performingUserEntity.role != User.Role.TENANT) {
            log.warn("TENANT가 아닌 사용자가 역할 변경 시도: 요청자={}", performingUser.username)
            throw AccessDeniedException("TENANT 권한이 필요합니다.")
        }

        // 2. 대상 사용자가 존재하는지 확인
        val targetUser = userRepository.findByUsername(usernameToUpdate)
            ?: run {
                log.warn("역할 변경 대상 사용자를 찾을 수 없음: {}", usernameToUpdate)
                throw IllegalArgumentException("사용자를 찾을 수 없습니다: $usernameToUpdate")
            }

        // 3. 자기 자신의 역할 변경 시도 방지
        if (targetUser.username == performingUser.username) {
            log.warn("TENANT가 자신의 역할 변경 시도: {}", performingUser.username)
            throw IllegalArgumentException("자기 자신의 역할은 변경할 수 없습니다.")
        }

        // 4. 다른 TENANT의 역할 변경 시도 방지
        if (targetUser.role == User.Role.TENANT) {
            log.warn("TENANT가 다른 TENANT의 역할 변경 시도: 대상={}", targetUser.username)
            throw IllegalArgumentException("다른 TENANT의 역할은 변경할 수 없습니다.")
        }
        
        // 5. TENANT는 ADMIN 또는 USER 역할로만 변경 가능
        if (newRole != User.Role.ADMIN && newRole != User.Role.USER) {
            log.warn("TENANT가 허용되지 않은 역할로 변경 시도: 새 역할={}", newRole)
            throw IllegalArgumentException("TENANT는 사용자를 ADMIN 또는 USER 역할로만 변경할 수 있습니다.")
        }

        // 6. 역할 변경 및 저장
        targetUser.role = newRole
        val updatedUser = userRepository.save(targetUser)
        log.info("사용자 역할 변경 완료: 대상={}, 새 역할={}", updatedUser.username, updatedUser.role)
        return updatedUser
    }
} 