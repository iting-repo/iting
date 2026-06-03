package com.iting.jobportal.userprofile.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.userprofile.service.ProfileCompletenessService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ProfileCompletenessControllerTest {

  @Mock private ProfileCompletenessService service;
  @Mock private JwtTokenUtil jwtTokenUtil;
  @Mock private HttpServletRequest request;
  @InjectMocks private ProfileCompletenessController controller;

  @Test
  void getCompleteness_authenticated_returnsServiceResult() {
    Map<String, Object> expected = Map.of("score", 70, "maxScore", 100, "percentage", 70);
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
    when(service.compute(1L)).thenReturn(expected);

    ResponseEntity<Map<String, Object>> resp = controller.getCompleteness(request);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(expected, resp.getBody());
  }

  @Test
  void getCompleteness_unauthenticated_throws401() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.getCompleteness(request));
    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
  }
}
