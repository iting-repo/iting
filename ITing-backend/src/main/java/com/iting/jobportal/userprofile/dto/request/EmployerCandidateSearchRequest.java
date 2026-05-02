package com.iting.jobportal.userprofile.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class EmployerCandidateSearchRequest {
    private String keyword;

    // Reuse FE filter names (values may be "all")
    private String position;
    private String level;
    private String location;
    private String workType;
    private String experience;
    private String degree;
    private String salary;
    private List<String> skills;
    private Boolean onlyAvailable;

    // Location context: passed from employer's company profile for proximity
    // scoring
    private String employerLocation;

    // Industry context: passed from employer's company profile for smart ML
    // embedding recommendations
    private String industryContext;

    private Integer page;
    private Integer size;
}
