package com.iting.jobportal.admin.dto.response;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

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
