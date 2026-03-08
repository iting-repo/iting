package com.iting.jobportal.userprofile.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ExperienceRequest {
    private String company;
    private String role;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
}
