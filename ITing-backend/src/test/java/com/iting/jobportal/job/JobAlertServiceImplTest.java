package com.iting.jobportal.job;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.UserFollowCompany;
import com.iting.jobportal.company.repository.UserFollowCompanyRepository;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.repository.UserSaveJobRepository;
import com.iting.jobportal.job.service.impl.JobAlertServiceImpl;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class JobAlertServiceImplTest {

  @Mock private UserFollowCompanyRepository userFollowCompanyRepository;
  @Mock private JobRepository jobRepository;
  @Mock private UserSaveJobRepository userSaveJobRepository;
  @InjectMocks private JobAlertServiceImpl service;

  // ── getJobsFromFollowedCompanies ──────────────────────────────

  @Test
  void getJobsFromFollowedCompanies_whenNoFollows_returnsEmpty() {
    when(userFollowCompanyRepository.findByUserId(eq(1L), any(Pageable.class)))
        .thenReturn(Page.empty());

    Page<?> result = service.getJobsFromFollowedCompanies(1L, PageRequest.of(0, 10));

    assertTrue(result.isEmpty());
    verifyNoInteractions(jobRepository);
  }

  @Test
  void getJobsFromFollowedCompanies_withOneFollowAndActiveJob_returnsJob() {
    UserFollowCompany follow = UserFollowCompany.builder().userId(1L).companyId(10L).build();

    Company company = new Company();
    company.setId(10L);
    company.setName("TechCorp");

    Job job = new Job();
    job.setId(100L);
    job.setTitle("Backend Dev");
    job.setStatus(JobStatus.ACTIVE);
    job.setCompany(company);

    when(userFollowCompanyRepository.findByUserId(eq(1L), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(follow)));
    when(jobRepository.findByCompany_IdAndStatus(
            eq(10L), eq(JobStatus.ACTIVE), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(job)));
    when(userSaveJobRepository.existsByUserIdAndJobId(eq(1L), eq(100L))).thenReturn(false);

    Page<?> result = service.getJobsFromFollowedCompanies(1L, PageRequest.of(0, 10));

    assertEquals(1, result.getTotalElements());
  }

  @Test
  void getJobsFromFollowedCompanies_jobIsSaved_flagSetCorrectly() {
    UserFollowCompany follow = UserFollowCompany.builder().userId(1L).companyId(10L).build();

    Company company = new Company();
    company.setId(10L);

    Job job = new Job();
    job.setId(100L);
    job.setStatus(JobStatus.ACTIVE);
    job.setCompany(company);

    when(userFollowCompanyRepository.findByUserId(eq(1L), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(follow)));
    when(jobRepository.findByCompany_IdAndStatus(
            eq(10L), eq(JobStatus.ACTIVE), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(job)));
    when(userSaveJobRepository.existsByUserIdAndJobId(eq(1L), eq(100L))).thenReturn(true);

    Page<?> result = service.getJobsFromFollowedCompanies(1L, PageRequest.of(0, 10));

    assertEquals(1, result.getTotalElements());
    verify(userSaveJobRepository).existsByUserIdAndJobId(1L, 100L);
  }

  @Test
  void getJobsFromFollowedCompanies_whenNoActiveJobs_returnsEmpty() {
    UserFollowCompany follow = UserFollowCompany.builder().userId(1L).companyId(10L).build();

    when(userFollowCompanyRepository.findByUserId(eq(1L), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(follow)));
    when(jobRepository.findByCompany_IdAndStatus(
            eq(10L), eq(JobStatus.ACTIVE), any(Pageable.class)))
        .thenReturn(Page.empty());

    Page<?> result = service.getJobsFromFollowedCompanies(1L, PageRequest.of(0, 10));

    assertTrue(result.isEmpty());
  }

  @Test
  void getJobsFromFollowedCompanies_aggregatesJobsFromMultipleCompanies() {
    UserFollowCompany follow1 = UserFollowCompany.builder().userId(1L).companyId(10L).build();
    UserFollowCompany follow2 = UserFollowCompany.builder().userId(1L).companyId(20L).build();

    Company c1 = new Company();
    c1.setId(10L);
    Company c2 = new Company();
    c2.setId(20L);

    Job job1 = new Job();
    job1.setId(100L);
    job1.setStatus(JobStatus.ACTIVE);
    job1.setCompany(c1);
    Job job2 = new Job();
    job2.setId(200L);
    job2.setStatus(JobStatus.ACTIVE);
    job2.setCompany(c2);

    when(userFollowCompanyRepository.findByUserId(eq(1L), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(follow1, follow2)));
    when(jobRepository.findByCompany_IdAndStatus(
            eq(10L), eq(JobStatus.ACTIVE), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(job1)));
    when(jobRepository.findByCompany_IdAndStatus(
            eq(20L), eq(JobStatus.ACTIVE), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(job2)));
    when(userSaveJobRepository.existsByUserIdAndJobId(eq(1L), anyLong())).thenReturn(false);

    Page<?> result = service.getJobsFromFollowedCompanies(1L, PageRequest.of(0, 10));

    assertEquals(2, result.getTotalElements());
  }
}
