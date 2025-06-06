package com.example.apiezpz.checklist.exception

class UnauthorizedAccessException : RuntimeException {
    constructor(message: String) : super(message)
    constructor(message: String, cause: Throwable) : super(message, cause)
} 