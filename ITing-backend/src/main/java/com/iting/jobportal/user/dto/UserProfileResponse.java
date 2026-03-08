package com.iting.jobportal.user.dto;

import com.iting.jobportal.user.entity.enums.Gender;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserProfileResponse {
    private String userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNum;
    private LocalDate birthDate;
    private Gender sex;
    private String avatarUrl;
    private String description;
    private String address;
    private LocalDateTime lastUpdate;
}
