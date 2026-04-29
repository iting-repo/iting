package com.iting.jobportal.application.repository;

import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.entity.ApplyFormSentToJob.ApplyFormSentToJobId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminApplicationRepository extends JpaRepository<ApplyFormSentToJob, ApplyFormSentToJobId> {
}
