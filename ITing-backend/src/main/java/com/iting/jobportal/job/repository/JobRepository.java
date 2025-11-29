package com.iting.jobportal.job.repository;

import com.iting.jobportal.job.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {
}
