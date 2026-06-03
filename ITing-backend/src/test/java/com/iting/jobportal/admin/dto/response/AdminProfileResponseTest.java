package com.iting.jobportal.admin.dto.response;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.iting.jobportal.admin.entity.Admin;
import com.iting.jobportal.admin.entity.enums.AdminLevel;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class AdminProfileResponseTest {

  @Test
  void from_withAccountAndAdmin_mergesAllFields() {
    LocalDateTime lastLogin = LocalDateTime.of(2026, 5, 27, 10, 0);
    LocalDateTime createdAt = LocalDateTime.of(2026, 1, 1, 9, 0);

    Account account =
        Account.builder()
            .id(42L)
            .email("ad@iting.vn")
            .fullName("Anh Đào")
            .phone("0901234567")
            .avatarUrl("https://cdn/ad.jpg")
            .role(Role.ADMIN)
            .status(AccountStatus.ACTIVE)
            .lastLoginAt(lastLogin)
            .build();
    account.setCreatedAt(createdAt);

    Admin admin =
        Admin.builder()
            .account(account)
            .staffCode("ITN-0042")
            .adminLevel(AdminLevel.SUPER_ADMIN)
            .build();

    AdminProfileResponse dto = AdminProfileResponse.from(account, admin);

    // Account-inherited
    assertEquals(42L, dto.getId());
    assertEquals("ad@iting.vn", dto.getEmail());
    assertEquals("Anh Đào", dto.getFullName());
    assertEquals("0901234567", dto.getPhone());
    assertEquals("https://cdn/ad.jpg", dto.getAvatarUrl());
    assertEquals(Role.ADMIN, dto.getRole());
    assertEquals(AccountStatus.ACTIVE, dto.getStatus());
    assertEquals(lastLogin, dto.getLastLoginAt());
    assertEquals(createdAt, dto.getCreatedAt());

    // Admin-specific
    assertEquals("ITN-0042", dto.getStaffCode());
    assertEquals(AdminLevel.SUPER_ADMIN, dto.getAdminLevel());
  }

  @Test
  void from_withNullAdmin_returnsNullStaffFields() {
    Account account =
        Account.builder()
            .id(1L)
            .email("x@y.z")
            .role(Role.ADMIN)
            .status(AccountStatus.PENDING)
            .build();

    AdminProfileResponse dto = AdminProfileResponse.from(account, null);

    assertEquals(1L, dto.getId());
    assertEquals("x@y.z", dto.getEmail());
    assertNull(dto.getStaffCode());
    assertNull(dto.getAdminLevel());
  }
}
