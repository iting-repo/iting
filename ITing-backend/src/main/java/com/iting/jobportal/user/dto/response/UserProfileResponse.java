package com.iting.jobportal.user.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserProfileResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String phoneNum;
    private Long locId;
    private String avatarUrl;
    private LocalDateTime lastUpdate;
}
