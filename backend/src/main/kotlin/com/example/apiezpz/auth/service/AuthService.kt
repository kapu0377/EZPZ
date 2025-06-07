package com.example.apiezpz.auth.service

import com.example.apiezpz.auth.dto.LoginRequest
import com.example.apiezpz.auth.dto.SignUpRequest
import com.example.apiezpz.auth.dto.Token
import com.example.apiezpz.auth.entity.RefreshToken
import com.example.apiezpz.auth.entity.User
import com.example.apiezpz.auth.exception.RefreshTokenExpiredException
import com.example.apiezpz.auth.exception.UserLoggedOutException
import com.example.apiezpz.auth.exception.InvalidRefreshTokenException
import com.example.apiezpz.auth.exception.TokenNotProvidedException
import com.example.apiezpz.auth.repository.RefreshTokenRepository
import com.example.apiezpz.auth.repository.UserRepository
import com.example.apiezpz.auth.security.JwtTokenProvider
import com.example.apiezpz.checklist.repository.ChecklistRepository
import com.example.apiezpz.comment.repository.CommentRepository
import com.example.apiezpz.post.repository.PostRepository
import com.example.apiezpz.search.repository.SearchHistoryRepository
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit

@Service
@Transactional
class AuthService(
    private val userRepository: UserRepository,
    private val refreshTokenRepository: RefreshTokenRepository,
    private val jwtTokenProvider: JwtTokenProvider,
    private val passwordEncoder: PasswordEncoder,
    private val redisCacheService: RedisCacheService,
    private val checklistRepository: ChecklistRepository,
    private val postRepository: PostRepository,
    private val commentRepository: CommentRepository,
    private val searchHistoryRepository: SearchHistoryRepository
) {
    private val log = LoggerFactory.getLogger(AuthService::class.java)

    data class LoginResult(
        val token: Token,
        val refreshToken: String,
        val accessToken: String
    )

    data class ReissueResult(
        val token: Token,
        val refreshToken: String,
        val accessToken: String
    )

    fun signup(request: SignUpRequest) {
        log.debug("회원가입 요청: username={}", request.username)
        
        if (userRepository.findByUsername(request.username) != null) {
            throw IllegalArgumentException("이미 존재하는 아이디입니다.")
        }

        val user = User(
            username = request.username,
            password = passwordEncoder.encode(request.password),
            name = request.name,
            email = request.email,
            phone = request.phone,
            address = request.address,
            gender = User.Gender.valueOf(request.gender)
        )

        userRepository.save(user)
        log.debug("회원가입 성공: username={}", request.username)
    }

    fun login(request: LoginRequest): LoginResult {
        return try {
            log.info("로그인 시도 - username: {}", request.username)
            
            val user = userRepository.findByUsername(request.username)
                ?: run {
                    log.error("사용자를 찾을 수 없음 - username: {}", request.username)
                    throw IllegalArgumentException("존재하지 않는 아이디입니다.")
                }
            
            if (!passwordEncoder.matches(request.password, user.password)) {
                throw IllegalArgumentException("비밀번호가 일치하지 않습니다.")
            }
            
            log.info("사용자 조회 성공 - username: {}", user.username)

            refreshTokenRepository.deleteByUsername(user.username)
            redisCacheService.removeRefreshTokenCache(user.username)
            redisCacheService.removeAccessTokenCache(user.username)
            redisCacheService.removeUserCache(user.username)
            
            val accessToken = jwtTokenProvider.generateAccessToken(user.username)
            val refreshToken = jwtTokenProvider.generateRefreshToken(user.username)
            
            val refreshTokenEntity = RefreshToken(
                username = user.username,
                token = refreshToken,
                expirationTime = System.currentTimeMillis() + 
                    (jwtTokenProvider.refreshTokenExpirationMinutes * 60 * 1000),
                isRevoked = false,
                user = user
            )
            refreshTokenRepository.save(refreshTokenEntity)
            
            redisCacheService.cacheRefreshToken(user.username, refreshToken, 
                jwtTokenProvider.refreshTokenExpirationMinutes)
            redisCacheService.cacheUser(user.username, user)
            
            log.info("로그인 성공 및 캐시 저장 완료 - username: {}", user.username)

            LoginResult(
                Token(
                    refreshToken = refreshToken,
                    accessTokenExpiresIn = calcExpirySeconds(accessToken)
                ), 
                refreshToken, 
                accessToken
            )
        } catch (e: Exception) {
            log.error("로그인 처리 중 오류 발생", e)
            throw e
        }
    }

    fun reissue(username: String, refreshToken: String): ReissueResult {
        log.info("토큰 재발급 요청 - username: {}", username)
        
        if (refreshToken.isBlank()) {
            log.info("빈 리프레시 토큰으로 재발급 시도 - username: {}", username)
            throw TokenNotProvidedException("리프레시 토큰이 제공되지 않았습니다")
        }
        
        val cachedRefreshToken = redisCacheService.getCachedRefreshToken(username)
        
        val dbRefreshToken = refreshTokenRepository.findByUsername(username)
            .orElseThrow { UserLoggedOutException("로그아웃 된 사용자입니다") }
        
        if (dbRefreshToken.isRevoked) {
            log.error("이미 무효화된 RefreshToken 사용 시도 - username: {}", username)
            throw RefreshTokenExpiredException("이미 무효화된 RefreshToken입니다.")
        }

        val currentRefreshToken = if (System.currentTimeMillis() > dbRefreshToken.expirationTime) {
            log.warn("만료된 RefreshToken으로 재발급 시도 - username: {}", username)
            
            // 리프레시 토큰이 만료되었지만 액세스 토큰이 유효한 경우
            // 새로운 리프레시 토큰을 발급하여 사용자 경험 개선
            val newRefreshToken = jwtTokenProvider.generateRefreshToken(username)
            
            // 기존 리프레시 토큰 무효화
            dbRefreshToken.isRevoked = true
            refreshTokenRepository.save(dbRefreshToken)
            
            // 새로운 리프레시 토큰 저장
            val newRefreshTokenEntity = RefreshToken(
                username = username,
                token = newRefreshToken,
                expirationTime = System.currentTimeMillis() + 
                    (jwtTokenProvider.refreshTokenExpirationMinutes * 60 * 1000),
                isRevoked = false,
                user = dbRefreshToken.user
            )
            refreshTokenRepository.save(newRefreshTokenEntity)
            
            // Redis 캐시 업데이트
            redisCacheService.removeRefreshTokenCache(username)
            redisCacheService.cacheRefreshToken(username, newRefreshToken, 
                jwtTokenProvider.refreshTokenExpirationMinutes)
            
            log.info("만료된 리프레시 토큰으로 인한 새 리프레시 토큰 발급 - username: {}", username)
            
            newRefreshToken // 새로 발급된 토큰 반환
        } else {
            refreshToken // 기존 토큰 그대로 사용
        }

        // 원래 토큰으로 검증 (새로 발급된 경우 이 검증은 스킵)
        if (currentRefreshToken == refreshToken) {
            if (refreshToken != dbRefreshToken.token) {
                log.error("제공된 RefreshToken이 DB의 토큰과 불일치 - username: {}", username)
                throw InvalidRefreshTokenException("유효하지 않은 RefreshToken입니다.")
            }

            if (cachedRefreshToken == null || cachedRefreshToken != refreshToken) {
                log.error("Redis와 제공된 RefreshToken 불일치 - username: {}", username)
                throw InvalidRefreshTokenException("RefreshToken 불일치 오류")
            }
        }

        val user = redisCacheService.getCachedUser(username)
            ?: run {
                log.info("캐시에서 사용자 정보를 찾을 수 없어 DB에서 조회 - username: {}", username)
                val userFromDb = userRepository.findByUsername(username)
                    ?: throw RuntimeException("사용자를 찾을 수 없습니다")
                redisCacheService.cacheUser(username, userFromDb)
                log.info("사용자 정보 캐시 재저장 완료 - username: {}", username)
                userFromDb
            }

        val newAccessToken = jwtTokenProvider.generateAccessToken(username)
        
        redisCacheService.cacheUser(username, user)
        
        log.info("토큰 재발급 성공 - username: {}", username)
        return ReissueResult(
            Token(
                refreshToken = currentRefreshToken, // 새로 발급되었을 수도 있는 리프레시 토큰
                accessTokenExpiresIn = calcExpirySeconds(newAccessToken)
            ),
            currentRefreshToken, // 새로 발급되었을 수도 있는 리프레시 토큰
            newAccessToken
        )
    }

    fun logout(username: String) {
        log.info("로그아웃 요청 - username: {}", username)
        
        refreshTokenRepository.deleteByUsername(username)
        
        redisCacheService.removeRefreshTokenCache(username)
        redisCacheService.removeAccessTokenCache(username)
        redisCacheService.removeUserCache(username)
        
        log.info("로그아웃 완료 - username: {}", username)
    }

    fun updateUser(username: String, updatedUserInfo: SignUpRequest) {
        val user = userRepository.findByUsername(username)
            ?: throw IllegalArgumentException("사용자를 찾을 수 없습니다.")

        user.name = updatedUserInfo.name
        user.phone = updatedUserInfo.phone
        user.email = updatedUserInfo.email
        user.address = updatedUserInfo.address

        if (!updatedUserInfo.password.isNullOrEmpty()) {
            user.password = passwordEncoder.encode(updatedUserInfo.password)
        }

        userRepository.save(user)
    }

    private fun calcExpirySeconds(token: String): Long {
        val expiry = jwtTokenProvider.getTokenExpiryDateTime(token)
        val now = LocalDateTime.now()
        val diffInSeconds = ChronoUnit.SECONDS.between(now, expiry)
        return maxOf(diffInSeconds, 0)
    }

    fun deleteUser(username: String, password: String) {
        val user = userRepository.findByUsername(username)
            ?: return
            
        if (!passwordEncoder.matches(password, user.password)) {
            return
        }
        
        refreshTokenRepository.deleteByUsername(user.username)
        checklistRepository.deleteByUsername(user.username)
        postRepository.deleteByWriter(user.username)
        commentRepository.deleteByWriter(user.username)
        searchHistoryRepository.deleteByUser(user)
        userRepository.delete(user)
        println("회원 탈퇴 완료: $username")
    }

    fun verifyPassword(username: String, password: String): Boolean {
        val user = userRepository.findByUsername(username)
            ?: throw IllegalArgumentException("존재하지 않는 사용자입니다.")

        return passwordEncoder.matches(password, user.password)
    }

    fun blacklistAccessToken(accessToken: String, remainingMinutes: Long) {
        log.info("액세스 토큰 블랙리스트 추가")
        redisCacheService.blacklistAccessToken(accessToken, remainingMinutes)
    }

    fun isTokenBlacklisted(accessToken: String): Boolean {
        return redisCacheService.isTokenBlacklisted(accessToken)
    }
} 