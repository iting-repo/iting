package com.iting.jobportal.user.controller;

import com.iting.jobportal.admin.entity.UserReport;
import com.iting.jobportal.admin.service.AdminReportService;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.security.AuthUser;
import com.iting.jobportal.common.dto.response.ApiResponse;
import com.iting.jobportal.user.dto.request.ReportRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserReportControllerTest {

    @Mock private AdminReportService reportService;
    @InjectMocks private UserReportController controller;

    @Test
    void createReport_extractsUserIdFromAuthUser_delegates() {
        Account account = new Account();
        account.setId(99L);
        AuthUser principal = new AuthUser(account);

        ReportRequest req = new ReportRequest();
        UserReport saved = new UserReport();
        when(reportService.createReport(99L, req)).thenReturn(saved);

        ResponseEntity<ApiResponse<UserReport>> resp = controller.createReport(req, principal);

        assertSame(saved, resp.getBody().getData());
    }
}
