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
    var gender: Gender? = null
) : Serializable {

    enum class Gender {
        MALE, FEMALE
    }

    companion object {
        private const val serialVersionUID = 1L
    }
} 