package com.iting.jobportal.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMeResponse {
    private Long id;
    private String email;
    private String role;
    private String fullName;
    private String avatarUrl;
    private String phone;
}
