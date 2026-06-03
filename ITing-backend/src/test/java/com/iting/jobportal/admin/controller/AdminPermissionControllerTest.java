package com.iting.jobportal.admin.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.service.AdminPermissionService;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class AdminPermissionControllerTest {

  @Mock private AdminPermissionService adminPermissionService;
  @InjectMocks private AdminPermissionController controller;

  @Test
  void getOverrides_delegatesToService() {
    Map<String, Boolean> expected = Map.of("users.view", true, "jobs.create", false);
    when(adminPermissionService.getOverrides(5L)).thenReturn(expected);

    ResponseEntity<Map<String, Boolean>> resp = controller.getOverrides(5L);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(expected, resp.getBody());
  }

  @Test
  void replaceOverrides_atomicallyReplaces() {
    // adminId hardcoded = 1L trong implementation hiện tại (TODO future)
    Map<String, Boolean> overrides = Map.of("users.view", true);

    ResponseEntity<?> resp = controller.replaceOverrides(5L, overrides);

    verify(adminPermissionService).replaceOverrides(1L, 5L, overrides);
    assertNotNull(resp.getBody());
    assertEquals("Overrides replaced successfully", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  @Test
  void deleteOverride_callsServiceWithKey() {
    ResponseEntity<?> resp = controller.deleteOverride(5L, "users.view");

    verify(adminPermissionService).deleteOverride(1L, 5L, "users.view");
    assertEquals("Override deleted", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  @Test
  void clearOverrides_clearsAll() {
    ResponseEntity<?> resp = controller.clearOverrides(5L);

    verify(adminPermissionService).clearOverrides(1L, 5L);
    assertEquals("All overrides cleared", ((Map<?, ?>) resp.getBody()).get("message"));
  }
}
