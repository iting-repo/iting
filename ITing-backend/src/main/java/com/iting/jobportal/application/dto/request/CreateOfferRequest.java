package com.iting.jobportal.application.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class CreateOfferRequest {

  @NotNull private Long applyFormId;

  @NotNull private Long jobId;

  @NotBlank
  @Size(max = 255)
  private String position;

  @DecimalMin("0.0")
  private BigDecimal salaryAmount;

  @Size(max = 10)
  private String salaryCurrency; // default VND

  @Pattern(regexp = "MONTH|YEAR")
  private String salaryType; // default MONTH

  private LocalDate startDate;

  @NotNull
  @Future(message = "Hạn phản hồi phải sau thời điểm hiện tại")
  private LocalDateTime expiresAt;

  @Size(max = 5000)
  private String notes;

  /**
   * URL file offer letter PDF do HR tự đính kèm (đã upload qua /api/hr/offers/upload-letter). Nếu có
   * → dùng file này làm offer letter thay vì auto-generate PDF.
   */
  @Size(max = 1000)
  private String offerLetterUrl;
}
