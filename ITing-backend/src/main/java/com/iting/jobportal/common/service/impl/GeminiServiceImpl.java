package com.iting.jobportal.common.service.impl;

import com.iting.jobportal.common.service.GeminiService;
import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.entity.Job;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
public class GeminiServiceImpl implements GeminiService {

    @Override
    public JobSearchRequest extractSearchCriteriaFromCv(String cvText) {
        log.warn("GeminiService.extractSearchCriteriaFromCv: AI chưa được kích hoạt, trả về rỗng");
        return new JobSearchRequest();
    }

    @Override
    public List<String> expandSearchTerms(String keyword) {
        log.warn("GeminiService.expandSearchTerms: AI chưa được kích hoạt, trả về rỗng");
        return Collections.emptyList();
    }

    @Override
    public String reviewJob(Job job) {
        log.warn("GeminiService.reviewJob: AI chưa được kích hoạt, mặc định APPROVE job id={}", job.getId());
        return "FINAL_DECISION: [APPROVE] - AI chưa được kích hoạt, mặc định duyệt.";
    }

    @Override
    public String generateCoverLetter(String candidateName,
                                      List<String> skills,
                                      String bio,
                                      int yearsExperience,
                                      Job job) {
        log.warn("GeminiService.generateCoverLetter: AI chưa được kích hoạt, trả về template tĩnh");
        String company = (job != null && job.getCompany() != null) ? job.getCompany().getName() : "Quý công ty";
        String title = (job != null && job.getTitle() != null) ? job.getTitle() : "vị trí ứng tuyển";
        StringBuilder sb = new StringBuilder();
        sb.append("Kính gửi ").append(company).append(",\n\n");
        sb.append("Tôi là ").append(candidateName != null ? candidateName : "ứng viên")
          .append(", có ").append(yearsExperience).append(" năm kinh nghiệm. ");
        sb.append("Tôi quan tâm tới vị trí ").append(title).append(" tại quý công ty.\n\n");
        if (bio != null && !bio.isBlank()) {
            sb.append(bio).append("\n\n");
        }
        if (skills != null && !skills.isEmpty()) {
            sb.append("Kỹ năng nổi bật: ").append(String.join(", ", skills)).append(".\n\n");
        }
        sb.append("Rất mong được trao đổi thêm.\n\nTrân trọng,\n")
          .append(candidateName != null ? candidateName : "Ứng viên");
        return sb.toString();
    }
}
