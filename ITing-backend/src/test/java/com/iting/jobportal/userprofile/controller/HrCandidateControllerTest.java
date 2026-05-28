package com.iting.jobportal.userprofile.controller;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.payment.service.CreditService;
import com.iting.jobportal.userprofile.dto.request.EmployerCandidateSearchRequest;
import com.iting.jobportal.userprofile.dto.request.MatchByJobRequest;
import com.iting.jobportal.userprofile.dto.response.CandidateFullProfileResponse;
import com.iting.jobportal.userprofile.dto.response.EmployerCandidateSearchResponse;
import com.iting.jobportal.userprofile.service.EmployerCandidateSearchService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HrCandidateControllerTest {

    @Mock private EmployerCandidateSearchService service;
    @Mock private JobRepository jobRepository;
    @Mock private CreditService creditService;

    @InjectMocks private HrCandidateController controller;

    // ── search / getCandidateFullProfile ────────────────────────────────

    @Test
    void search_delegatesToService() {
        EmployerCandidateSearchRequest req = new EmployerCandidateSearchRequest();
        Page<EmployerCandidateSearchResponse> page = new PageImpl<>(List.of());
        when(service.search(req)).thenReturn(page);

        ResponseEntity<Page<EmployerCandidateSearchResponse>> resp = controller.search(req);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertSame(page, resp.getBody());
    }

    @Test
    void getCandidateFullProfile_delegatesToService() {
        CandidateFullProfileResponse expected = new CandidateFullProfileResponse();
        when(service.getCandidateFullProfile(5L)).thenReturn(expected);

        assertSame(expected, controller.getCandidateFullProfile(5L).getBody());
    }

    // ── matchByJob: ownership + credits + service call ─────────────────

    @Test
    void matchByJob_owner_consumesCredits_andCallsService() {
        Job job = Job.builder().id(42L).postedByHrId(99L).build();
        when(jobRepository.findById(42L)).thenReturn(Optional.of(job));
        Page<EmployerCandidateSearchResponse> page = new PageImpl<>(List.of());
        MatchByJobRequest req = MatchByJobRequest.builder().build();
        when(service.searchByJob(42L, req)).thenReturn(page);

        ResponseEntity<Page<EmployerCandidateSearchResponse>> resp = controller.matchByJob(42L, 99L, req);

        verify(creditService).consume(99L, 5, "AI_CANDIDATE_MATCH", 42L,
                "AI match ứng viên cho job #42");
        assertSame(page, resp.getBody());
    }

    @Test
    void matchByJob_notOwner_throws403_noCreditConsumed() {
        Job job = Job.builder().id(42L).postedByHrId(99L).build();
        when(jobRepository.findById(42L)).thenReturn(Optional.of(job));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.matchByJob(42L, 100L, null));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(creditService, never()).consume(any(), any(Integer.class), any(), any(), any());
    }

    @Test
    void matchByJob_postedByNull_throws403() {
        // Orphan job (postedByHrId NULL) → no one is owner → 403
        Job job = Job.builder().id(42L).postedByHrId(null).build();
        when(jobRepository.findById(42L)).thenReturn(Optional.of(job));

        assertThrows(ResponseStatusException.class,
                () -> controller.matchByJob(42L, 99L, null));
        verify(creditService, never()).consume(any(), any(Integer.class), any(), any(), any());
    }

    @Test
    void matchByJob_jobNotFound_throws404_noCreditConsumed() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.matchByJob(42L, 99L, null));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(creditService, never()).consume(any(), any(Integer.class), any(), any(), any());
    }

    @Test
    void matchByJob_insufficientCredits_propagates_noServiceCall() {
        Job job = Job.builder().id(42L).postedByHrId(99L).build();
        when(jobRepository.findById(42L)).thenReturn(Optional.of(job));
        org.mockito.Mockito.doThrow(new CreditService.InsufficientCreditException("Không đủ credits"))
                .when(creditService).consume(eq(99L), eq(5), eq("AI_CANDIDATE_MATCH"), eq(42L), any());

        assertThrows(CreditService.InsufficientCreditException.class,
                () -> controller.matchByJob(42L, 99L, null));
        verify(service, never()).searchByJob(any(), any());
    }

    // ── similarByJob: ownership + limit clamp + excludeUserId filter ───

    @Test
    void similarByJob_owner_returnsFilteredList() {
        Job job = Job.builder().id(42L).postedByHrId(99L).build();
        when(jobRepository.findById(42L)).thenReturn(Optional.of(job));

        EmployerCandidateSearchResponse c1 = EmployerCandidateSearchResponse.builder().id(1L).build();
        EmployerCandidateSearchResponse c2 = EmployerCandidateSearchResponse.builder().id(2L).build();
        EmployerCandidateSearchResponse c3 = EmployerCandidateSearchResponse.builder().id(3L).build();
        when(service.searchByJob(eq(42L), any(MatchByJobRequest.class)))
                .thenReturn(new PageImpl<>(List.of(c1, c2, c3)));

        ResponseEntity<List<EmployerCandidateSearchResponse>> resp =
                controller.similarByJob(42L, 99L, null, 5);

        assertEquals(3, resp.getBody().size());
    }

    @Test
    void similarByJob_excludeUserId_filtered() {
        Job job = Job.builder().id(42L).postedByHrId(99L).build();
        when(jobRepository.findById(42L)).thenReturn(Optional.of(job));

        EmployerCandidateSearchResponse c1 = EmployerCandidateSearchResponse.builder().id(1L).build();
        EmployerCandidateSearchResponse c2 = EmployerCandidateSearchResponse.builder().id(2L).build();
        when(service.searchByJob(eq(42L), any(MatchByJobRequest.class)))
                .thenReturn(new PageImpl<>(List.of(c1, c2)));

        ResponseEntity<List<EmployerCandidateSearchResponse>> resp =
                controller.similarByJob(42L, 99L, 1L, 5);

        // c1 (id=1) bị filter ra
        assertEquals(1, resp.getBody().size());
        assertEquals(2L, resp.getBody().get(0).getId());
    }

    @Test
    void similarByJob_limitClamps_above20() {
        Job job = Job.builder().id(42L).postedByHrId(99L).build();
        when(jobRepository.findById(42L)).thenReturn(Optional.of(job));
        when(service.searchByJob(eq(42L), any(MatchByJobRequest.class)))
                .thenReturn(new PageImpl<>(List.of()));

        controller.similarByJob(42L, 99L, null, 100);

        ArgumentCaptor<MatchByJobRequest> cap = ArgumentCaptor.forClass(MatchByJobRequest.class);
        verify(service).searchByJob(eq(42L), cap.capture());
        assertEquals(20, cap.getValue().getSize(), "limit > 20 phải clamp xuống 20");
    }

    @Test
    void similarByJob_limitClamps_below1() {
        Job job = Job.builder().id(42L).postedByHrId(99L).build();
        when(jobRepository.findById(42L)).thenReturn(Optional.of(job));
        when(service.searchByJob(eq(42L), any(MatchByJobRequest.class)))
                .thenReturn(new PageImpl<>(List.of()));

        controller.similarByJob(42L, 99L, null, 0);

        ArgumentCaptor<MatchByJobRequest> cap = ArgumentCaptor.forClass(MatchByJobRequest.class);
        verify(service).searchByJob(eq(42L), cap.capture());
        assertEquals(1, cap.getValue().getSize(), "limit < 1 phải clamp lên 1");
    }

    @Test
    void similarByJob_excludeUserId_addsBufferToSize() {
        Job job = Job.builder().id(42L).postedByHrId(99L).build();
        when(jobRepository.findById(42L)).thenReturn(Optional.of(job));
        when(service.searchByJob(eq(42L), any(MatchByJobRequest.class)))
                .thenReturn(new PageImpl<>(List.of()));

        controller.similarByJob(42L, 99L, 1L, 5);

        ArgumentCaptor<MatchByJobRequest> cap = ArgumentCaptor.forClass(MatchByJobRequest.class);
        verify(service).searchByJob(eq(42L), cap.capture());
        assertEquals(6, cap.getValue().getSize(),
                "excludeUserId không null → fetch limit+1 để có buffer sau filter");
    }

    @Test
    void similarByJob_notOwner_throws403() {
        Job job = Job.builder().id(42L).postedByHrId(99L).build();
        when(jobRepository.findById(42L)).thenReturn(Optional.of(job));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.similarByJob(42L, 100L, null, 5));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(service, never()).searchByJob(any(), any());
    }

    @Test
    void similarByJob_jobNotFound_throws404() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.similarByJob(42L, 99L, null, 5));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }
}
