package com.example.apiezpz.comment.domain

import com.example.apiezpz.post.domain.Post
import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
data class Comment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false)
    var content: String = "",

    @Column(nullable = false)
    var writer: String = "",

    @Column(nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    var post: Post? = null
) {
    @PrePersist
    protected fun onCreate() {
        createdAt = LocalDateTime.now()
    }
} 