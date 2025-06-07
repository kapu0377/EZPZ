package com.example.apiezpz.auth.dto

data class SignUpRequest(
    var username: String = "",
    var password: String = "",
    var name: String = "",
    var phone: String = "",
    var email: String = "",
    var address: String = "",
    var gender: String = ""
) 