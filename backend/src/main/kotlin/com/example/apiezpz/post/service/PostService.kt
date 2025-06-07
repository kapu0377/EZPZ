package com.example.apiezpz.post.service

import com.example.apiezpz.post.domain.Post
import com.example.apiezpz.post.repository.PostRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class PostService(
    private val postRepository: PostRepository
) {

    fun getAllPosts(): List<Post> {
        return postRepository.findAllByOrderByIdDesc()
    }

    fun getPostById(id: Long): Optional<Post> {
        return postRepository.findById(id)
    }

    fun savePost(post: Post): Post {
        return postRepository.save(post)
    }

    fun updatePost(id: Long, postDetails: Post): Post {
        return postRepository.findById(id)
            .map { post ->
                post.title = postDetails.title
                post.content = postDetails.content
                postRepository.save(post)
            }.orElseThrow { RuntimeException("Post not found") }
    }

    fun deletePost(id: Long) {
        postRepository.deleteById(id)
    }
} 