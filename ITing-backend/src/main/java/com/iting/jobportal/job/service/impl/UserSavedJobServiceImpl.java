package com.iting.jobportal.job.service.impl;

import com.iting.jobportal.job.dto.SavedJobResponse;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.UserSaveJob;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.repository.UserSaveJobRepository;
import com.iting.jobportal.job.service.UserSavedJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserSavedJobServiceImpl implements UserSavedJobService {

    private final UserSaveJobRepository userSaveJobRepository;
    private final JobRepository jobRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<SavedJobResponse> getSavedJobs(Long userId, Pageable pageable) {
        Page<UserSaveJob> savedPage = userSaveJobRepository.findAllByUserId(userId, pageable);
        return savedPage.map(this::toResponse);
    }

    @Override
    public void saveJob(Long userId, Long jobId) {
        if (userSaveJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            return;
        }
        jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        userSaveJobRepository.save(UserSaveJob.builder()
                .userId(userId)
                .jobId(jobId)
                .build());
    }

    @Override
    public void unsaveJob(Long userId, Long jobId) {
        userSaveJobRepository.deleteByUserIdAndJobId(userId, jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSaved(Long userId, Long jobId) {
        return userSaveJobRepository.existsByUserIdAndJobId(userId, jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countSavedJobs(Long userId) {
        return userSaveJobRepository.countByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<Long> getSavedJobIds(Long userId) {
        return userSaveJobRepository.findAllJobIdByUserId(userId);
    }

    private SavedJobResponse toResponse(UserSaveJob saved) {
        Job job = jobRepository.findById(saved.getJobId())
                .orElse(null);
        if (job == null) {
            return SavedJobResponse.builder()
                    .jobId(saved.getJobId())
                    .build();
        }
        return SavedJobResponse.builder()
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .companyName(job.getCompany() != null ? job.getCompany().getName() : null)
                .companyLogo(job.getCompany() != null ? job.getCompany().getLogoUrl() : null)
                .jobType(job.getJobType() != null ? job.getJobType().name() : null)
                .location(job.getLocation())
                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .salaryType(job.getSalaryType() != null ? job.getSalaryType().name() : null)
                .savedAt(null)
                .build();
    }
}
