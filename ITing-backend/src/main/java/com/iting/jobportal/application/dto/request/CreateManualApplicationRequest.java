package com.iting.jobportal.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * HR tạo application thủ công thay mặt candidate (offline submission, walk-in
 * interview, etc.). Khác với candidate self-apply ở chỗ HR cung cấp thông tin
 * candidate (name + email), không cần CV file (HR upload riêng nếu có).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateManualApplicationRequest {

  @NotNull(message = "jobId là bắt buộc")
  private Long jobId;

  @NotBlank(message = "Tên ứng viên không được trống")
  @Size(max = 200)
  private String candidateName;

  @Email(message = "Email không hợp lệ")
  @NotBlank(message = "Email là bắt buộc")
  @Size(max = 200)
  private String candidateEmail;

  @Size(max = 20)
  private String candidatePhone;

  @Size(max = 5000)
  private String introduction;

  /** Ghi chú nội bộ HR (vì sao tạo manual, vd: "Walk-in 2024-01-15 — anh A giới thiệu"). */
  @Size(max = 1000)
  private String internalNote;
}
