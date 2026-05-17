package com.iting.jobportal.common.service;

import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.entity.Job;

import java.util.List;

public interface GeminiService {

    /**
     * Phân tích CV text để trích xuất tiêu chí tìm kiếm.
     */
    JobSearchRequest extractSearchCriteriaFromCv(String cvText);

    /**
     * Mở rộng từ khóa tìm kiếm bằng AI (synonyms, related terms).
     */
    List<String> expandSearchTerms(String keyword);

    /**
     * Duyệt tự động job bằng AI, trả về kết quả review.
     */
    String reviewJob(Job job);
}
