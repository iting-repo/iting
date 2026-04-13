package com.iting.jobportal.job.service.impl;

import com.iting.jobportal.company.entity.UserFollowCompany;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.repository.UserFollowCompanyRepository;
import com.iting.jobportal.job.dto.FollowedCompanyJobResponse;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.repository.UserSaveJobRepository;
import com.iting.jobportal.job.service.JobAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobAlertServiceImpl implements JobAlertService {

    private final UserFollowCompanyRepository userFollowCompanyRepository;
    private final JobRepository jobRepository;
    private final UserSaveJobRepository userSaveJobRepository;

    @Override
    public Page<FollowedCompanyJobResponse> getJobsFromFollowedCompanies(Long userId, Pageable pageable) {
        List<UserFollowCompany> followedCompanies = userFollowCompanyRepository
                .findByUserId(userId, Pageable.unpaged()).getContent();

        if (followedCompanies.isEmpty()) {
            return Page.empty(pageable);
        }

        List<Long> companyIds = followedCompanies.stream()
                .map(UserFollowCompany::getCompanyId)
                .collect(Collectors.toList());

        List<Job> allJobs = new ArrayList<>();
        for (Long companyId : companyIds) {
            Page<Job> companyJobs = jobRepository.findByCompany_IdAndStatus(companyId, JobStatus.ACTIVE, Pageable.unpaged());
            allJobs.addAll(companyJobs.getContent());
        }

        allJobs.sort((a, b) -> {
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allJobs.size());
        List<Job> pagedJobs = start > allJobs.size() ? List.of() : allJobs.subList(start, end);

        List<FollowedCompanyJobResponse> responses = pagedJobs.stream()
                .map(job -> toResponse(job, userId))
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, allJobs.size());
    }

    private FollowedCompanyJobResponse toResponse(Job job, Long userId) {
        Company company = job.getCompany();
        boolean isSaved = userSaveJobRepository.existsByUserIdAndJobId(userId, job.getId());

        return FollowedCompanyJobResponse.builder()
                .jobId(job.getId())
                .title(job.getTitle())
                .position(job.getPosition())
                .companyName(company != null ? company.getName() : null)
                .companyLogo(company != null ? company.getLogoUrl() : null)
                .jobType(job.getJobType() != null ? job.getJobType().name() : null)
                .location(job.getLocation())
                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .salaryType(job.getSalaryType() != null ? job.getSalaryType().name() : null)
                .dueDate(job.getDueDate())
                .createdAt(job.getCreatedAt())
                .isSaved(isSaved)
                .build();
    }
}
