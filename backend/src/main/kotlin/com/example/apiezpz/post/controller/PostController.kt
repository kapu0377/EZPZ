package com.example.apiezpz.post.controller

import com.example.apiezpz.post.domain.Post
import com.example.apiezpz.post.service.PostService
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/posts")
class PostController(
    private val postService: PostService
) {
    private val log = LoggerFactory.getLogger(PostController::class.java)

    // 모든 게시글 조회 (인증 불필요)
    @GetMapping
    fun getAllPosts(): ResponseEntity<List<Post>> {
        log.info("모든 게시글 조회 요청")
        val posts = postService.getAllPosts()
        log.info("게시글 조회 완료 - 조회된 게시글 수: {}", posts.size)
        return ResponseEntity.ok(posts)
    }

    // 특정 게시글 조회 (인증 불필요)
    @GetMapping("/{id}")
    fun getPostById(@PathVariable id: Long): ResponseEntity<Post> {
        log.info("게시글 조회 요청 - 게시글ID: {}", id)
        val post = postService.getPostById(id)
        return if (post.isPresent) {
            log.info("게시글 조회 성공 - 게시글ID: {}", id)
            ResponseEntity.ok(post.get())
        } else {
            log.warn("게시글을 찾을 수 없음 - 게시글ID: {}", id)
            ResponseEntity.notFound().build()
        }
    }

    // 게시글 작성 (인증 필요)
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    fun createPost(@RequestBody post: Post, 
                   @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Post> {
        log.info("게시글 작성 요청 - 사용자: {}, 제목: {}", userDetails.username, post.title)
        
        // 작성자 정보 설정
        post.writer = userDetails.username
        
        val savedPost = postService.savePost(post)
        log.info("게시글 작성 완료 - 사용자: {}, 게시글ID: {}", userDetails.username, savedPost.id)
        return ResponseEntity.ok(savedPost)
    }

    // 게시글 수정 (인증 필요)
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    fun updatePost(@PathVariable id: Long, 
                   @RequestBody postDetails: Post,
                   @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Post> {
        log.info("게시글 수정 요청 - 사용자: {}, 게시글ID: {}", userDetails.username, id)
        
        return try {
            val updatedPost = postService.updatePost(id, postDetails)
            log.info("게시글 수정 완료 - 사용자: {}, 게시글ID: {}", userDetails.username, id)
            ResponseEntity.ok(updatedPost)
        } catch (e: RuntimeException) {
            log.warn("게시글 수정 실패 - 사용자: {}, 게시글ID: {}, 오류: {}", userDetails.username, id, e.message)
            ResponseEntity.notFound().build()
        }
    }

    // 게시글 삭제 (인증 필요)
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    fun deletePost(@PathVariable id: Long,
                   @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Void> {
        log.info("게시글 삭제 요청 - 사용자: {}, 게시글ID: {}", userDetails.username, id)
        
        return try {
            postService.deletePost(id)
            log.info("게시글 삭제 완료 - 사용자: {}, 게시글ID: {}", userDetails.username, id)
            ResponseEntity.ok().build()
        } catch (e: Exception) {
            log.warn("게시글 삭제 실패 - 사용자: {}, 게시글ID: {}, 오류: {}", userDetails.username, id, e.message)
            ResponseEntity.notFound().build()
        }
    }
} 