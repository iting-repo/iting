package com.iting.jobportal.notification.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.iting.jobportal.notification.dto.NotificationPreferenceDto;
import com.iting.jobportal.notification.service.NotificationPreferenceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class NotificationPreferenceControllerTest {

  @Mock private NotificationPreferenceService service;
  @InjectMocks private NotificationPreferenceController controller;

  @Test
  void get_authenticated_delegatesToService() {
    NotificationPreferenceDto expected = new NotificationPreferenceDto();
    when(service.getOrCreate(1L)).thenReturn(expected);

    ResponseEntity<NotificationPreferenceDto> resp = controller.get(1L);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(expected, resp.getBody());
  }

  @Test
  void get_unauthenticated_throws401() {
    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.get(null));
    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
  }

  @Test
  void update_authenticated_delegatesToService() {
    NotificationPreferenceDto input = new NotificationPreferenceDto();
    NotificationPreferenceDto expected = new NotificationPreferenceDto();
    when(service.update(1L, input)).thenReturn(expected);

    ResponseEntity<NotificationPreferenceDto> resp = controller.update(1L, input);

    assertSame(expected, resp.getBody());
  }

  @Test
  void update_unauthenticated_throws401() {
    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> controller.update(null, new NotificationPreferenceDto()));
    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
  }
}
