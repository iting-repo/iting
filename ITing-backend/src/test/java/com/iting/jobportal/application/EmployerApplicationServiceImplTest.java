package com.iting.jobportal.application;

import com.iting.jobportal.application.dto.request.UpdateApplicationStatusRequest;
import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.entity.enums.ApplicationStatus;
import com.iting.jobportal.application.repository.ApplyFormRepository;
import com.iting.jobportal.application.repository.EmployerApplicationRepository;
import com.iting.jobportal.application.service.impl.EmployerApplicationServiceImpl;
import com.iting.jobportal.application.util.ApplicationMapperUtil;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployerApplicationServiceImplTest {

    @Mock private EmployerApplicationRepository employerApplicationRepository;
    @Mock private ApplyFormRepository applyFormRepository;
    @Mock private JobRepository jobRepository;
    @Mock private ApplicationMapperUtil applicationMapperUtil;

    @InjectMocks
    private EmployerApplicationServiceImpl service;

    @Test
    void getAllApplicationsForEmployer_withoutJobs_shouldReturnEmptyPage() {
        when(jobRepository.findByCompany_Id(1L, PageRequest.of(0, 1000))).thenReturn(Page.empty());

        Page<ApplicationResponse> result = service.getAllApplicationsForEmployer(1L, 0, 10);

        assertEquals(0, result.getTotalElements());
    }

    @Test
    void viewApplication_shouldMarkPendingApplicationAsViewed() {
        Company company = new Company();
        company.setId(1L);
        Job job = new Job();
        job.setId(5L);
        job.setCompany(company);
        ApplyFormSentToJob sent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(5L, 10L))
                .status(ApplicationStatus.PENDING)
                .build();
        ApplyForm form = ApplyForm.builder().id(10L).build();
        ApplicationResponse response = ApplicationResponse.builder().id(10L).status(ApplicationStatus.VIEWED).build();

        when(employerApplicationRepository.findByIdApplyFormId(10L)).thenReturn(Optional.of(sent));
        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(applyFormRepository.findById(10L)).thenReturn(Optional.of(form));
        when(applicationMapperUtil.buildFullResponse(form, sent)).thenReturn(response);

        ApplicationResponse result = service.viewApplication(1L, 10L);

        assertEquals(ApplicationStatus.VIEWED, sent.getStatus());
        assertSame(response, result);
        verify(employerApplicationRepository).save(sent);
    }

    @Test
    void updateApplicationStatus_shouldPersistRequestedStatus() {
        Company company = new Company();
        company.setId(1L);
        Job job = new Job();
        job.setId(5L);
        job.setCompany(company);
        ApplyFormSentToJob sent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(5L, 10L))
                .status(ApplicationStatus.PENDING)
                .build();
        ApplyForm form = ApplyForm.builder().id(10L).build();
        ApplicationResponse response = ApplicationResponse.builder().id(10L).status(ApplicationStatus.ACCEPTED).build();
        UpdateApplicationStatusRequest request = new UpdateApplicationStatusRequest();
        request.setStatus(ApplicationStatus.ACCEPTED);

        when(employerApplicationRepository.findByIdApplyFormId(10L)).thenReturn(Optional.of(sent));
        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(applyFormRepository.findById(10L)).thenReturn(Optional.of(form));
        when(applicationMapperUtil.buildFullResponse(form, sent)).thenReturn(response);

        ApplicationResponse result = service.updateApplicationStatus(1L, 10L, request);

        assertEquals(ApplicationStatus.ACCEPTED, sent.getStatus());
        assertSame(response, result);
    }

    @Test
    void getStatsForJob_shouldUseRepositoryCount() {
        when(employerApplicationRepository.countByIdJobId(5L)).thenReturn(4L);

        assertEquals(4L, service.getStatsForJob(5L).getTotal());
    }
}
