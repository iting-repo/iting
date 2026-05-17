package com.iting.jobportal.job;

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
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import org.springframework.test.util.ReflectionTestUtils;

class JobEnumCombinationTest {

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

    @InjectMocks
    private JobServiceImpl jobService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(jobService, "entityManager", entityManager);
        ReflectionTestUtils.setField(jobService, "outboxAppender", Optional.empty());
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
        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.APPROVED);
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
