package com.iting.jobportal.recommendation.task;

import com.iting.jobportal.common.service.EmailService;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.recommendation.entity.SavedSearch;
import com.iting.jobportal.recommendation.repository.SavedSearchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Quét DB tìm các saved-search có alerts enabled, tìm job match mới hơn lần gửi trước,
 * gửi email digest và update timestamp.
 *
 * <p>Lịch chạy: mỗi giờ. Bên trong sẽ check `alertFrequency`:
 * <ul>
 *   <li>DAILY  → chỉ gửi nếu lần gửi trước > 24h</li>
 *   <li>WEEKLY → chỉ gửi nếu lần gửi trước > 7 ngày</li>
 * </ul>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SavedSearchAlertTask {

    private final SavedSearchRepository savedSearchRepository;
    private final JobRepository jobRepository;
    private final EmailService emailService;

    /** Chạy 1 lần mỗi giờ (60 phút * 60 giây * 1000 ms). */
    @Scheduled(fixedRate = 3_600_000L)
    @Transactional
    public void sendAlertDigests() {
        sendDigestsForFrequency("DAILY", LocalDateTime.now().minusDays(1));
        sendDigestsForFrequency("WEEKLY", LocalDateTime.now().minusDays(7));
    }

    private void sendDigestsForFrequency(String frequency, LocalDateTime threshold) {
        List<SavedSearch> dueAlerts = savedSearchRepository.findDueForAlert(frequency, threshold);
        if (dueAlerts.isEmpty()) return;

        log.info("[SavedSearchAlertTask] Found {} {} alerts to send", dueAlerts.size(), frequency);

        for (SavedSearch s : dueAlerts) {
            try {
                processSearch(s);
            } catch (Exception e) {
                log.error("Failed to process saved search id={}: {}", s.getId(), e.getMessage());
            }
        }
    }

    private void processSearch(SavedSearch search) {
        // Lấy 5 job active gần đây nhất có id > lastMatchedJobId
        // (Simple version — production should match keyword/location/salary/level)
        List<Job> newJobs = jobRepository.findTop5ByStatusAndIdGreaterThanOrderByCreatedAtDesc(
                JobStatus.ACTIVE,
                search.getLastMatchedJobId() != null ? search.getLastMatchedJobId() : 0L);

        if (newJobs.isEmpty()) {
            // Vẫn update timestamp để không re-query trong cùng cửa sổ
            search.setLastAlertSentAt(LocalDateTime.now());
            savedSearchRepository.save(search);
            return;
        }

        String subject = String.format("[ITing] %d việc làm mới phù hợp '%s'",
                newJobs.size(),
                search.getName());

        StringBuilder body = new StringBuilder();
        body.append("Chào bạn,\n\n");
        body.append("Có ").append(newJobs.size()).append(" việc làm mới phù hợp với saved search '")
            .append(search.getName()).append("':\n\n");

        for (Job j : newJobs) {
            body.append("• ").append(j.getTitle());
            if (j.getCompany() != null && j.getCompany().getName() != null) {
                body.append(" — ").append(j.getCompany().getName());
            }
            body.append("\n  https://iting.vn/jobs/").append(j.getId()).append("\n\n");
        }

        body.append("Để dừng nhận thông báo: https://iting.vn/me/saved-searches\n\n");
        body.append("Trân trọng,\nĐội ngũ ITing.");

        if (search.getAccount() != null && search.getAccount().getEmail() != null) {
            emailService.sendEmail(search.getAccount().getEmail(), subject, body.toString());
        }

        // Update last alert timestamp + last matched job id
        search.setLastAlertSentAt(LocalDateTime.now());
        search.setLastMatchedJobId(newJobs.get(0).getId());
        savedSearchRepository.save(search);
    }
}
