package com.iting.jobportal.job;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.service.AdminNotificationService;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.service.AuthorizationService;
import com.iting.jobportal.job.dto.request.CreateJobRequest;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobType;
import com.iting.jobportal.job.entity.enums.SalaryType;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.service.impl.JobServiceImpl;
import com.iting.jobportal.payment.service.QuotaService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.test.util.ReflectionTestUtils;

class JobEnumCombinationTest {

  private JobRepository jobRepository;
  private CompanyRepository companyRepository;
  private AuthorizationService authz;
  private QuotaService quotaService;
  private EntityManager entityManager;
  private Query query;
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
    adminNotificationService = mock(AdminNotificationService.class);

    jobService =
        new JobServiceImpl(
            jobRepository,
            companyRepository,
            authz,
            quotaService,
            mock(com.iting.jobportal.file.FileUploadService.class),
            mock(org.springframework.context.ApplicationEventPublisher.class),
            mock(com.iting.jobportal.common.service.GeminiService.class),
            mock(com.iting.jobportal.common.service.KnowledgeGraphService.class),
            mock(com.iting.jobportal.job.service.VectorSearchService.class),
            mock(com.iting.jobportal.common.service.MlServiceClient.class),
            mock(com.iting.jobportal.notification.service.NotificationService.class),
            adminNotificationService,
            Optional.empty(),
            mock(com.iting.jobportal.common.event.KafkaTopics.class),
            mock(com.iting.jobportal.userprofile.service.embedding.HuggingFaceCvExtractionClient.class),
            mock(com.iting.jobportal.recommendation.service.RecommendationService.class));

    ReflectionTestUtils.setField(jobService, "entityManager", entityManager);
  }

  static Stream<Arguments> provideEnumCombinations() {
    List<Arguments> combinations = new ArrayList<>();
    for (JobType type : JobType.values()) {
      for (ExperienceLevel level : ExperienceLevel.values()) {
        for (SalaryType salary : SalaryType.values()) {
          combinations.add(Arguments.of(type, level, salary));
        }
      }
    }
    return combinations.stream();
  }

  @ParameterizedTest
  @MethodSource("provideEnumCombinations")
  void testEveryEnumCombination(JobType type, ExperienceLevel level, SalaryType salaryType) {
    Long employerId = 1L;
    Company company = new Company();
    company.setId(employerId);
    company.setCompanyReviewStatus(CompanyReviewStatus.APPROVED);
    company.setActive(true);

    CreateJobRequest request = new CreateJobRequest();
    request.setTitle("Test Job");
    request.setPosition("Developer");
    request.setJobType(type);
    request.setExperienceLevel(level);
    request.setSalaryType(salaryType);
    request.setMinSalary(new BigDecimal("1000"));
    request.setMaxSalary(new BigDecimal("2000"));
    request.setProvince("TP HCM");
    request.setAddress("123 Street");
    request.setDueDate(LocalDate.now().plusDays(30));
    request.setMaxAccept(10);
    request.setDescription("Description ok");

    when(authz.requireApprovedCompanyOf(employerId)).thenReturn(company.getId());
    when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
    when(jobRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    when(entityManager.createNativeQuery(anyString())).thenReturn(query);
    when(query.setParameter(anyString(), any())).thenReturn(query);

    JobResponse response = jobService.createJob(employerId, request);

    assertNotNull(response);
    assertNotNull(response.getJobType());
    assertNotNull(response.getExperienceLevel());
    assertNotNull(response.getSalaryType());
  }
}
