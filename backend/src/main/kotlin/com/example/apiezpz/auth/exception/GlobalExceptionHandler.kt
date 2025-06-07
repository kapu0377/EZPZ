package com.example.apiezpz.auth.exception

import com.example.apiezpz.checklist.exception.ChecklistNotFoundException
import com.example.apiezpz.checklist.exception.CategoryNotFoundException
import com.example.apiezpz.checklist.exception.ItemNotFoundException
import com.example.apiezpz.checklist.exception.UnauthorizedAccessException
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {
    
    private val log = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(UserLoggedOutException::class)
    fun handleUserLoggedOutException(e: UserLoggedOutException): ResponseEntity<Map<String, Any>> {
        log.warn("사용자 로그아웃 상태에서 토큰 재발급 시도: {}", e.message)
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(mapOf(
                "error" to "USER_LOGGED_OUT",
                "message" to e.message!!,
                "silent" to true 
            ))
    }

    @ExceptionHandler(RefreshTokenExpiredException::class)
    fun handleRefreshTokenExpiredException(e: RefreshTokenExpiredException): ResponseEntity<Map<String, Any>> {
        log.warn("만료된 RefreshToken 사용 시도: {}", e.message)
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(mapOf(
                "error" to "REFRESH_TOKEN_EXPIRED",
                "message" to e.message!!,
                "silent" to true // 알럿을 띄우지 않도록 플래그 추가
            ))
    }

    @ExceptionHandler(InvalidRefreshTokenException::class)
    fun handleInvalidRefreshTokenException(e: InvalidRefreshTokenException): ResponseEntity<Map<String, Any>> {
        log.warn("유효하지 않은 RefreshToken 사용 시도: {}", e.message)
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(mapOf(
                "error" to "INVALID_REFRESH_TOKEN",
                "message" to e.message!!,
                "silent" to true // 알럿을 띄우지 않도록 플래그 추가
            ))
    }

    @ExceptionHandler(TokenNotProvidedException::class)
    fun handleTokenNotProvidedException(e: TokenNotProvidedException): ResponseEntity<Map<String, Any>> {
        log.info("토큰이 제공되지 않음: {}", e.message)
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(mapOf(
                "error" to "TOKEN_NOT_PROVIDED",
                "message" to e.message!!,
                "silent" to true // 알럿을 띄우지 않도록 플래그 추가
            ))
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(e: IllegalArgumentException): ResponseEntity<Map<String, String>> {
        log.warn("잘못된 인자 예외: {}", e.message)
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(mapOf(
                "error" to "INVALID_ARGUMENT",
                "message" to e.message!!
            ))
    }

    // 체크리스트 관련 예외 처리
    @ExceptionHandler(ChecklistNotFoundException::class)
    fun handleChecklistNotFoundException(e: ChecklistNotFoundException): ResponseEntity<Map<String, String>> {
        log.warn("체크리스트를 찾을 수 없음: {}", e.message)
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(mapOf(
                "error" to "CHECKLIST_NOT_FOUND",
                "message" to e.message!!
            ))
    }

    @ExceptionHandler(CategoryNotFoundException::class)
    fun handleCategoryNotFoundException(e: CategoryNotFoundException): ResponseEntity<Map<String, String>> {
        log.warn("카테고리를 찾을 수 없음: {}", e.message)
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(mapOf(
                "error" to "CATEGORY_NOT_FOUND",
                "message" to e.message!!
            ))
    }

    @ExceptionHandler(ItemNotFoundException::class)
    fun handleItemNotFoundException(e: ItemNotFoundException): ResponseEntity<Map<String, String>> {
        log.warn("아이템을 찾을 수 없음: {}", e.message)
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(mapOf(
                "error" to "ITEM_NOT_FOUND",
                "message" to e.message!!
            ))
    }

    @ExceptionHandler(UnauthorizedAccessException::class)
    fun handleUnauthorizedAccessException(e: UnauthorizedAccessException): ResponseEntity<Map<String, String>> {
        log.warn("권한 없는 접근 시도: {}", e.message)
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(mapOf(
                "error" to "UNAUTHORIZED_ACCESS",
                "message" to e.message!!
            ))
    }

    @ExceptionHandler(RuntimeException::class)
    fun handleRuntimeException(e: RuntimeException): ResponseEntity<Map<String, String>> {
        log.error("런타임 예외 발생: {}", e.message, e)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(mapOf(
                "error" to "INTERNAL_SERVER_ERROR",
                "message" to (e.message ?: "서버 내부 오류가 발생했습니다.")
            ))
    }
} 