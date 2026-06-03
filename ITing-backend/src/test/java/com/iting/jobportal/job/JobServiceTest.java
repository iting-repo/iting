package com.iting.jobportal.job;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import com.iting.jobportal.admin.service.AdminNotificationService;
import com.iting.jobportal.common.service.GeminiService;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.DocumentReviewStatus;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.service.AuthorizationService;
import com.iting.jobportal.job.dto.request.CreateJobRequest;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.service.impl.JobServiceImpl;
import com.iting.jobportal.payment.service.QuotaService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

class JobServiceTest {

  private JobRepository jobRepository;
  private CompanyRepository companyRepository;
  private AuthorizationService authz;
  private QuotaService quotaService;
  private EntityManager entityManager;
  private Query query;
  private GeminiService geminiService;
  private AdminNotificationService adminNotificationService;
  private JobServiceImpl jobService;

  @BeforeEach
  void setUp() {
    jobRepository = mock(JobRepository.class);
    companyRepository = mock(CompanyRepository.class);
    authz = mock(AuthorizationService.class);
    quotaService = mock(QuotaService.class);
    entityManager = mock(EntityManager.class);
    query = mock(Query.class);
    geminiService = mock(GeminiService.class);
    adminNotificationService = mock(AdminNotificationService.class);

    jobService =
        new JobServiceImpl(
            jobRepository,
            companyRepository,
            authz,
            quotaService,
            mock(com.iting.jobportal.file.FileUploadService.class),
            mock(org.springframework.context.ApplicationEventPublisher.class),
            geminiService,
            mock(com.iting.jobportal.common.service.KnowledgeGraphService.class),
            mock(com.iting.jobportal.job.service.VectorSearchService.class),
            mock(com.iting.jobportal.common.service.MlServiceClient.class),
            mock(com.iting.jobportal.notification.service.NotificationService.class),
            adminNotificationService,
            Optional.empty(),
            mock(com.iting.jobportal.common.event.KafkaTopics.class),
            mock(
                com.iting.jobportal.userprofile.service.embedding.HuggingFaceCvExtractionClient
                    .class),
            mock(com.iting.jobportal.recommendation.service.RecommendationService.class));

    // entityManager is injected via @PersistenceContext, not constructor, so wire it manually.
    ReflectionTestUtils.setField(jobService, "entityManager", entityManager);

    testCompany = new Company();
    testCompany.setId(employerId);
    testCompany.setName("Test Company");
    testCompany.setCompanyReviewStatus(CompanyReviewStatus.APPROVED);
    testCompany.setDocumentReviewStatus(DocumentReviewStatus.APPROVED);
    testCompany.setActive(true);

    testJob =
        Job.builder()
            .id(1L)
            .company(testCompany)
            .position("Developer")
            .status(JobStatus.PENDING)
            .build();
  }

  private Company testCompany;
  private Job testJob;
  private Long employerId = 1L;

  @Test
  void createJob_shouldReturnJobResponse() {
    CreateJobRequest request = new CreateJobRequest();
    request.setTitle("Test Job");
    request.setPosition("Developer");
    request.setDescription("Job description");
    request.setProvince("TP HCM");
    request.setAddress("123 Street");
    request.setDueDate(java.time.LocalDate.now().plusDays(30));
    request.setMaxAccept(10);
    request.setMinSalary(new java.math.BigDecimal("1000"));
    request.setMaxSalary(new java.math.BigDecimal("2000"));
    request.setSalaryType(com.iting.jobportal.job.entity.enums.SalaryType.MONTH);
    request.setJobType(com.iting.jobportal.job.entity.enums.JobType.FULL_TIME);
    request.setExperienceLevel(com.iting.jobportal.job.entity.enums.ExperienceLevel.JUNIOR);

    when(authz.requireApprovedCompanyOf(employerId)).thenReturn(testCompany.getId());
    when(companyRepository.findById(testCompany.getId())).thenReturn(Optional.of(testCompany));
    when(jobRepository.save(any(Job.class))).thenReturn(testJob);
    when(entityManager.createNativeQuery(anyString())).thenReturn(query);
    when(query.setParameter(anyString(), any())).thenReturn(query);
    when(geminiService.reviewJob(any(Job.class))).thenReturn("FINAL_DECISION: [APPROVE]");

    JobResponse response = jobService.createJob(employerId, request);

    assertNotNull(response);
    assertEquals("Developer", response.getPosition());
    // Có thể save nhiều lần (lần đầu khi tạo + lần sau cập nhật AI review status).
    verify(jobRepository, atLeastOnce()).save(any());
    verify(query, times(1)).executeUpdate();
  }

  @Test
  void deleteJob_withOwnership_shouldWork() {
    when(jobRepository.findById(1L)).thenReturn(Optional.of(testJob));
    when(authz.requireApprovedCompanyOf(employerId)).thenReturn(testCompany.getId());

    assertDoesNotThrow(() -> jobService.deleteJob(employerId, 1L));
    verify(jobRepository, times(1)).delete(testJob);
  }

  @Test
  void deleteJob_withoutOwnership_shouldThrowForbidden() {
    when(jobRepository.findById(1L)).thenReturn(Optional.of(testJob));
    // HR khác (999L) thuộc company khác → checkOwnership reject
    when(authz.requireApprovedCompanyOf(999L)).thenReturn(2L);

    assertThrows(ResponseStatusException.class, () -> jobService.deleteJob(999L, 1L));
  }
}
