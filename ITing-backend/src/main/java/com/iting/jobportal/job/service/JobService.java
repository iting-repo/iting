package com.iting.jobportal.job.service;

import com.iting.jobportal.job.dto.request.CreateJobRequest;
import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.dto.request.UpdateJobRequest;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.dto.response.SalaryReportResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface JobService {

    // Tạo job mới (Employer)
    JobResponse createJob(Long employerId, CreateJobRequest request);

    // Cập nhật job (Employer)
    JobResponse updateJob(Long employerId, Long jobId, UpdateJobRequest request);

    // Xóa job (Employer)
    void deleteJob(Long employerId, Long jobId);

    // JobResponse approveJob(Long adminId, Long jobId);
    //
    // JobResponse rejectJob(Long adminId, Long jobId, String reason);
    //
    // JobResponse suspendJob(Long adminId, Long jobId, String reason);

    JobResponse reopenJob(Long employerId, Long jobId);

    // Gia hạn job (Employer)
    JobResponse extendJob(Long employerId, Long jobId, int days);

    // Đóng job (Employer)
    JobResponse closeJob(Long employerId, Long jobId);

    // Lấy chi tiết job
    JobResponse getJobById(Long jobId);

    // Lấy chi tiết job và tăng view count
    JobResponse getJobByIdWithView(Long jobId);

    // Lấy danh sách jobs của employer
    Page<JobResponse> getJobsByEmployer(Long employerId, int page, int size);

    // Tìm kiếm và lọc jobs (cho ứng viên)
    Page<JobResponse> searchJobs(JobSearchRequest request, Long userId);

    // Lấy jobs mới nhất
    List<JobResponse> getLatestJobs(int limit);

    // Lấy jobs hot (nhiều view/application)
    List<JobResponse> getHotJobs(int limit);

    // Cập nhật jobs hết hạn
    void updateExpiredJobs();

    // Gửi duyệt job
    JobResponse submitJobForReview(Long employerId, Long jobId);

    void bulkDeleteJobs(Long employerId, java.util.List<Long> jobIds);

    void bulkCloseJobs(Long employerId, java.util.List<Long> jobIds);

    JobSearchRequest analyzeCvForSearch(String cvText);

    /** Phân tích CV file (PDF/Image) qua HF /extract-cv → derive search criteria. */
    JobSearchRequest analyzeCvFileForSearch(MultipartFile file);

    SalaryReportResponse getSalaryReport(String keyword, String location, String experience);
}
