package com.iting.jobportal.admin.rbac.dto;

import java.util.List;
import lombok.*;

/** Cập nhật metadata và/hoặc tập quyền của một role. Các trường null sẽ được giữ nguyên. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoleRequest {
  private String name;
  private String description;
  private String reason;
  private List<String> permissions; // nếu non-null → thay thế toàn bộ tập quyền
}
