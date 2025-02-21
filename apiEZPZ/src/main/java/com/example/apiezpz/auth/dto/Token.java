package com.example.apiezpz.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class Token {
    private String accessToken;
    private Long accessTokenExpiresIn;
    private String username;
    private String name;
}
