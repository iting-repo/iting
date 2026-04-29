package com.iting.jobportal.admin.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class KybNoteResponse {
    private Long id;
    private Long companyId;
    private Long adminId;
    private String noteContent;
    private LocalDateTime createdAt;
}
