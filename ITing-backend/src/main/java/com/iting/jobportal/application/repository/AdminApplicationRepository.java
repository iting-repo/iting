package com.iting.jobportal.application.repository;

import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.entity.ApplyFormSentToJob.ApplyFormSentToJobId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminApplicationRepository extends JpaRepository<ApplyFormSentToJob, ApplyFormSentToJobId> {

    @org.springframework.data.jpa.repository.Query(
        "SELECT a FROM ApplyFormSentToJob a WHERE a.id.jobId = :jobId ORDER BY a.timeSent DESC"
    )
    org.springframework.data.domain.Page<ApplyFormSentToJob> findByJobId(
        @org.springframework.data.repository.query.Param("jobId") Long jobId,
        org.springframework.data.domain.Pageable pageable
    );

    /** Thống kê số đơn theo từng status cho 1 job — trả về [status, count] cho việc tính tỉ lệ. */
    @org.springframework.data.jpa.repository.Query(
        "SELECT a.status, COUNT(a) FROM ApplyFormSentToJob a " +
        "WHERE a.id.jobId = :jobId GROUP BY a.status"
    )
    java.util.List<Object[]> countByStatusForJob(
        @org.springframework.data.repository.query.Param("jobId") Long jobId
    );
}
