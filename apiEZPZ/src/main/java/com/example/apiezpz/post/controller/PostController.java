package com.example.ez.post.controller;

import com.example.ez.post.domain.Post;
import com.example.ez.post.service.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000") // React 연결 허용

public class PostController {
    private final Service service;
    private static final Logger log = LoggerFactory.getLogger(PostController.class);

    public PostController(Service Service) {
        this.service = Service;
    }

    @GetMapping
    public List<Post> getAllPosts() {
        List<Post> posts = service.getAllPosts();
        log.info("Fetched posts: {}", posts);
        return posts;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        Optional<Post> post = service.getPostById(id);
        return post.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Post createPost(@RequestBody Post post) {
        return service.savePost(post);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody Post postDetails) {
        Post post = service.getPostById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
                
        // 작성자 검증
        if (!post.getWriter().equals(postDetails.getWriter())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(service.updatePost(id, postDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, @RequestParam String writer) {
        Post post = service.getPostById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
                
        // 작성자 검증
        if (!post.getWriter().equals(writer)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        service.deletePost(id);
        return ResponseEntity.ok().build();
    }
}

