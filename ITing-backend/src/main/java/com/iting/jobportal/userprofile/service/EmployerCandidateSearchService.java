package com.iting.jobportal.userprofile.service;

import com.iting.jobportal.userprofile.dto.request.EmployerCandidateSearchRequest;
import com.iting.jobportal.userprofile.dto.response.EmployerCandidateSearchResponse;
import org.springframework.data.domain.Page;
import com.iting.jobportal.userprofile.dto.response.CandidateFullProfileResponse;

public interface EmployerCandidateSearchService {
    Page<EmployerCandidateSearchResponse> search(EmployerCandidateSearchRequest request);

    CandidateFullProfileResponse getCandidateFullProfile(Long candidateId);
}
