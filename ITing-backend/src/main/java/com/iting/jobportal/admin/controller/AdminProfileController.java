package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.response.AdminProfileResponse;
import com.iting.jobportal.admin.entity.Admin;
import com.iting.jobportal.admin.entity.enums.AdminLevel;
import com.iting.jobportal.admin.repository.AdminRepository;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.AuthUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Hồ sơ nhân viên admin: thông tin kế thừa từ Account (email, status, fullName, v.v.) +
 * staffCode/adminLevel riêng. Tự động khởi tạo Admin row + staffCode lần đầu admin gọi (không cần
 * seed script).
 */
@RestController
@RequestMapping("/api/admin/me")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Profile", description = "Hồ sơ cá nhân của admin đang đăng nhập")
public class AdminProfileController {

  private final AccountRepository accountRepository;
  private final AdminRepository adminRepository;

  @GetMapping("/profile")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Lấy hồ sơ admin hiện tại (auto-create Admin row + staffCode nếu chưa có)")
  @Transactional
  public ResponseEntity<AdminProfileResponse> getMyProfile(
      @AuthenticationPrincipal AuthUser principal) {
    if (principal == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
    }

    Account account =
        accountRepository
            .findById(principal.getId())
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account không tồn tại"));

    if (account.getRole() != Role.ADMIN) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account không phải admin");
    }

    Admin admin =
        adminRepository.findById(account.getId()).orElseGet(() -> provisionAdminRow(account));

    return ResponseEntity.ok(AdminProfileResponse.from(account, admin));
  }

  /**
   * Tạo Admin row lần đầu cho 1 Account đã có role=ADMIN nhưng chưa có record trong admin_accounts.
   * staffCode generate theo format ITN-{id padded 4 chữ số} — deterministic, dễ đọc, không trùng vì
   * account.id đã unique.
   */
  private Admin provisionAdminRow(Account account) {
    String code = String.format("ITN-%04d", account.getId());
    AdminLevel level = parseAdminLevel(account.getAdminRole());

    Admin admin = Admin.builder().account(account).staffCode(code).adminLevel(level).build();
    return adminRepository.save(admin);
  }

  private static AdminLevel parseAdminLevel(String raw) {
    if (raw == null || raw.isBlank()) return AdminLevel.MODERATOR;
    try {
      return AdminLevel.valueOf(raw.trim().toUpperCase());
    } catch (IllegalArgumentException e) {
      return AdminLevel.MODERATOR;
    }
  }
}
