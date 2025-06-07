package com.example.apiezpz.comment.controller

import com.example.apiezpz.comment.domain.Comment
import com.example.apiezpz.comment.service.CommentService
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/comments")
class CommentController(
    private val commentService: CommentService
) {
    private val log = LoggerFactory.getLogger(CommentController::class.java)

    // 특정 게시글의 모든 댓글 조회 (인증 불필요)
    @GetMapping("/post/{postId}")
    fun getCommentsByPostId(@PathVariable postId: Long): ResponseEntity<List<Comment>> {
        log.info("게시글 댓글 조회 요청 - 게시글ID: {}", postId)
        val comments = commentService.getCommentsByPostId(postId)
        log.info("게시글 댓글 조회 완료 - 게시글ID: {}, 댓글 수: {}", postId, comments.size)
        return ResponseEntity.ok(comments)
    }

    // 댓글 작성 (인증 필요)
    @PostMapping("/post/{postId}")
    @PreAuthorize("isAuthenticated()")
    fun createComment(@PathVariable postId: Long,
                      @RequestBody comment: Comment,
                      @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Comment> {
        log.info("댓글 작성 요청 - 사용자: {}, 게시글ID: {}", userDetails.username, postId)
        
        // 작성자 정보 설정
        comment.writer = userDetails.username
        
        val savedComment = commentService.createComment(postId, comment)
        log.info("댓글 작성 완료 - 사용자: {}, 게시글ID: {}, 댓글ID: {}", userDetails.username, postId, savedComment.id)
        return ResponseEntity.ok(savedComment)
    }

    // 댓글 수정 (인증 필요)
    @PutMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    fun updateComment(@PathVariable commentId: Long,
                      @RequestBody commentDetails: Comment,
                      @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Comment> {
        log.info("댓글 수정 요청 - 사용자: {}, 댓글ID: {}", userDetails.username, commentId)
        
        return try {
            val updatedComment = commentService.updateComment(commentId, commentDetails)
            log.info("댓글 수정 완료 - 사용자: {}, 댓글ID: {}", userDetails.username, commentId)
            ResponseEntity.ok(updatedComment)
        } catch (e: RuntimeException) {
            log.warn("댓글 수정 실패 - 사용자: {}, 댓글ID: {}, 오류: {}", userDetails.username, commentId, e.message)
            ResponseEntity.notFound().build()
        }
    }

    // 댓글 삭제 (인증 필요)
    @DeleteMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    fun deleteComment(@PathVariable commentId: Long,
                      @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Void> {
        log.info("댓글 삭제 요청 - 사용자: {}, 댓글ID: {}", userDetails.username, commentId)
        
        return try {
            commentService.deleteComment(commentId)
            log.info("댓글 삭제 완료 - 사용자: {}, 댓글ID: {}", userDetails.username, commentId)
            ResponseEntity.ok().build()
        } catch (e: Exception) {
            log.warn("댓글 삭제 실패 - 사용자: {}, 댓글ID: {}, 오류: {}", userDetails.username, commentId, e.message)
            ResponseEntity.notFound().build()
        }
    }

    // 특정 댓글 조회 (인증 불필요)
    @GetMapping("/{commentId}")
    fun getCommentById(@PathVariable commentId: Long): ResponseEntity<Comment> {
        log.info("댓글 조회 요청 - 댓글ID: {}", commentId)
        val comment = commentService.getCommentById(commentId)
        return if (comment.isPresent) {
            log.info("댓글 조회 성공 - 댓글ID: {}", commentId)
            ResponseEntity.ok(comment.get())
        } else {
            log.warn("댓글을 찾을 수 없음 - 댓글ID: {}", commentId)
            ResponseEntity.notFound().build()
        }
    }
} 