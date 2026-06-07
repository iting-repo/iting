package com.iting.jobportal.payment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Duration;
import java.time.LocalDateTime;
import lombok.*;

/**
 * DB-driven pricing/quota cho một {@link SubscriptionTier}. Cho phép admin chỉnh giá, quyền lợi và
 * quota qua trang quản trị mà không cần redeploy. {@code code} khớp đúng tên enum
 * (BASIC/PRO/ENTERPRISE). Nếu một tier chưa có row trong bảng này, service fallback về default trong
 * enum.
 */
@Entity
@Table(name = "subscription_tier_pricing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionTierPricing {

  @Id
  @Column(name = "code", length = 30, nullable = false)
  private String code;

  @Column(name = "display_name", nullable = false)
  private String displayName;

  @Column(name = "price_vnd", nullable = false)
  private long priceVnd;

  @Column(name = "period_days", nullable = false)
  private int periodDays;

  @Column(name = "credits", nullable = false)
  private int credits;

  @Column(name = "benefits", nullable = false, length = 1000)
  private String benefits;

  /** -1 = unlimited (Enterprise). 0 hoặc dương = giới hạn cứng. */
  @Column(name = "max_jobs_per_month", nullable = false)
  private int maxJobsPerMonth;

  @Column(name = "max_boosts_per_month", nullable = false)
  private int maxBoostsPerMonth;

  /** false = ẩn khỏi bảng giá public (HR không subscribe được). */
  @Column(name = "active", nullable = false)
  @Builder.Default
  private boolean active = true;

  /** Thứ tự hiển thị trên bảng giá (nhỏ → trái). */
  @Column(name = "sort_order", nullable = false)
  @Builder.Default
  private int sortOrder = 0;

  /** Gói nổi bật — được highlight ("đề xuất") trên bảng giá. */
  @Column(name = "popular", nullable = false)
  @Builder.Default
  private boolean popular = false;

  /** Cho phép tính năng Talent Pool (tìm kiếm ứng viên trực tiếp). */
  @Column(name = "talent_pool", nullable = false)
  @Builder.Default
  private boolean talentPool = false;

  /** Nhãn nhỏ trên thẻ (VD: "PHỔ BIẾN NHẤT"). Null = không có. */
  @Column(name = "badge", length = 50)
  private String badge;

  /** Màu nhấn (hex, VD #3AB4E6) cho thẻ trên giao diện. */
  @Column(name = "accent_color", length = 20)
  private String accentColor;

  @Column(name = "updated_by")
  private Long updatedBy;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  /** Period dưới dạng {@link Duration} để dùng trong tính toán expiry. */
  @Transient
  @JsonIgnore
  public Duration getPeriod() {
    return Duration.ofDays(periodDays);
  }

  @PrePersist
  void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    if (createdAt == null) createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
