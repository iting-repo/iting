package com.iting.jobportal.user.dto;

import com.iting.jobportal.user.entity.enums.Gender;
import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private Gender gender;
    private String avatarUrl;
    private String description;
    private String address;
}
