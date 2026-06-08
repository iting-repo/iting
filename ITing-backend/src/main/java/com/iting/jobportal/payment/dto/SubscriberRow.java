package com.iting.jobportal.payment.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Một dòng trong bảng "Người đăng ký" của admin: tài khoản HR nào đang/đã đăng ký gói nào, và tài
 * khoản đó trực thuộc công ty nào (qua affiliation đang active).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriberRow {

  private Long subscriptionId;

  // Tài khoản đăng ký
  private Long accountId;
  private String email;
  private String fullName;
  private String phone;

  // Gói + trạng thái
  private String tier;
  private String tierName; // displayName của gói (nếu còn tồn tại)
  private String status; // ACTIVE | EXPIRED | CANCELED | PENDING_RENEWAL
  private LocalDateTime startedAt;
  private LocalDateTime expiresAt;
  private Boolean autoRenew;

  // Công ty trực thuộc (có thể null nếu HR chưa liên kết công ty)
  private Long companyId;
  private String companyName;
}
