package com.iting.jobportal.admin.entity;

import com.iting.jobportal.admin.entity.enums.AdminLevel;
import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import lombok.*;

/**
 * Admin-specific extension of {@link Account} (1-1 via @MapsId).
 *
 * <p>Login + contact (email, password, full_name, phone, avatar_url, last_login_*, login_count,
 * status) lives on Account. Entity này chỉ giữ field riêng cho admin: staff_code (mã định danh nhân
 * viên ITing) + admin_level (cấp bậc).
 *
 * <p>NOTE: cờ "active" và "notes" trong revision trước đã được drop bởi V83 và không bao giờ được
 * tạo lại — bỏ luôn để entity match DB thực tế. Suspend admin dùng Account.status thay vì cờ riêng.
 */
@Entity
@Table(name = "admin_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin {

  @Id private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  @MapsId
  @JoinColumn(name = "id")
  private Account account;

  @Column(name = "staff_code", length = 50, unique = true)
  private String staffCode;

  @Enumerated(EnumType.STRING)
  @Column(name = "admin_level", length = 20)
  private AdminLevel adminLevel;
}
