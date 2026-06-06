package com.iting.jobportal.application.service.impl;

import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.repository.AdminApplicationRepository;
import com.iting.jobportal.application.repository.ApplyFormRepository;
import com.iting.jobportal.application.service.AdminApplicationService;
import com.iting.jobportal.application.util.ApplicationMapperUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminApplicationServiceImpl implements AdminApplicationService {

  private final AdminApplicationRepository adminApplicationRepository;
  private final ApplyFormRepository applyFormRepository;
  private final ApplicationMapperUtil applicationMapperUtil;

  @Override
  @Transactional(readOnly = true)
  public Page<ApplicationResponse> getAllSystemApplications(int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("timeSent").descending());
    return adminApplicationRepository
        .findAll(pageable)
        .map(
            sent -> {
              ApplyForm form =
                  applyFormRepository
                      .findById(sent.getId().getApplyFormId())
                      .orElseThrow(() -> new RuntimeException("ApplyForm not found"));
              return applicationMapperUtil.buildFullResponse(form, sent);
            });
  }

  @Override
  public void deleteApplication(Long applicationId) {
    adminApplicationRepository.deleteById(
        new com.iting.jobportal.application.entity.ApplyFormSentToJob.ApplyFormSentToJobId(
            0L, applicationId));
    applyFormRepository.deleteById(applicationId);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<ApplicationResponse> getApplicationsByJob(Long jobId, int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    return adminApplicationRepository
        .findByJobId(jobId, pageable)
        .map(
            sent -> {
              ApplyForm form =
                  applyFormRepository
                      .findById(sent.getId().getApplyFormId())
                      .orElseThrow(() -> new RuntimeException("ApplyForm not found"));
              return applicationMapperUtil.buildFullResponse(form, sent);
            });
  }

  @Override
  public com.iting.jobportal.application.dto.response.JobApplicationStatsResponse
      getApplicationStatsByJob(Long jobId) {
    java.util.List<Object[]> rows = adminApplicationRepository.countByStatusForJob(jobId);
    long pending = 0, viewed = 0, accepted = 0, rejected = 0, withdrawn = 0;

    for (Object[] r : rows) {
      com.iting.jobportal.application.entity.enums.ApplicationStatus status =
          (com.iting.jobportal.application.entity.enums.ApplicationStatus) r[0];
      long count = ((Number) r[1]).longValue();
      if (status == null) {
        pending += count;
        continue;
      }
      switch (status) {
        case PENDING:
          pending += count;
          break;
        case VIEWED:
          viewed += count;
          break;
        case ACCEPTED:
          accepted += count;
          break;
        case REJECTED:
          rejected += count;
          break;
        case WITHDRAWN:
          withdrawn += count;
          break;
        default:
          break;
      }
    }

    long total = pending + viewed + accepted + rejected + withdrawn;
    long employerResponded = total - pending;
    // Tỉ lệ thành công/từ chối tính trên các đơn đã có quyết định cuối cùng
    long decided = accepted + rejected;
    double successRate = decided == 0 ? 0.0 : Math.round((accepted * 10000.0) / decided) / 100.0;
    double rejectionRate = decided == 0 ? 0.0 : Math.round((rejected * 10000.0) / decided) / 100.0;
    double responseRate =
        total == 0 ? 0.0 : Math.round((employerResponded * 10000.0) / total) / 100.0;

    return com.iting.jobportal.application.dto.response.JobApplicationStatsResponse.builder()
        .total(total)
        .pending(pending)
        .viewed(viewed)
        .accepted(accepted)
        .rejected(rejected)
        .withdrawn(withdrawn)
        .employerResponded(employerResponded)
        .successRate(successRate)
        .rejectionRate(rejectionRate)
        .responseRate(responseRate)
        .build();
  }
}
