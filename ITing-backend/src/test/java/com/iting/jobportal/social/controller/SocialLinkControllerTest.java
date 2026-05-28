package com.iting.jobportal.social.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.userprofile.dto.request.SocialLinksBulkRequest;
import com.iting.jobportal.userprofile.dto.response.SocialLinkResponse;
import com.iting.jobportal.userprofile.service.SocialLinkService;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class SocialLinkControllerTest {

  @Mock private SocialLinkService socialLinkService;
  @InjectMocks private SocialLinkController controller;

  @Test
  void getSocialLinks_passesUserIdAsString() {
    SocialLinkResponse expected = new SocialLinkResponse();
    when(socialLinkService.getSocialLinks("1")).thenReturn(expected);

    assertSame(expected, controller.getSocialLinks(1L).getBody());
  }

  @Test
  void saveSocialLinks_callsService_returnsMessage() {
    SocialLinksBulkRequest req = new SocialLinksBulkRequest();
    ResponseEntity<?> resp = controller.saveSocialLinks(1L, req);

    verify(socialLinkService).saveSocialLinks("1", req);
    assertEquals("Social links updated successfully", ((Map<?, ?>) resp.getBody()).get("message"));
  }
}
