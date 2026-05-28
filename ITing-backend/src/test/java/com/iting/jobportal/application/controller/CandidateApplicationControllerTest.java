package com.iting.jobportal.application.controller;

import com.iting.jobportal.application.dto.request.ApplyJobRequest;
import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.dto.response.ApplicationSubmitResponse;
import com.iting.jobportal.application.service.CandidateApplicationService;
import com.iting.jobportal.recommendation.entity.enums.InteractionType;
import com.iting.jobportal.recommendation.service.InteractionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CandidateApplicationControllerTest {

    @Mock private CandidateApplicationService candidateApplicationService;
    @Mock private InteractionService interactionService;
    @InjectMocks private CandidateApplicationController controller;

    // ── applyJob ─────────────────────────────────────────────────────────

    @Test
    void applyJob_success_alsoTracksInteraction() {
        ApplyJobRequest req = new ApplyJobRequest();
        req.setJobId(42L);
        ApplicationSubmitResponse expected = ApplicationSubmitResponse.builder().build();
        when(candidateApplicationService.applyJob(1L, req)).thenReturn(expected);

        ResponseEntity<ApplicationSubmitResponse> resp = controller.applyJob(1L, req);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertSame(expected, resp.getBody());
        verify(interactionService).trackInteraction(1L, 42L, InteractionType.APPLY);
    }

    @Test
    void applyJob_nullUserId_skipsInteractionTracking() {
        // Edge: chưa login (userId null) — applyJob có thể vẫn được gọi
        // (filter của @CurrentUser cho phép null), interaction NOT tracked.
        ApplyJobRequest req = new ApplyJobRequest();
        req.setJobId(42L);
        when(candidateApplicationService.applyJob(null, req)).thenReturn(ApplicationSubmitResponse.builder().build());

        controller.applyJob(null, req);

        verify(interactionService, never()).trackInteraction(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any());
    }

    @Test
    void applyJob_nullJobId_skipsInteractionTracking() {
        ApplyJobRequest req = new ApplyJobRequest();
        req.setJobId(null);
        when(candidateApplicationService.applyJob(1L, req)).thenReturn(ApplicationSubmitResponse.builder().build());

        controller.applyJob(1L, req);

        verify(interactionService, never()).trackInteraction(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any());
    }

    // ── withdrawApplication ──────────────────────────────────────────────

    @Test
    void withdrawApplication_callsService_returnsMessage() {
        ResponseEntity<?> resp = controller.withdrawApplication(1L, 5L);

        verify(candidateApplicationService).withdrawApplication(1L, 5L);
        assertEquals("Application withdrawn successfully", ((Map<?, ?>) resp.getBody()).get("message"));
    }

    // ── getMyApplications ────────────────────────────────────────────────

    @Test
    void getMyApplications_passesStatusAndPagination() {
        Page<ApplicationResponse> page = new PageImpl<>(List.of());
        when(candidateApplicationService.getMyApplications(1L, "APPLIED", 0, 10)).thenReturn(page);

        assertSame(page, controller.getMyApplications(1L, "APPLIED", 0, 10).getBody());
    }

    @Test
    void getMyApplications_nullStatus_passedAsNull() {
        when(candidateApplicationService.getMyApplications(1L, null, 0, 10))
                .thenReturn(new PageImpl<>(List.of()));

        controller.getMyApplications(1L, null, 0, 10);

        verify(candidateApplicationService).getMyApplications(1L, null, 0, 10);
    }

    // ── checkApplied ─────────────────────────────────────────────────────

    @Test
    void checkApplied_true_returnsTrue() {
        when(candidateApplicationService.hasApplied(1L, 42L)).thenReturn(true);

        ResponseEntity<Map<String, Boolean>> resp = controller.checkApplied(1L, 42L);

        assertEquals(true, resp.getBody().get("hasApplied"));
    }

    @Test
    void checkApplied_false_returnsFalse() {
        when(candidateApplicationService.hasApplied(1L, 42L)).thenReturn(false);

        assertEquals(false, controller.checkApplied(1L, 42L).getBody().get("hasApplied"));
    }
}
