package com.iting.jobportal.userprofile.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class EmployerCandidateSearchResponse {
    private Long id;
    private String name;
    private String email;

    private String title;
    private String level;
    private String location;
    private Integer experience;
    private String degree;
    private String education;
    private String workType;
    private String salaryExpectation;
    private List<String> skills;
    private String summary;
    private Boolean isAvailable;

    private Double score;
}

