package com.example.apiezpz.auth.entity

import jakarta.persistence.*
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonTypeInfo
import java.io.Serializable

@Entity
@Table(name = "users")
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS)
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false, unique = true)
    var username: String = "",

    @Column(nullable = false)
    var password: String = "",

    var name: String = "",

    var phone: String = "",

    var email: String = "",

    var address: String = "",

    @Enumerated(EnumType.STRING)
    var gender: Gender? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var role: Role = Role.USER // 기본값은 USER로 설정
) : Serializable {

    enum class Gender {
        MALE, FEMALE
    }

    enum class Role {
        USER,  // 일반 사용자
        ADMIN, // 일반 관리자 (테넌트에 의해 권한 부여)
        TENANT // 시스템 최고 관리자 (최초 세팅 또는 특정 조건 만족 시)
    }

    companion object {
        private const val serialVersionUID = 1L
    }
} 