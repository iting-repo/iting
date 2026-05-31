package com.iting.jobportal.application.service;

import com.iting.jobportal.application.dto.request.ApplicationSearchRequest;
import com.iting.jobportal.application.dto.request.ApplicationStats;
import com.iting.jobportal.application.dto.request.CreateManualApplicationRequest;
import com.iting.jobportal.application.dto.request.UpdateApplicationStatusRequest;
import com.iting.jobportal.application.dto.response.ApplicationResponse;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface EmployerApplicationService {
  Page<ApplicationResponse> getApplicationsByJob(Long employerId, Long jobId, int page, int size);

  Page<ApplicationResponse> getAllApplicationsForEmployer(Long employerId, int page, int size);

  Page<ApplicationResponse> searchApplications(Long employerId, ApplicationSearchRequest request);

  ApplicationResponse viewApplication(Long employerId, Long applicationId);

  ApplicationResponse markApplicationAsViewed(Long employerId, Long applicationId);

  ApplicationResponse updateApplicationStatus(
      Long employerId, Long applicationId, UpdateApplicationStatusRequest request);

  ApplicationResponse acceptApplication(Long employerId, Long applicationId, String note);

  ApplicationResponse rejectApplication(Long employerId, Long applicationId, String note);

  long countApplicationsByStatus(Long employerId, Long jobId, String status);

  ApplicationStats getStatsForEmployer(Long employerId);

  ApplicationStats getStatsForJob(Long jobId);

  // New Feature: Search candidates by text/cv parsing
  List<ApplicationResponse> searchCandidatesByCvKeyword(Long employerId, String keyword);

  List<ApplicationResponse> searchCandidatesByCvFile(Long employerId, MultipartFile cvFile);

  /** Lấy danh sách ứng viên đã apply cho 1 job, xếp hạng theo AI match score giảm dần. */
  Page<ApplicationResponse> getApplicationsRankedByMatch(
      Long employerId, Long jobId, int page, int size);

  /**
   * HR tạo application thủ công (offline submission). Tạo:
   *   - ApplyForm với userId=null (manual entry) + candidateName/email lưu vào field tạm
   *   - ApplyFormSentToJob với status=PENDING
   * Auth: chỉ HR sở hữu job mới tạo được. Trả về ApplicationResponse.
   */
  ApplicationResponse createManualApplication(Long employerId, CreateManualApplicationRequest request);

  /**
   * HR xóa application (vd: spam, duplicate, candidate yêu cầu rút). Hard delete.
   * Auth: chỉ HR sở hữu job mới xóa được.
   */
  void deleteApplication(Long employerId, Long applicationId);
}
