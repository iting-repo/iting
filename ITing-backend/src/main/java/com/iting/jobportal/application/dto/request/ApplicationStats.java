package com.iting.jobportal.application.dto.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApplicationStats {
    private long total;
    private long pending;
    private long viewed;
    private long shortlisted;
    private long interviewing;
    private long offered;
    private long accepted;
    private long rejected;
    private long withdrawn;
}

