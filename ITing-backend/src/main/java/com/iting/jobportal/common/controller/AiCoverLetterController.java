package com.iting.jobportal.common.controller;

import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.common.ratelimit.RateLimitPolicy;
import com.iting.jobportal.common.ratelimit.RateLimited;
import com.iting.jobportal.common.service.GeminiService;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.repository.UserProfileRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * AI-powered cover letter generator. Uses Gemini + candidate profile + target job.
 *
 * <p>Rate-limited (AI_REVIEW policy: 15 requests / 10 min / user) to control cost.
 */
@RestController
@RequestMapping("/api/ai/cover-letter")
@RequiredArgsConstructor
public class AiCoverLetterController {

    private final GeminiService geminiService;
    private final JobRepository jobRepository;
    private final UserProfileRepository userProfileRepository;
    private final JwtTokenUtil jwtTokenUtil;

    @PostMapping("/job/{jobId}")
    @RateLimited(policy = RateLimitPolicy.AI_REVIEW, subject = "user")
    public ResponseEntity<Map<String, String>> generateForJob(
            @PathVariable Long jobId,
            HttpServletRequest request) {

        Long userId = jwtTokenUtil.getUserIdFromHeader(request);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job không tồn tại"));

        UserProfile profile = userProfileRepository.findByAccountId(userId).orElse(null);

        String candidateName = profile != null && profile.getFullName() != null
                ? profile.getFullName() : "Ứng viên";

        List<String> skillNames = new ArrayList<>();
        if (profile != null && profile.getSkills() != null) {
            profile.getSkills().forEach(s -> {
                if (s.getName() != null) skillNames.add(s.getName());
            });
        }

        String bio = profile != null ? profile.getBio() : "";

        // Tính years experience từ work experience đầu tiên (oldest startDate)
        int years = computeYearsOfExperience(profile);

        String coverLetter = geminiService.generateCoverLetter(
                candidateName, skillNames, bio, years, job);

        return ResponseEntity.ok(Map.of(
                "coverLetter", coverLetter,
                "jobTitle", job.getTitle() != null ? job.getTitle() : "",
                "companyName", job.getCompany() != null && job.getCompany().getName() != null
                        ? job.getCompany().getName() : ""
        ));
    }

    private int computeYearsOfExperience(UserProfile profile) {
        if (profile == null || profile.getWorkExperiences() == null
                || profile.getWorkExperiences().isEmpty()) {
            return 0;
        }
        LocalDate earliestStart = null;
        for (var exp : profile.getWorkExperiences()) {
            LocalDate s = exp.getStartDate();
            if (s != null && (earliestStart == null || s.isBefore(earliestStart))) {
                earliestStart = s;
            }
        }
        if (earliestStart == null) return 0;
        return Math.max(0, Period.between(earliestStart, LocalDate.now()).getYears());
    }
}
