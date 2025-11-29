package com.iting.jobportal.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {

    private Long userId;
    private String email;
    private String role;
    private String token;   // JWT token hoặc dummy token lúc đầu
}
