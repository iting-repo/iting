package com.iting.jobportal.admin.dto.request;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Data;

@Data
public class CategoryReorderRequest {

  @NotEmpty(message = "Danh sách ID không được rỗng")
  private List<Long> orderedIds;
}
