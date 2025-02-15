package com.example.apiezpz.auth.dto;

import lombok.Data;

@Data
public class TokenRequest {
    private String refreshToken;
    private String username;
    private String accessToken;
}
