package com.example.apiezpz.post.repository

import com.example.apiezpz.post.domain.Post
import jakarta.transaction.Transactional
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PostRepository : JpaRepository<Post, Long> {
    fun findAllByOrderByIdDesc(): List<Post>  // ID 기준 내림차순 정렬
    
    @Transactional
    fun deleteByWriter(writer: String)
} 