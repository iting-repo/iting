package com.iting.jobportal.job.service.impl;

import com.iting.jobportal.job.dto.CreateJobRequest;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.service.JobService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;

    @Override
    public Long createJob(Long employerId, CreateJobRequest request) {
        Job job = new Job();
        job.setEmployerId(employerId);
        job.setPosition(request.getPosition());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setTechRequired(request.getTechRequired());
        job.setMaxAccept(request.getMaxAccept());
        job.setMinSalary(request.getMinSalary());
        job.setMaxSalary(request.getMaxSalary());
        job.setDueDate(request.getDueDate());

        return jobRepository.save(job).getId();
    }
}
