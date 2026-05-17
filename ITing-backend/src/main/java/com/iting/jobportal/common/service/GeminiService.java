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

    /**
     * Sinh cover letter cá nhân hóa cho một ứng viên ứng tuyển job cụ thể.
     * @param candidateName Tên ứng viên
     * @param skills        Danh sách kỹ năng nổi bật
     * @param bio           Giới thiệu bản thân (có thể null)
     * @param yearsExperience Số năm kinh nghiệm (có thể 0)
     * @param job           Job đang ứng tuyển (làm context: title/company/description)
     */
    String generateCoverLetter(String candidateName,
                               List<String> skills,
                               String bio,
                               int yearsExperience,
                               Job job);
}
