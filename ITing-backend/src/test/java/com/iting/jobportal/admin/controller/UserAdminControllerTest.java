package com.iting.jobportal.admin.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.dto.request.BanUserRequest;
import com.iting.jobportal.admin.dto.request.UpdateUserRequest;
import com.iting.jobportal.admin.dto.response.UserListResponse;
import com.iting.jobportal.admin.service.AdminUserService;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.messaging.websocket.WebSocketEventListener;
import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class UserAdminControllerTest {

  @Mock private AdminUserService adminUserService;
  @Mock private WebSocketEventListener webSocketEventListener;
  @InjectMocks private UserAdminController controller;

  // ── getAllUsers ──────────────────────────────────────────────────────

  @Test
  void getAllUsers_passesAllFilters() {
    Page<UserListResponse> page = new PageImpl<>(List.of());
    when(adminUserService.getAllUsers("john", Role.CANDIDATE, AccountStatus.ACTIVE, 0, 10))
        .thenReturn(page);

    ResponseEntity<Page<UserListResponse>> resp =
        controller.getAllUsers("john", Role.CANDIDATE, AccountStatus.ACTIVE, 0, 10);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(page, resp.getBody());
  }

  @Test
  void getAllUsers_nullFilters_allowed() {
    when(adminUserService.getAllUsers(null, null, null, 0, 10))
        .thenReturn(new PageImpl<>(List.of()));

    controller.getAllUsers(null, null, null, 0, 10);

    verify(adminUserService).getAllUsers(null, null, null, 0, 10);
  }

  // ── getUserById ──────────────────────────────────────────────────────

  @Test
  void getUserById_delegatesToService() {
    UserListResponse expected = UserListResponse.builder().build();
    when(adminUserService.getUserById(5L)).thenReturn(expected);

    assertSame(expected, controller.getUserById(5L).getBody());
  }

  // ── updateUser ───────────────────────────────────────────────────────

  @Test
  void updateUser_passesAdminAndUserIdAndRequest() {
    UpdateUserRequest req = new UpdateUserRequest();
    UserListResponse expected = UserListResponse.builder().build();
    when(adminUserService.updateUser(1L, 5L, req)).thenReturn(expected);

    assertSame(expected, controller.updateUser(5L, req).getBody());
  }

  // ── ban / unban ──────────────────────────────────────────────────────

  @Test
  void banUser_callsService_returnsMessage() {
    BanUserRequest req = new BanUserRequest();
    ResponseEntity<?> resp = controller.banUser(5L, req);

    verify(adminUserService).banUser(1L, 5L, req);
    assertEquals("User banned successfully", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  @Test
  void unbanUser_callsService_returnsMessage() {
    ResponseEntity<?> resp = controller.unbanUser(5L);

    verify(adminUserService).unbanUser(1L, 5L);
    assertEquals("User unbanned successfully", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  // ── deleteUser ───────────────────────────────────────────────────────

  @Test
  void deleteUser_callsService_returnsMessage() {
    ResponseEntity<?> resp = controller.deleteUser(5L);

    verify(adminUserService).deleteUser(1L, 5L);
    assertEquals("User deleted successfully", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  // ── bulk operations ──────────────────────────────────────────────────

  @Test
  void bulkBanUsers_passesIds() {
    ResponseEntity<?> resp = controller.bulkBanUsers(List.of(1L, 2L, 3L));

    verify(adminUserService).bulkBanUsers(any(), any(BanUserRequest.class));
    assertEquals("Users banned successfully", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  @Test
  void bulkUnbanUsers_passesIds() {
    controller.bulkUnbanUsers(List.of(1L, 2L));

    verify(adminUserService).bulkUnbanUsers(List.of(1L, 2L));
  }

  @Test
  void bulkDeleteUsers_passesIds() {
    controller.bulkDeleteUsers(List.of(1L, 2L));

    verify(adminUserService).bulkDeleteUsers(List.of(1L, 2L));
  }

  // ── export / template ───────────────────────────────────────────────

  @Test
  void exportUsers_returnsExcelStream_withFilenameHeader() {
    when(adminUserService.exportUsersToExcel())
        .thenReturn(new ByteArrayInputStream(new byte[] {1, 2, 3}));

    ResponseEntity<Resource> resp = controller.exportUsers();

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertEquals(
        MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
        resp.getHeaders().getContentType());
    assertTrue(resp.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION).contains("users.xlsx"));
  }

  @Test
  void getTemplate_returnsTemplateExcel() {
    when(adminUserService.getImportTemplate())
        .thenReturn(new ByteArrayInputStream(new byte[] {1, 2, 3}));

    ResponseEntity<Resource> resp = controller.getTemplate();

    assertTrue(
        resp.getHeaders()
            .getFirst(HttpHeaders.CONTENT_DISPOSITION)
            .contains("users_template.xlsx"));
  }

  // ── import ───────────────────────────────────────────────────────────

  @Test
  void importUsers_callsServiceWithFile_returnsMessage() {
    MockMultipartFile file = new MockMultipartFile("file", "users.xlsx", null, new byte[1024]);

    ResponseEntity<?> resp = controller.importUsers(file);

    verify(adminUserService).importUsersFromExcel(any(MultipartFile.class));
    assertEquals("Users imported successfully", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  // ── online users ─────────────────────────────────────────────────────

  @Test
  void getOnlineUserIds_delegatesToWebSocketListener() {
    Set<Long> online = Set.of(1L, 5L, 10L);
    when(webSocketEventListener.getOnlineUserIds()).thenReturn(online);

    ResponseEntity<Set<Long>> resp = controller.getOnlineUserIds();

    assertSame(online, resp.getBody());
  }

  @Test
  void getOnlineUserIds_empty_returnsEmptySet() {
    when(webSocketEventListener.getOnlineUserIds()).thenReturn(Set.of());

    Set<Long> body = controller.getOnlineUserIds().getBody();
    assertNotNull(body);
    assertTrue(body.isEmpty());
  }
}
