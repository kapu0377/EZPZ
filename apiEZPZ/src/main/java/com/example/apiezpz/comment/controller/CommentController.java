package com.example.apiezpz.comment.controller;

import com.example.apiezpz.comment.domain.Comment;
import com.example.apiezpz.comment.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:3000")
public class CommentController {
    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/post/{postId}")
    public List<Comment> getCommentsByPostId(@PathVariable Long postId) {
        return commentService.getCommentsByPostId(postId);
    }

    @PostMapping("/post/{postId}")
    public Comment createComment(@PathVariable Long postId, @RequestBody Comment comment) {
        return commentService.createComment(postId, comment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, @RequestParam String writer) {
        Comment comment = commentService.getCommentById(id)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));
                
        // 작성자 검증
        if (!comment.getWriter().equals(writer)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        commentService.deleteComment(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(@PathVariable Long id, @RequestBody Comment comment) {
        Comment existingComment = commentService.getCommentById(id)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));
                
        // 작성자 검증
        if (!existingComment.getWriter().equals(comment.getWriter())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(commentService.updateComment(id, comment));
    }
} 