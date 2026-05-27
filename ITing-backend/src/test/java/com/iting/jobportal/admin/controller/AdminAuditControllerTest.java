package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.response.AuditLogResponse;
import com.iting.jobportal.admin.service.AdminActivityLogService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminAuditControllerTest {

    @Mock private AdminActivityLogService adminActivityLogService;
    @InjectMocks private AdminAuditController controller;

    @Test
    void getAuditLogs_passesAllFilters_toService() {
        Page<AuditLogResponse> expected = new PageImpl<>(List.of());
        when(adminActivityLogService.getAuditLogs("USER", 1L, "CREATE", "test", 0, 10))
                .thenReturn(expected);

        ResponseEntity<Page<AuditLogResponse>> resp = controller.getAuditLogs(
                "USER", 1L, "CREATE", "test", 0, 10);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertSame(expected, resp.getBody());
    }

    @Test
    void getAuditLogs_allNullableArgsNull_stillWorks() {
        Page<AuditLogResponse> expected = new PageImpl<>(List.of());
        when(adminActivityLogService.getAuditLogs(null, null, null, null, 0, 10))
                .thenReturn(expected);

        ResponseEntity<Page<AuditLogResponse>> resp = controller.getAuditLogs(null, null, null, null, 0, 10);

        assertSame(expected, resp.getBody());
    }
}
