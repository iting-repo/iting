package com.iting.jobportal.company.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.iting.jobportal.company.entity.enums.Industry;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FollowedCompanyResponse {

    private Long companyId;
    private String companyName;
    private String logoUrl;
    private List<Industry> industries;
    private LocalDateTime followedAt;
}
