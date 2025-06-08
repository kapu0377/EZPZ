package com.example.apiezpz.auth.controller

import com.example.apiezpz.auth.dto.UpdateRoleRequest
import com.example.apiezpz.auth.dto.UserRoleInfo
import com.example.apiezpz.auth.entity.User
import com.example.apiezpz.auth.service.UserService
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/management") // 기본 경로를 /api/management로 변경
class UserManagementController(
    private val userService: UserService
) {
    private val log = LoggerFactory.getLogger(UserManagementController::class.java)

    @GetMapping("/users")
    @PreAuthorize("hasRole('TENANT')")
    fun getAllUsers(@AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<List<UserRoleInfo>> {
        log.info("(테넌트: {}) 모든 사용자 역할 정보 조회 요청", userDetails.username)
        val users = userService.getAllUsersWithRoles()
        return ResponseEntity.ok(users)
    }

    @PutMapping("/users/{username}/role")
    @PreAuthorize("hasRole('TENANT')")
    fun updateUserRole(
        @PathVariable username: String,
        @RequestBody request: UpdateRoleRequest,
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<Any> { // 반환 타입을 Any로 하여 성공/실패 메시지 또는 User 객체 반환 가능
        log.info("(테넌트: {}) 사용자 역할 변경 요청: 대상={}, 새 역할={}", userDetails.username, username, request.newRole)
        return try {
            val updatedUser = userService.updateUserRole(username, request.newRole, userDetails)
            log.info("사용자 역할 변경 성공: 대상={}, 새 역할={}", updatedUser.username, updatedUser.role)
            ResponseEntity.ok(mapOf(
                "message" to "사용자 '$username'의 역할이 ${request.newRole}(으)로 성공적으로 변경되었습니다.",
                "updatedUser" to UserRoleInfo(updatedUser.id!!, updatedUser.username, updatedUser.email, updatedUser.role.name)
            ))
        } catch (e: IllegalArgumentException) {
            log.warn("사용자 역할 변경 실패 (잘못된 요청): {}", e.message)
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        } catch (e: org.springframework.security.access.AccessDeniedException) {
            log.warn("사용자 역할 변경 실패 (권한 없음): {}", e.message)
            ResponseEntity.status(403).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            log.error("사용자 역할 변경 중 예기치 않은 오류 발생: 대상={}", username, e)
            ResponseEntity.internalServerError().body(mapOf("error" to "역할 변경 중 오류가 발생했습니다: ${e.message}"))
        }
    }
} 