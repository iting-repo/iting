package com.iting.jobportal.admin.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.dto.response.AuditLogResponse;
import com.iting.jobportal.admin.service.AdminActivityLogService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class AdminAuditControllerTest {

  @Mock private AdminActivityLogService adminActivityLogService;
  @InjectMocks private AdminAuditController controller;

  @Test
  void getAuditLogs_passesAllFilters_toService() {
    Page<AuditLogResponse> expected = new PageImpl<>(List.of());
    LocalDate from = LocalDate.of(2026, 6, 1);
    LocalDate to = LocalDate.of(2026, 6, 7);
    when(adminActivityLogService.getAuditLogs(
            "USER",
            1L,
            "CREATE",
            "HIGH",
            "test",
            from.atStartOfDay(),
            to.atTime(LocalTime.MAX),
            0,
            10))
        .thenReturn(expected);

    ResponseEntity<Page<AuditLogResponse>> resp =
        controller.getAuditLogs("USER", 1L, "CREATE", "HIGH", "test", from, to, 0, 10);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(expected, resp.getBody());
  }

  @Test
  void getAuditLogs_allNullableArgsNull_stillWorks() {
    Page<AuditLogResponse> expected = new PageImpl<>(List.of());
    when(adminActivityLogService.getAuditLogs(
            null, null, null, null, null, null, null, 0, 10))
        .thenReturn(expected);

    ResponseEntity<Page<AuditLogResponse>> resp =
        controller.getAuditLogs(null, null, null, null, null, null, null, 0, 10);

    assertSame(expected, resp.getBody());
  }
}
