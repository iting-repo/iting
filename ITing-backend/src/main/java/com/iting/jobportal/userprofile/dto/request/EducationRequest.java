package com.iting.jobportal.userprofile.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class EducationRequest {
    private String school;
    private String degree;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
}
