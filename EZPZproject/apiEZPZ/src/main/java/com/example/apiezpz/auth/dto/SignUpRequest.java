package com.example.apiezpz.auth.dto;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class SignUpRequest {
    private String username;
    private String password;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String gender;
}