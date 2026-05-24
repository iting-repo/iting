package com.iting.jobportal.userprofile.service;

import com.iting.jobportal.userprofile.dto.request.EmployerCandidateSearchRequest;
import com.iting.jobportal.userprofile.dto.request.MatchByJobRequest;
import com.iting.jobportal.userprofile.dto.response.EmployerCandidateSearchResponse;
import org.springframework.data.domain.Page;
import com.iting.jobportal.userprofile.dto.response.CandidateFullProfileResponse;

public interface EmployerCandidateSearchService {
    Page<EmployerCandidateSearchResponse> search(EmployerCandidateSearchRequest request);

    CandidateFullProfileResponse getCandidateFullProfile(Long candidateId);

    /**
     * Match ứng viên (chỉ những người openToWork=true) với job đã đăng,
     * dùng job.jobEmbedding làm query vector.
     * Throws RuntimeException nếu job không tồn tại hoặc không thể embed.
     */
    Page<EmployerCandidateSearchResponse> searchByJob(Long jobId, MatchByJobRequest request);
}
