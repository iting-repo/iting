package com.iting.jobportal.admin.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.entity.SystemConfig;
import com.iting.jobportal.admin.service.AdminConfigService;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class AdminConfigControllerTest {

  @Mock private AdminConfigService adminConfigService;
  @Mock private JwtTokenUtil jwtTokenUtil;
  @Mock private HttpServletRequest request;
  @InjectMocks private AdminConfigController controller;

  @Test
  void getConfig_delegatesToService() {
    SystemConfig expected = new SystemConfig();
    when(adminConfigService.getConfig()).thenReturn(expected);

    ResponseEntity<SystemConfig> resp = controller.getConfig();

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(expected, resp.getBody());
  }

  @Test
  void updateConfig_extractsAdminIdFromJwt_andCallsService() {
    SystemConfig input = new SystemConfig();
    SystemConfig saved = new SystemConfig();
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(42L);
    when(adminConfigService.updateConfig(input, 42L)).thenReturn(saved);

    ResponseEntity<SystemConfig> resp = controller.updateConfig(input, request);

    assertSame(saved, resp.getBody());
    verify(adminConfigService).updateConfig(input, 42L);
  }

  @Test
  void resetToDefault_callsService_returns200() {
    ResponseEntity<Void> resp = controller.resetToDefault();

    verify(adminConfigService).resetToDefault();
    assertEquals(HttpStatus.OK, resp.getStatusCode());
  }

  @Test
  void testEmailConnection_success_returnsOk() {
    SystemConfig config = new SystemConfig();
    when(adminConfigService.testSmtpConnection(config)).thenReturn(true);

    ResponseEntity<?> resp = controller.testEmailConnection(config);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
  }

  @Test
  void testEmailConnection_failure_returns400WithMessage() {
    SystemConfig config = new SystemConfig();
    when(adminConfigService.testSmtpConnection(config)).thenReturn(false);

    ResponseEntity<?> resp = controller.testEmailConnection(config);

    assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
    assertNotNull(resp.getBody());
    assertEquals("Kết nối SMTP thất bại. Vui lòng kiểm tra lại cấu hình.", resp.getBody());
  }
}
