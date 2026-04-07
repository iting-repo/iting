package com.iting.jobportal.admin.service;

import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.entity.enums.JobStatus;
import org.springframework.data.domain.Page;

public interface AdminJobService {

    Page<JobResponse> getAllJobs(int page, int size);

    Page<JobResponse> filterJobs(
            JobStatus status,
            Long companyId,
            String keyword,
            String location,
            int page,
            int size
    );

    JobResponse getJobById(Long jobId);
    
    void deleteJob(Long jobId);

    void approveJob(Long adminId, Long jobId);

    void rejectJob(Long adminId, Long jobId, String reason);

    void featureJob(Long jobId);

    void unfeatureJob(Long jobId);

    void suspendJob(Long jobId, String reason);

    void suspendJob(Long adminId, Long jobId, String reason);

    void unsuspendJob(Long adminId, Long jobId);

    void closeJobByAdmin(Long adminId, Long jobId);

    void bulkApproveJobs(Long adminId, java.util.List<Long> jobIds);

    void bulkRejectJobs(Long adminId, java.util.List<Long> jobIds, String reason);

    void bulkSuspendJobs(Long adminId, java.util.List<Long> jobIds, String reason);

    void bulkCloseJobs(Long adminId, java.util.List<Long> jobIds);

    void bulkDeleteJobs(java.util.List<Long> jobIds);

    java.io.ByteArrayInputStream exportJobsToExcel();

    void importJobsFromExcel(org.springframework.web.multipart.MultipartFile file);

    java.io.ByteArrayInputStream getImportTemplate();
}