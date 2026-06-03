package com.iting.jobportal.messaging.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EditMessageRequest {

  @NotBlank(message = "Nội dung tin nhắn không được trống")
  @Size(max = 5000, message = "Tin nhắn tối đa 5000 ký tự")
  private String content;
}
