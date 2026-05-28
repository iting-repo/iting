package com.iting.jobportal.company.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class BusinessLicenseUploadRequest {

  @NotNull(message = "Vui lòng chọn file PDF")
  @Schema(description = "File giấy phép kinh doanh", type = "string", format = "binary")
  private MultipartFile file;
}
