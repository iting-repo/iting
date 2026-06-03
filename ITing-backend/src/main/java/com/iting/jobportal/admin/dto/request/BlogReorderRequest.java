package com.iting.jobportal.admin.dto.request;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Data;

@Data
public class BlogReorderRequest {

  @NotEmpty(message = "Danh sách sắp xếp không được rỗng")
  private List<Long> orderedIds;
}
