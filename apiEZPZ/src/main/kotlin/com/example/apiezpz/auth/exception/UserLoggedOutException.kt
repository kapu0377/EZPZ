package com.example.apiezpz.auth.exception

class UserLoggedOutException : RuntimeException {
    constructor(message: String) : super(message)
    constructor(message: String, cause: Throwable) : super(message, cause)
} 