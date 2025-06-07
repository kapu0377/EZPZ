package com.example.apiezpz.comment.repository

import com.example.apiezpz.comment.domain.Comment
import jakarta.transaction.Transactional
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CommentRepository : JpaRepository<Comment, Long> {
    fun findByPostIdOrderByCreatedAtDesc(postId: Long): List<Comment>
    
    @Transactional
    fun deleteByWriter(writer: String)
} 