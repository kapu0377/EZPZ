package org.zerock.ezpacking.domain.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.zerock.ezpacking.domain.enums.UserRole;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 36)  // UUID 길이에 맞춤
    private String mid;

    @PrePersist  // 엔티티 저장 전 자동으로 UUID 생성
    public void generateMid() {
        if (this.mid == null) {
            this.mid = UUID.randomUUID().toString();
        }
    }

    @Column(unique = true)
    private String username;  // 실제 로그인에 사용되는 ID

    private String password;

    private String name;     // 사용자 실명 또는 닉네임

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.ROLE_USER;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}