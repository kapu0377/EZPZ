package com.example.apiezpz.checklist.exception

class ChecklistNotFoundException : RuntimeException {
    constructor(message: String) : super(message)
    constructor(message: String, cause: Throwable) : super(message, cause)
} 