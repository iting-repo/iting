package com.iting.jobportal.application.controller;

import com.iting.jobportal.application.dto.request.CreateOfferRequest;
import com.iting.jobportal.application.dto.response.OfferResponse;
import com.iting.jobportal.application.service.OfferService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HrOfferControllerTest {

    @Mock private OfferService offerService;
    @InjectMocks private HrOfferController controller;

    @Test
    void create_delegatesToService() {
        CreateOfferRequest req = new CreateOfferRequest();
        OfferResponse expected = OfferResponse.builder().build();
        when(offerService.create(99L, req)).thenReturn(expected);

        ResponseEntity<OfferResponse> resp = controller.create(99L, req);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertSame(expected, resp.getBody());
    }

    @Test
    void revoke_passesHrAndOfferId() {
        OfferResponse expected = OfferResponse.builder().build();
        when(offerService.revoke(99L, 5L)).thenReturn(expected);

        assertSame(expected, controller.revoke(99L, 5L).getBody());
    }

    @Test
    void get_isHrTrue() {
        OfferResponse expected = OfferResponse.builder().build();
        when(offerService.getById(99L, 5L, true)).thenReturn(expected);

        assertSame(expected, controller.get(99L, 5L).getBody());
    }

    @Test
    void viewPdf_returnsPresignedUrl_isHrTrue() {
        when(offerService.getPdfPresignedUrl(99L, 5L, true)).thenReturn("https://s3/hr-offer.pdf");

        ResponseEntity<Map<String, String>> resp = controller.viewPdf(99L, 5L);

        assertEquals("https://s3/hr-offer.pdf", resp.getBody().get("url"));
    }

    @Test
    void listByApplication_passesAllArgs() {
        List<OfferResponse> expected = List.of();
        when(offerService.listByApplication(99L, 1L, 2L)).thenReturn(expected);

        ResponseEntity<List<OfferResponse>> resp = controller.listByApplication(99L, 1L, 2L);

        assertSame(expected, resp.getBody());
    }
}
