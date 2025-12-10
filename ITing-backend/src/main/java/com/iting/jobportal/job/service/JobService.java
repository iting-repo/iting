package com.iting.jobportal.job.service;

import com.iting.jobportal.job.dto.*;
import com.iting.jobportal.job.entity.Job;
import org.springframework.data.domain.Page;

import java.util.List;

public interface JobService {
    
    // Tạo job mới (Employer)
    JobResponse createJob(Long employerId, CreateJobRequest request);
    
    // Cập nhật job (Employer)
    JobResponse updateJob(Long employerId, Long jobId, UpdateJobRequest request);
    
    // Xóa job (Employer)
    void deleteJob(Long employerId, Long jobId);
    
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
    Page<JobResponse> searchJobs(JobSearchRequest request);
    
    // Lấy jobs mới nhất
    List<JobResponse> getLatestJobs(int limit);
    
    // Lấy jobs hot (nhiều view/application)
    List<JobResponse> getHotJobs(int limit);
    
    // Cập nhật jobs hết hạn
    void updateExpiredJobs();
}
