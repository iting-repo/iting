package com.iting.jobportal.userprofile.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EducationRequest {
    @NotBlank(message = "School name is required")
    private String schoolName;

    @NotBlank(message = "Major is required")
    private String major;

    private String areaOfStudy;

    @NotBlank(message = "Degree is required")
    private String degree;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    private String description;
}