package com.iting.jobportal.company.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SendPhoneOtpRequest {

  @NotBlank(message = "Phone number cannot be empty")
  @Pattern(
      regexp = "^(\\+84|0)(3|5|7|8|9)[0-9]{8}$",
      message = "Số điện thoại không hợp lệ (yêu cầu định dạng VN: +84xxxxxxxxx hoặc 0xxxxxxxxx)")
  private String phone;
}
