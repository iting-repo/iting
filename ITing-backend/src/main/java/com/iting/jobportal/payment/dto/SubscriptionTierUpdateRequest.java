package com.iting.jobportal.payment.dto;

import lombok.Data;

/**
 * Payload admin cập nhật giá/quyền lợi của một gói HR. Mọi field nullable — chỉ field khác null mới
 * được áp dụng (partial update).
 */
@Data
public class SubscriptionTierUpdateRequest {
  private String displayName;
  private Long priceVnd;
  private Integer periodDays;
  private Integer credits;
  private String benefits;
  private Integer maxJobsPerMonth;
  private Integer maxBoostsPerMonth;
  private Boolean active;
}
