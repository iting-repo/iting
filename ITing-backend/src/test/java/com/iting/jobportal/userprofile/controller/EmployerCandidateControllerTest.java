package com.iting.jobportal.userprofile.controller;

import com.iting.jobportal.userprofile.dto.request.EmployerCandidateSearchRequest;
import com.iting.jobportal.userprofile.dto.response.CandidateFullProfileResponse;
import com.iting.jobportal.userprofile.dto.response.EmployerCandidateSearchResponse;
import com.iting.jobportal.userprofile.service.EmployerCandidateSearchService;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployerCandidateControllerTest {

    @Mock private EmployerCandidateSearchService service;
    @InjectMocks private EmployerCandidateController controller;

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
}
