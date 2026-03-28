package com.iting.jobportal.application.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ApplicationSubmitResponse {
    private Long id;
    private Long jobId;
    private LocalDateTime timeSent;
}