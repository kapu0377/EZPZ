package org.zerock.ezpacking.domain.dto.response;

import lombok.*;
import org.zerock.ezpacking.domain.entity.User;

import org.zerock.ezpacking.domain.enums.UserRole;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private String mid;
    private String username;

    private String name;
    private UserRole role;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .mid(user.getMid())
                .name(user.getName())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }
}