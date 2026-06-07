package com.iting.jobportal.payment.dto;

import lombok.Data;

/** Payload admin tạo gói HR mới. {@code code} là định danh duy nhất (VD: STARTER, TEAM). */
@Data
public class SubscriptionTierCreateRequest {
  private String code;
  private String displayName;
  private Long priceVnd;
  private Integer periodDays;
  private Integer credits;
  private String benefits;
  private Integer maxJobsPerMonth;
  private Integer maxBoostsPerMonth;
  private Boolean active;
  private Integer sortOrder;
  private Boolean popular;
  private Boolean talentPool;
  private String badge;
  private String accentColor;
}
