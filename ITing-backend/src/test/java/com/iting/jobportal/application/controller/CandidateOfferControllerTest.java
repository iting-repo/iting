package com.iting.jobportal.application.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.when;

import com.iting.jobportal.application.dto.request.DeclineOfferRequest;
import com.iting.jobportal.application.dto.response.OfferResponse;
import com.iting.jobportal.application.service.OfferService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class CandidateOfferControllerTest {

  @Mock private OfferService offerService;
  @InjectMocks private CandidateOfferController controller;

  @Test
  void listMyOffers_delegatesToService() {
    List<OfferResponse> expected = List.of();
    when(offerService.listMyOffers(1L)).thenReturn(expected);

    ResponseEntity<List<OfferResponse>> resp = controller.listMyOffers(1L);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(expected, resp.getBody());
  }

  @Test
  void get_passesAccountAndOfferId_isHrFalse() {
    OfferResponse expected = OfferResponse.builder().build();
    when(offerService.getById(1L, 5L, false)).thenReturn(expected);

    assertSame(expected, controller.get(1L, 5L).getBody());
  }

  @Test
  void viewPdf_returnsPresignedUrl_isHrFalse() {
    when(offerService.getPdfPresignedUrl(1L, 5L, false)).thenReturn("https://s3/offer-5.pdf");

    ResponseEntity<Map<String, String>> resp = controller.viewPdf(1L, 5L);

    assertEquals("https://s3/offer-5.pdf", resp.getBody().get("url"));
  }

  @Test
  void accept_delegatesToService() {
    OfferResponse expected = OfferResponse.builder().build();
    when(offerService.acceptByCandidate(1L, 5L)).thenReturn(expected);

    assertSame(expected, controller.accept(1L, 5L).getBody());
  }

  @Test
  void decline_passesReason() {
    DeclineOfferRequest body = new DeclineOfferRequest();
    OfferResponse expected = OfferResponse.builder().build();
    when(offerService.declineByCandidate(1L, 5L, body)).thenReturn(expected);

    assertSame(expected, controller.decline(1L, 5L, body).getBody());
  }

  @Test
  void decline_nullBody_passedThrough() {
    OfferResponse expected = OfferResponse.builder().build();
    when(offerService.declineByCandidate(1L, 5L, null)).thenReturn(expected);

    // RequestBody(required=false) → body có thể null
    assertSame(expected, controller.decline(1L, 5L, null).getBody());
  }
}
