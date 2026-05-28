package com.iting.jobportal.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FaqRequest {

  @NotBlank(message = "Câu hỏi không được để trống")
  @Size(max = 500, message = "Câu hỏi không được vượt quá 500 ký tự")
  private String title;

  @NotBlank(message = "Câu trả lời không được để trống")
  private String content;

  @Size(max = 50, message = "Slug không được vượt quá 50 ký tự")
  private String slug;

  private Integer sortOrder;

  private Boolean published;
}
