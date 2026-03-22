package com.iting.jobportal.application;

import com.iting.jobportal.application.dto.ApplyJobRequest;
import com.iting.jobportal.application.dto.ApplicationResponse;
import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.repository.ApplyFormRepository;
import com.iting.jobportal.application.repository.ApplyFormSentToJobRepository;
import com.iting.jobportal.application.service.impl.ApplicationServiceImpl;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplyFormRepository applyFormRepository;

    @Mock
    private ApplyFormSentToJobRepository applyFormSentToJobRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ApplicationServiceImpl applicationService;

    private Long userId = 1L;
    private Long jobId = 1L;
    private User testUser;
    private Job testJob;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(userId);
        testUser.setFullName("Test Applicant");

        testJob = Job.builder().id(jobId).build();
    }

    @Test
    void applyJob_shouldReturnResponse() {
        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(jobId);
        request.setCoverLetter("Hello");

        when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));
        when(applyFormSentToJobRepository.existsByUserIdAndJobId(userId, jobId)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        
        ApplyForm savedForm = ApplyForm.builder().id(1L).applicantName("Test Applicant").build();
        when(applyFormRepository.save(any(ApplyForm.class))).thenReturn(savedForm);
        
        ApplyFormSentToJob sent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(jobId, 1L))
                .build();
        when(applyFormSentToJobRepository.save(any(ApplyFormSentToJob.class))).thenReturn(sent);

        ApplicationResponse response = applicationService.applyJob(userId, request);

        assertNotNull(response);
        assertEquals("Test Applicant", response.getApplicantName());
        verify(applyFormRepository, times(1)).save(any());
    }

    @Test
    void applyJob_duplicate_shouldThrowConflict() {
        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(jobId);

        when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));
        when(applyFormSentToJobRepository.existsByUserIdAndJobId(userId, jobId)).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> applicationService.applyJob(userId, request));
    }
}
