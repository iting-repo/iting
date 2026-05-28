package com.iting.jobportal.company.controller;

import com.iting.jobportal.company.dto.response.CompanyReviewResponse;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.CompanyReview;
import com.iting.jobportal.company.service.CompanyReviewService;
import com.iting.jobportal.file.FileUploadService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CandidateCompanyReviewControllerTest {

    @Mock private CompanyReviewService reviewService;
    @Mock private FileUploadService fileUploadService;
    @InjectMocks private CandidateCompanyReviewController controller;

    @Test
    void postReview_callsServiceWithRatingAndContent() {
        Company company = new Company();
        company.setId(1L);
        company.setName("Foo");
        CompanyReview review = CompanyReview.builder()
                .id(100L)
                .company(company)
                .rating(5)
                .content("Excellent")
                .build();
        when(reviewService.createReview(1L, 99L, 5, "Excellent")).thenReturn(review);

        Map<String, Object> payload = Map.of("rating", 5, "content", "Excellent");

        ResponseEntity<CompanyReviewResponse> resp = controller.postReview(1L, 99L, payload);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        CompanyReviewResponse body = resp.getBody();
        assertNotNull(body);
        assertEquals(5, body.getRating());
        assertEquals("Excellent", body.getContent());
        verify(reviewService).createReview(1L, 99L, 5, "Excellent");
    }
}
