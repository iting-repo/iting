package com.iting.jobportal.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PersonalUpdateDto {
    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phoneNum;

    private String avatarUrl;
}
