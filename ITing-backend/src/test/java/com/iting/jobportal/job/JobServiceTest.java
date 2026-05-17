package com.iting.jobportal.job;

import com.iting.jobportal.common.service.GeminiService;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
<<<<<<< HEAD
import com.iting.jobportal.company.entity.enums.DocumentReviewStatus;
=======
>>>>>>> origin/main
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.service.AuthorizationService;
import com.iting.jobportal.job.dto.request.CreateJobRequest;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.entity.enums.SalaryType;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.service.impl.JobServiceImpl;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private AuthorizationService authz;

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query query;

    @Mock
    private GeminiService geminiService;

    @InjectMocks
    private JobServiceImpl jobService;

    private Company testCompany;
    private Job testJob;
    private Long employerId = 1L;

    @BeforeEach
<<<<<<< HEAD
    void setUp() {
        // entityManager is injected via @PersistenceContext, not @Autowired,
        // so @InjectMocks can't reach it. Inject manually.
        ReflectionTestUtils.setField(jobService, "entityManager", entityManager);

=======
    void setUp() throws Exception {
>>>>>>> origin/main
        testCompany = new Company();
        testCompany.setId(employerId);
        testCompany.setName("Test Company");
        testCompany.setCompanyInfoUpdateStatus(CompanyReviewStatus.APPROVED);
<<<<<<< HEAD
        testCompany.setDocumentReviewStatus(DocumentReviewStatus.APPROVED);
=======
>>>>>>> origin/main
        testCompany.setActive(true);

        testJob = Job.builder()
                .id(1L)
                .company(testCompany)
                .position("Developer")
                .status(JobStatus.PENDING)
                .build();

        Field emField = JobServiceImpl.class.getDeclaredField("entityManager");
        emField.setAccessible(true);
        emField.set(jobService, entityManager);
    }

    @Test
    void createJob_shouldReturnJobResponse() {
        CreateJobRequest request = new CreateJobRequest();
        request.setTitle("Test Job");
        request.setPosition("Developer");
<<<<<<< HEAD
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
=======
        request.setTitle("Software Developer");
        request.setDescription("Develop software");
        request.setProvince("Hanoi");
        request.setAddress("123 Main St");
        request.setSalaryType(SalaryType.MONTH);
        request.setMinSalary(BigDecimal.valueOf(10_000_000));
        request.setMaxSalary(BigDecimal.valueOf(20_000_000));
        request.setDueDate(LocalDate.now().plusDays(30));
        request.setMaxAccept(5);

        when(companyRepository.findByAccount_Id(employerId)).thenReturn(Optional.of(testCompany));
>>>>>>> origin/main
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(geminiService.reviewJob(any(Job.class))).thenReturn("FINAL_DECISION: [APPROVE]");

        JobResponse response = jobService.createJob(employerId, request);

        assertNotNull(response);
        assertEquals("Developer", response.getPosition());
<<<<<<< HEAD
        // Có thể save nhiều lần (lần đầu khi tạo + lần sau cập nhật AI review status).
        verify(jobRepository, org.mockito.Mockito.atLeastOnce()).save(any());
=======
        verify(jobRepository, times(2)).save(any());
>>>>>>> origin/main
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
