package com.iting.jobportal.company.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FollowedCompanyResponse {

    private Long companyId;
    private String companyName;
    private String logoUrl;
    private String industry;
    private LocalDateTime followedAt;
}
