package com.iting.jobportal.announcement.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.announcement.dto.AnnouncementDto;
import com.iting.jobportal.announcement.service.SystemAnnouncementService;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class UserAnnouncementControllerTest {

  @Mock private SystemAnnouncementService service;
  @Mock private AccountRepository accountRepository;
  @InjectMocks private UserAnnouncementController controller;

  @Test
  void getActive_anonymous_userIdNull_returnsEmptyList() {
    ResponseEntity<List<AnnouncementDto>> resp = controller.getActive(null, "/");

    assertTrue(resp.getBody().isEmpty(), "Guest không có announcement");
    verify(service, never())
        .getActiveForUser(
            org.mockito.ArgumentMatchers.any(),
            org.mockito.ArgumentMatchers.any(),
            org.mockito.ArgumentMatchers.any());
  }

  @Test
  void getActive_authenticated_passesRoleAndRoute() {
    Account a = new Account();
    a.setId(1L);
    a.setRole(Role.CANDIDATE);
    when(accountRepository.findById(1L)).thenReturn(Optional.of(a));
    when(service.getActiveForUser(1L, "CANDIDATE", "/jobs"))
        .thenReturn(List.of(new AnnouncementDto()));

    ResponseEntity<List<AnnouncementDto>> resp = controller.getActive(1L, "/jobs");

    assertEquals(1, resp.getBody().size());
  }

  @Test
  void getActive_accountNotFound_passesNullRole() {
    when(accountRepository.findById(99L)).thenReturn(Optional.empty());
    when(service.getActiveForUser(99L, null, "/")).thenReturn(List.of());

    controller.getActive(99L, "/");

    verify(service).getActiveForUser(99L, null, "/");
  }

  @Test
  void getActive_nullRoleAccount_passesNullRole() {
    Account a = new Account();
    a.setId(1L);
    a.setRole(null);
    when(accountRepository.findById(1L)).thenReturn(Optional.of(a));
    when(service.getActiveForUser(1L, null, "/")).thenReturn(List.of());

    controller.getActive(1L, "/");

    verify(service).getActiveForUser(1L, null, "/");
  }

  @Test
  void ack_callsService_returnsAcked() {
    ResponseEntity<?> resp = controller.ack(1L, 5L);

    verify(service).ack(1L, 5L);
    assertEquals(true, ((java.util.Map<?, ?>) resp.getBody()).get("acked"));
  }
}
