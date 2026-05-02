package com.iting.jobportal.userprofile.dto.request;

import com.iting.jobportal.userprofile.entity.enums.EmploymentStatus;
import com.iting.jobportal.userprofile.entity.enums.EducationLevel;
import lombok.Data;

@Data
public class UserProfileUpdateDto {
    private String headline;
    private String location;
    private Integer totalExperienceYears;
    private EducationLevel educationSummary;
    private String shortBio;
    private EmploymentStatus employmentStatus;
    private Boolean openToWork;
}
