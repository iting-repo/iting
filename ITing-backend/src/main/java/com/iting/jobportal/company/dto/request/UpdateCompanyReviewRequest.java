package com.iting.jobportal.company.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload cho update review. Tất cả field optional — chỉ field nào có
 * giá trị mới được apply (null = giữ nguyên). Author chỉ được sửa trước khi
 * moderator approve (status = PENDING/DRAFT/NEEDS_RESUBMISSION).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCompanyReviewRequest {

  @Min(value = 1, message = "Rating tổng từ 1-5 sao")
  @Max(value = 5, message = "Rating tổng từ 1-5 sao")
  private Integer rating;

  @Size(max = 200, message = "Tiêu đề tối đa 200 ký tự")
  private String title;

  @Size(max = 10000, message = "Nội dung tối đa 10000 ký tự")
  private String content;

  @Size(max = 5000)
  private String pros;

  @Size(max = 5000)
  private String cons;

  @Min(1)
  @Max(5)
  private Integer cultureRating;

  @Min(1)
  @Max(5)
  private Integer workLifeBalanceRating;

  @Min(1)
  @Max(5)
  private Integer careerGrowthRating;

  @Min(1)
  @Max(5)
  private Integer salaryBenefitsRating;

  @Min(1)
  @Max(5)
  private Integer managementRating;

  private Boolean wouldRecommend;
}
