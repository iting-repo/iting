package com.iting.jobportal.admin.rbac.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoleRequest {
  @NotBlank(message = "Mã role không được để trống")
  private String code;

  @NotBlank(message = "Tên role không được để trống")
  private String name;

  private String description;

  @NotNull(message = "Phạm vi role không được để trống")
  private String scope; // PLATFORM | COMPANY

  private String reason; // lý do tạo role (gửi duyệt)

  private List<String> permissions; // danh sách permission code
}
