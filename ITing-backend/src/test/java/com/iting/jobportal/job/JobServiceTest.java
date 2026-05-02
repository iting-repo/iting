package com.iting.jobportal.job;

import com.iting.jobportal.common.service.GeminiService;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.repository.CompanyRepository;
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
import org.springframework.web.server.ResponseStatusException;

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
    void setUp() {
        testCompany = new Company();
        testCompany.setId(employerId);
        testCompany.setName("Test Company");
        testCompany.setCompanyInfoUpdateStatus(CompanyReviewStatus.APPROVED);
        testCompany.setActive(true);

        testJob = Job.builder()
                .id(1L)
                .company(testCompany)
                .position("Developer")
                .status(JobStatus.PENDING)
                .build();
    }

    @Test
    void createJob_shouldReturnJobResponse() {
        CreateJobRequest request = new CreateJobRequest();
        request.setPosition("Developer");
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
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(geminiService.reviewJob(any(Job.class))).thenReturn("FINAL_DECISION: [APPROVE]");

        JobResponse response = jobService.createJob(employerId, request);

        assertNotNull(response);
        assertEquals("Developer", response.getPosition());
        verify(jobRepository, times(2)).save(any());
        verify(query, times(1)).executeUpdate();
    }

    @Test
    void deleteJob_withOwnership_shouldWork() {
        when(jobRepository.findById(1L)).thenReturn(Optional.of(testJob));

        assertDoesNotThrow(() -> jobService.deleteJob(employerId, 1L));
        verify(jobRepository, times(1)).delete(testJob);
    }

    @Test
    void deleteJob_withoutOwnership_shouldThrowForbidden() {
        when(jobRepository.findById(1L)).thenReturn(Optional.of(testJob));

        assertThrows(ResponseStatusException.class, () -> jobService.deleteJob(999L, 1L));
    }
}
