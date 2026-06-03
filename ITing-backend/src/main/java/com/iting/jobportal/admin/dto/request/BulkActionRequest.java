package com.iting.jobportal.admin.dto.request;

import java.util.List;
import lombok.Data;

@Data
public class BulkActionRequest {
  private List<Long> ids;
}
