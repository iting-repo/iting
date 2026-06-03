package com.iting.jobportal.admin.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.dto.response.AdminProfileResponse;
import com.iting.jobportal.admin.entity.Admin;
import com.iting.jobportal.admin.entity.enums.AdminLevel;
import com.iting.jobportal.admin.repository.AdminRepository;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.AuthUser;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AdminProfileControllerTest {

  @Mock private AccountRepository accountRepository;
  @Mock private AdminRepository adminRepository;
  @InjectMocks private AdminProfileController controller;

  private AuthUser principalFor(Account account) {
    return new AuthUser(account);
  }

  private Account makeAdmin(Long id, String adminRole) {
    Account a = new Account();
    a.setId(id);
    a.setEmail("admin@iting.vn");
    a.setRole(Role.ADMIN);
    a.setStatus(AccountStatus.ACTIVE);
    a.setAdminRole(adminRole);
    return a;
  }

  // ── existing Admin row ──────────────────────────────────────────────

  @Test
  void getMyProfile_existingAdminRow_returnsMergedDto() {
    Account a = makeAdmin(1L, "SUPER_ADMIN");
    Admin admin =
        Admin.builder().account(a).staffCode("ITN-0001").adminLevel(AdminLevel.SUPER_ADMIN).build();
    when(accountRepository.findById(1L)).thenReturn(Optional.of(a));
    when(adminRepository.findById(1L)).thenReturn(Optional.of(admin));

    ResponseEntity<AdminProfileResponse> resp = controller.getMyProfile(principalFor(a));

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    AdminProfileResponse body = resp.getBody();
    assertNotNull(body);
    assertEquals("admin@iting.vn", body.getEmail());
    assertEquals("ITN-0001", body.getStaffCode());
    assertEquals(AdminLevel.SUPER_ADMIN, body.getAdminLevel());
    verify(adminRepository, never()).save(any(Admin.class));
  }

  // ── auto-provision ──────────────────────────────────────────────────

  @Test
  void getMyProfile_noAdminRow_autoCreatesWithGeneratedStaffCode() {
    Account a = makeAdmin(42L, "MODERATOR");
    when(accountRepository.findById(42L)).thenReturn(Optional.of(a));
    when(adminRepository.findById(42L)).thenReturn(Optional.empty());
    when(adminRepository.save(any(Admin.class))).thenAnswer(inv -> inv.getArgument(0));

    ResponseEntity<AdminProfileResponse> resp = controller.getMyProfile(principalFor(a));

    ArgumentCaptor<Admin> cap = ArgumentCaptor.forClass(Admin.class);
    verify(adminRepository).save(cap.capture());
    Admin created = cap.getValue();
    assertEquals("ITN-0042", created.getStaffCode(), "Format ITN-{id:04d}");
    assertEquals(AdminLevel.MODERATOR, created.getAdminLevel());
    assertEquals("ITN-0042", resp.getBody().getStaffCode());
  }

  @Test
  void getMyProfile_unknownAdminRole_defaultsToModerator() {
    Account a = makeAdmin(2L, "INVALID_ROLE_NAME");
    when(accountRepository.findById(2L)).thenReturn(Optional.of(a));
    when(adminRepository.findById(2L)).thenReturn(Optional.empty());
    when(adminRepository.save(any(Admin.class))).thenAnswer(inv -> inv.getArgument(0));

    controller.getMyProfile(principalFor(a));

    ArgumentCaptor<Admin> cap = ArgumentCaptor.forClass(Admin.class);
    verify(adminRepository).save(cap.capture());
    assertEquals(AdminLevel.MODERATOR, cap.getValue().getAdminLevel());
  }

  @Test
  void getMyProfile_nullAdminRole_defaultsToModerator() {
    Account a = makeAdmin(3L, null);
    when(accountRepository.findById(3L)).thenReturn(Optional.of(a));
    when(adminRepository.findById(3L)).thenReturn(Optional.empty());
    when(adminRepository.save(any(Admin.class))).thenAnswer(inv -> inv.getArgument(0));

    controller.getMyProfile(principalFor(a));

    ArgumentCaptor<Admin> cap = ArgumentCaptor.forClass(Admin.class);
    verify(adminRepository).save(cap.capture());
    assertEquals(AdminLevel.MODERATOR, cap.getValue().getAdminLevel());
  }

  @Test
  void getMyProfile_blankAdminRole_defaultsToModerator() {
    Account a = makeAdmin(4L, "   ");
    when(accountRepository.findById(4L)).thenReturn(Optional.of(a));
    when(adminRepository.findById(4L)).thenReturn(Optional.empty());
    when(adminRepository.save(any(Admin.class))).thenAnswer(inv -> inv.getArgument(0));

    controller.getMyProfile(principalFor(a));

    ArgumentCaptor<Admin> cap = ArgumentCaptor.forClass(Admin.class);
    verify(adminRepository).save(cap.capture());
    assertEquals(AdminLevel.MODERATOR, cap.getValue().getAdminLevel());
  }

  @Test
  void getMyProfile_adminRoleLowercase_normalizedToUpper() {
    Account a = makeAdmin(5L, "viewer");
    when(accountRepository.findById(5L)).thenReturn(Optional.of(a));
    when(adminRepository.findById(5L)).thenReturn(Optional.empty());
    when(adminRepository.save(any(Admin.class))).thenAnswer(inv -> inv.getArgument(0));

    controller.getMyProfile(principalFor(a));

    ArgumentCaptor<Admin> cap = ArgumentCaptor.forClass(Admin.class);
    verify(adminRepository).save(cap.capture());
    assertEquals(AdminLevel.VIEWER, cap.getValue().getAdminLevel(), "Case-insensitive parse");
  }

  // ── access control ──────────────────────────────────────────────────

  @Test
  void getMyProfile_unauthenticated_throws401() {
    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.getMyProfile(null));
    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
  }

  @Test
  void getMyProfile_accountNotFound_throws404() {
    Account a = makeAdmin(99L, "SUPER_ADMIN");
    when(accountRepository.findById(99L)).thenReturn(Optional.empty());

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.getMyProfile(principalFor(a)));
    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
  }

  @Test
  void getMyProfile_nonAdminAccount_throws403() {
    // Edge case: JWT principal đúng nhưng account đã bị downgrade ngoài JWT
    Account a = new Account();
    a.setId(1L);
    a.setRole(Role.CANDIDATE);
    when(accountRepository.findById(1L)).thenReturn(Optional.of(a));

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.getMyProfile(new AuthUser(a)));
    assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
  }
}
