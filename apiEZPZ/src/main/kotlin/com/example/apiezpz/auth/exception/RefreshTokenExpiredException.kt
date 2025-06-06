package com.example.apiezpz.auth.exception

class RefreshTokenExpiredException : RuntimeException {
    constructor(message: String) : super(message)
    constructor(message: String, cause: Throwable) : super(message, cause)
} 