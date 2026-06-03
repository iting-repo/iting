package com.iting.jobportal.admin.dto.request;

import java.util.List;
import lombok.Data;

@Data
public class BulkReviewRejectRequest {
  private List<Long> ids;
  private String reason;
}
