package com.example.apiezpz.comment.service

import com.example.apiezpz.comment.domain.Comment
import com.example.apiezpz.comment.repository.CommentRepository
import com.example.apiezpz.post.repository.PostRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class CommentService(
    private val commentRepository: CommentRepository,
    private val postRepository: PostRepository
) {

    fun getCommentsByPostId(postId: Long): List<Comment> {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId)
    }

    fun createComment(postId: Long, comment: Comment): Comment {
        val post = postRepository.findById(postId)
            .orElseThrow { RuntimeException("게시글을 찾을 수 없습니다.") }
        comment.post = post
        return commentRepository.save(comment)
    }

    fun deleteComment(id: Long) {
        commentRepository.deleteById(id)
    }

    fun updateComment(id: Long, commentDetails: Comment): Comment {
        val comment = commentRepository.findById(id)
            .orElseThrow { RuntimeException("댓글을 찾을 수 없습니다.") }
        
        comment.content = commentDetails.content
        return commentRepository.save(comment)
    }

    fun getCommentById(id: Long): Optional<Comment> {
        return commentRepository.findById(id)
    }
} 