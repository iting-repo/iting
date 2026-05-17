package com.iting.jobportal.application;

import com.iting.jobportal.application.dto.request.ApplyJobRequest;
import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.dto.response.ApplicationSubmitResponse;
import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.repository.ApplyFormRepository;
import com.iting.jobportal.application.repository.CandidateApplicationRepository;
import com.iting.jobportal.application.service.impl.CandidateApplicationServiceImpl;
import com.iting.jobportal.application.util.ApplicationMapperUtil;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.userprofile.entity.CV;
import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.repository.CVRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidateApplicationServiceImplTest {

    @Mock private CandidateApplicationRepository candidateApplicationRepository;
    @Mock private ApplyFormRepository applyFormRepository;
    @Mock private JobRepository jobRepository;
    @Mock private UserRepository userRepository;
    @Mock private ApplicationMapperUtil applicationMapperUtil;
    @Mock private CVRepository cvRepository;

    @InjectMocks
    private CandidateApplicationServiceImpl service;

    @BeforeEach
    void setUp() {
        // Optional<OutboxAppender> is left null by @InjectMocks; default to empty.
        ReflectionTestUtils.setField(service, "outboxAppender", Optional.empty());
    }

    @Test
    void applyJob_withoutCv_shouldCreateApplyFormAndJoinRecord() {
        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(5L);
        request.setCoverLetter("Hello");

        Job job = new Job();
        job.setId(5L);

        User user = new User();
        user.setId(1L);
        user.setFullName("Candidate");

        ApplyForm savedForm = ApplyForm.builder()
                .id(11L)
                .userId(1L)
                .applicantName("Candidate")
                .introduction("Hello")
                .build();

        ApplyFormSentToJob savedSent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(5L, 11L))
                .timeSent(LocalDateTime.of(2026, 4, 3, 10, 0))
                .build();

        ArgumentCaptor<ApplyForm> formCaptor = ArgumentCaptor.forClass(ApplyForm.class);
        ArgumentCaptor<ApplyFormSentToJob> sentCaptor = ArgumentCaptor.forClass(ApplyFormSentToJob.class);

        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(candidateApplicationRepository.existsByUserIdAndJobId(1L, 5L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(applyFormRepository.save(any(ApplyForm.class))).thenReturn(savedForm);
        when(candidateApplicationRepository.save(any(ApplyFormSentToJob.class))).thenReturn(savedSent);

        ApplicationSubmitResponse result = service.applyJob(1L, request);

        assertEquals(11L, result.getId());
        assertEquals(5L, result.getJobId());
        assertEquals(savedSent.getTimeSent(), result.getTimeSent());

        verify(applyFormRepository).save(formCaptor.capture());
        assertEquals(1L, formCaptor.getValue().getUserId());
        assertEquals("Candidate", formCaptor.getValue().getApplicantName());
        assertEquals("Hello", formCaptor.getValue().getIntroduction());
        assertNull(formCaptor.getValue().getCv());
        assertNull(formCaptor.getValue().getCvTitle());

        verify(candidateApplicationRepository).save(sentCaptor.capture());
        assertEquals(5L, sentCaptor.getValue().getId().getJobId());
        assertEquals(11L, sentCaptor.getValue().getId().getApplyFormId());

        verifyNoInteractions(applicationMapperUtil);
    }

    @Test
    void applyJob_withValidCv_shouldAttachCvAndCvTitle() {
        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(5L);
        request.setCvId(3L);
        request.setCoverLetter("Hi");

        Job job = new Job();
        job.setId(5L);

        User user = new User();
        user.setId(1L);
        user.setFullName("Candidate");

        UserProfile profile = new UserProfile();
        profile.setId(1L);

        CV cv = new CV();
        cv.setId(3L);
        cv.setTitle("Backend CV");
        cv.setProfile(profile);

        ApplyForm savedForm = ApplyForm.builder().id(11L).build();
        ApplyFormSentToJob savedSent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(5L, 11L))
                .timeSent(LocalDateTime.of(2026, 4, 3, 10, 0))
                .build();

        ArgumentCaptor<ApplyForm> formCaptor = ArgumentCaptor.forClass(ApplyForm.class);

        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(candidateApplicationRepository.existsByUserIdAndJobId(1L, 5L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cvRepository.findById(3L)).thenReturn(Optional.of(cv));
        when(applyFormRepository.save(any(ApplyForm.class))).thenReturn(savedForm);
        when(candidateApplicationRepository.save(any(ApplyFormSentToJob.class))).thenReturn(savedSent);

        ApplicationSubmitResponse result = service.applyJob(1L, request);

        assertEquals(11L, result.getId());
        assertEquals(5L, result.getJobId());

        verify(applyFormRepository).save(formCaptor.capture());
        assertSame(cv, formCaptor.getValue().getCv());
        assertEquals("Backend CV", formCaptor.getValue().getCvTitle());
    }

    @Test
    void applyJob_whenJobNotFound_shouldThrowNotFound() {
        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(5L);

        when(jobRepository.findById(5L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.applyJob(1L, request));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertEquals("404 NOT_FOUND \"Không tìm thấy job\"", ex.getMessage());

        verify(candidateApplicationRepository, never()).existsByUserIdAndJobId(any(), any());
        verify(userRepository, never()).findById(any());
        verify(applyFormRepository, never()).save(any());
    }

    @Test
    void applyJob_whenAlreadyApplied_shouldThrowConflict() {
        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(5L);

        Job job = new Job();
        job.setId(5L);

        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(candidateApplicationRepository.existsByUserIdAndJobId(1L, 5L)).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.applyJob(1L, request));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertEquals("409 CONFLICT \"Bạn đã ứng tuyển rồi\"", ex.getMessage());

        verify(userRepository, never()).findById(any());
        verify(applyFormRepository, never()).save(any());
        verify(candidateApplicationRepository, never()).save(any(ApplyFormSentToJob.class));
    }

    @Test
    void applyJob_whenUserNotFound_shouldThrowNotFound() {
        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(5L);

        Job job = new Job();
        job.setId(5L);

        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(candidateApplicationRepository.existsByUserIdAndJobId(1L, 5L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.applyJob(1L, request));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertEquals("404 NOT_FOUND \"Không tìm thấy user\"", ex.getMessage());

        verify(applyFormRepository, never()).save(any());
        verify(candidateApplicationRepository, never()).save(any(ApplyFormSentToJob.class));
    }

    @Test
    void applyJob_whenCvProfileIdIsNull_shouldThrowNullPointerException() {
        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(5L);
        request.setCvId(3L);

        Job job = new Job();
        job.setId(5L);

        User user = new User();
        user.setId(1L);

        UserProfile profile = new UserProfile();
        profile.setId(null);

        CV cv = new CV();
        cv.setId(3L);
        cv.setProfile(profile);

        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(candidateApplicationRepository.existsByUserIdAndJobId(1L, 5L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cvRepository.findById(3L)).thenReturn(Optional.of(cv));

        assertThrows(NullPointerException.class, () -> service.applyJob(1L, request));

        verify(applyFormRepository, never()).save(any());
        verify(candidateApplicationRepository, never()).save(any(ApplyFormSentToJob.class));
    }

    @Test
    void applyJob_withForeignCv_shouldThrowForbidden() {
        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(5L);
        request.setCvId(3L);

        Job job = new Job();
        job.setId(5L);

        User user = new User();
        user.setId(1L);

        UserProfile profile = new UserProfile();
        profile.setId(99L);

        CV cv = new CV();
        cv.setId(3L);
        cv.setProfile(profile);

        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(candidateApplicationRepository.existsByUserIdAndJobId(1L, 5L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cvRepository.findById(3L)).thenReturn(Optional.of(cv));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.applyJob(1L, request));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertEquals("403 FORBIDDEN \"CV không thuộc về bạn\"", ex.getMessage());

        verify(applyFormRepository, never()).save(any());
        verify(candidateApplicationRepository, never()).save(any(ApplyFormSentToJob.class));
    }

    @Test
    void applyJob_whenApplyFormSaveFails_shouldNotCreateJoinRecord() {
        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(5L);

        Job job = new Job();
        job.setId(5L);

        User user = new User();
        user.setId(1L);
        user.setFullName("Candidate");

        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(candidateApplicationRepository.existsByUserIdAndJobId(1L, 5L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(applyFormRepository.save(any(ApplyForm.class))).thenThrow(new RuntimeException("save form failed"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.applyJob(1L, request));

        assertEquals("save form failed", ex.getMessage());
        verify(candidateApplicationRepository, never()).save(any(ApplyFormSentToJob.class));
    }

    @Test
    void applyJob_whenJoinSaveFails_shouldPropagateException() {
        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(5L);

        Job job = new Job();
        job.setId(5L);

        User user = new User();
        user.setId(1L);
        user.setFullName("Candidate");

        ApplyForm savedForm = ApplyForm.builder().id(11L).build();

        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(candidateApplicationRepository.existsByUserIdAndJobId(1L, 5L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(applyFormRepository.save(any(ApplyForm.class))).thenReturn(savedForm);
        when(candidateApplicationRepository.save(any(ApplyFormSentToJob.class)))
                .thenThrow(new RuntimeException("save join failed"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.applyJob(1L, request));

        assertEquals("save join failed", ex.getMessage());
    }

    @Test
    void withdrawApplication_shouldDeleteJoinThenDeleteForm_whenOwnerMatches() {
        ApplyForm form = ApplyForm.builder().id(10L).userId(1L).build();
        ApplyFormSentToJob sent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(5L, 10L))
                .build();

        when(applyFormRepository.findById(10L)).thenReturn(Optional.of(form));
        when(candidateApplicationRepository.findByIdApplyFormId(10L)).thenReturn(Optional.of(sent));

        service.withdrawApplication(1L, 10L);

        InOrder inOrder = inOrder(candidateApplicationRepository, applyFormRepository);
        inOrder.verify(candidateApplicationRepository).deleteByIdApplyFormId(10L);
        inOrder.verify(applyFormRepository).deleteById(10L);
    }

    @Test
    void withdrawApplication_whenApplicationNotFound_shouldThrow() {
        when(applyFormRepository.findById(10L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.withdrawApplication(1L, 10L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertEquals("404 NOT_FOUND \"Không tìm thấy đơn ứng tuyển\"", ex.getMessage());

        verify(candidateApplicationRepository, never()).deleteByIdApplyFormId(any());
        verify(applyFormRepository, never()).deleteById(any());
    }

    @Test
    void withdrawApplication_withoutOwnership_shouldThrowForbidden() {
        ApplyForm form = ApplyForm.builder().id(10L).userId(2L).build();
        when(applyFormRepository.findById(10L)).thenReturn(Optional.of(form));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.withdrawApplication(1L, 10L));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertEquals("403 FORBIDDEN \"Bạn không có quyền rút đơn này\"", ex.getMessage());

        verify(candidateApplicationRepository, never()).deleteByIdApplyFormId(any());
        verify(applyFormRepository, never()).deleteById(any());
    }

    @Test
    void withdrawApplication_whenDeleteJoinFails_shouldNotDeleteForm() {
        ApplyForm form = ApplyForm.builder().id(10L).userId(1L).build();
        ApplyFormSentToJob sent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(5L, 10L))
                .build();
        when(applyFormRepository.findById(10L)).thenReturn(Optional.of(form));
        when(candidateApplicationRepository.findByIdApplyFormId(10L)).thenReturn(Optional.of(sent));

        doThrow(new RuntimeException("delete join failed"))
                .when(candidateApplicationRepository).deleteByIdApplyFormId(10L);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.withdrawApplication(1L, 10L));

        assertEquals("delete join failed", ex.getMessage());
        verify(applyFormRepository, never()).deleteById(any());
    }

    @Test
    void getMyApplications_shouldUseCorrectPageableAndMapAllItems() {
        ApplyFormSentToJob sent1 = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(5L, 10L))
                .build();
        ApplyFormSentToJob sent2 = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(6L, 20L))
                .build();

        ApplyForm form1 = ApplyForm.builder().id(10L).build();
        ApplyForm form2 = ApplyForm.builder().id(20L).build();

        ApplicationResponse response1 = ApplicationResponse.builder().id(10L).build();
        ApplicationResponse response2 = ApplicationResponse.builder().id(20L).build();

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);

        when(candidateApplicationRepository.findByUserId(eq(1L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sent1, sent2)));
        when(applyFormRepository.findById(10L)).thenReturn(Optional.of(form1));
        when(applyFormRepository.findById(20L)).thenReturn(Optional.of(form2));
        when(applicationMapperUtil.buildFullResponse(form1, sent1)).thenReturn(response1);
        when(applicationMapperUtil.buildFullResponse(form2, sent2)).thenReturn(response2);

        Page<ApplicationResponse> result = service.getMyApplications(1L, 0, 10);

        assertEquals(2, result.getContent().size());
        assertSame(response1, result.getContent().get(0));
        assertSame(response2, result.getContent().get(1));

        verify(candidateApplicationRepository).findByUserId(eq(1L), pageableCaptor.capture());
        assertEquals(0, pageableCaptor.getValue().getPageNumber());
        assertEquals(10, pageableCaptor.getValue().getPageSize());
        assertEquals(Sort.by("timeSent").descending(), pageableCaptor.getValue().getSort());
    }

    @Test
    void getMyApplications_whenPageEmpty_shouldReturnEmptyPage() {
        when(candidateApplicationRepository.findByUserId(eq(1L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        Page<ApplicationResponse> result = service.getMyApplications(1L, 0, 10);

        assertTrue(result.isEmpty());
        verifyNoInteractions(applicationMapperUtil);
    }

    @Test
    void getMyApplications_whenApplyFormMissing_shouldThrow() {
        ApplyFormSentToJob sent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(5L, 10L))
                .build();

        when(candidateApplicationRepository.findByUserId(eq(1L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sent)));
        when(applyFormRepository.findById(10L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.getMyApplications(1L, 0, 10));

        assertEquals("ApplyForm not found", ex.getMessage());
        verify(applicationMapperUtil, never()).buildFullResponse(any(), any());
    }

    @Test
    void getMyApplications_whenSentIdIsNull_shouldThrowNullPointerException() {
        ApplyFormSentToJob sent = ApplyFormSentToJob.builder()
                .id(null)
                .build();

        when(candidateApplicationRepository.findByUserId(eq(1L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sent)));

        assertThrows(NullPointerException.class,
                () -> service.getMyApplications(1L, 0, 10));

        verifyNoInteractions(applicationMapperUtil);
    }

    @Test
    void hasApplied_shouldDelegateToRepository() {
        when(candidateApplicationRepository.existsByUserIdAndJobId(1L, 5L)).thenReturn(true);

        boolean result = service.hasApplied(1L, 5L);

        assertTrue(result);
        verify(candidateApplicationRepository).existsByUserIdAndJobId(1L, 5L);
    }

    @Test
    void getMyApplications_whenPageOrSizeInvalid_shouldThrowIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class,
                () -> service.getMyApplications(1L, -1, 10));

        assertThrows(IllegalArgumentException.class,
                () -> service.getMyApplications(1L, 0, 0));

        verifyNoInteractions(candidateApplicationRepository, applyFormRepository, applicationMapperUtil);
    }

    @Test
    void applyJob_whenRequestIsNull_shouldThrowNullPointerExceptionImmediately() {
        assertThrows(NullPointerException.class, () -> service.applyJob(1L, null));

        verifyNoInteractions(
                jobRepository,
                candidateApplicationRepository,
                userRepository,
                applyFormRepository,
                cvRepository,
                applicationMapperUtil
        );
    }

    @Test
    void applyJob_whenJobIdIsNull_shouldThrowNullPointerExceptionFromRepositoryLookup() {
        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(null);

        when(jobRepository.findById(null)).thenThrow(new NullPointerException("jobId is marked non-null but is null"));

        NullPointerException ex = assertThrows(NullPointerException.class,
                () -> service.applyJob(1L, request));

        assertEquals("jobId is marked non-null but is null", ex.getMessage());
        verify(jobRepository).findById(null);
        verify(candidateApplicationRepository, never()).existsByUserIdAndJobId(any(), any());
        verify(userRepository, never()).findById(any());
        verify(applyFormRepository, never()).save(any());
    }

    @Test
    void applyJob_whenCvProfileIsNull_shouldThrowNullPointerExceptionAndNotSave() {
        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(5L);
        request.setCvId(3L);

        Job job = new Job();
        job.setId(5L);

        User user = new User();
        user.setId(1L);
        user.setFullName("Candidate");

        CV cv = new CV();
        cv.setId(3L);
        cv.setProfile(null);

        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(candidateApplicationRepository.existsByUserIdAndJobId(1L, 5L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cvRepository.findById(3L)).thenReturn(Optional.of(cv));

        assertThrows(NullPointerException.class, () -> service.applyJob(1L, request));

        verify(applyFormRepository, never()).save(any());
        verify(candidateApplicationRepository, never()).save(any(ApplyFormSentToJob.class));
    }



    @Test
    void applyJob_whenSavedFormIdIsNull_shouldStillCreateJoinRecordWithNullApplyFormId() {
        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(5L);
        request.setCoverLetter("Hello");

        Job job = new Job();
        job.setId(5L);

        User user = new User();
        user.setId(1L);
        user.setFullName("Candidate");

        ApplyForm savedForm = ApplyForm.builder()
                .id(null)
                .userId(1L)
                .applicantName("Candidate")
                .build();

        ApplyFormSentToJob savedSent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(5L, null))
                .timeSent(null)
                .build();

        ArgumentCaptor<ApplyFormSentToJob> sentCaptor = ArgumentCaptor.forClass(ApplyFormSentToJob.class);

        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(candidateApplicationRepository.existsByUserIdAndJobId(1L, 5L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(applyFormRepository.save(any(ApplyForm.class))).thenReturn(savedForm);
        when(candidateApplicationRepository.save(any(ApplyFormSentToJob.class))).thenReturn(savedSent);

        ApplicationSubmitResponse result = service.applyJob(1L, request);

        assertNull(result.getId());
        assertEquals(5L, result.getJobId());
        assertNull(result.getTimeSent());

        verify(candidateApplicationRepository).save(sentCaptor.capture());
        assertEquals(5L, sentCaptor.getValue().getId().getJobId());
        assertNull(sentCaptor.getValue().getId().getApplyFormId());
    }

    @Test
    void applyJob_whenSavedSentTimeSentIsNull_shouldReturnResponseWithNullTimeSent() {
        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(5L);

        Job job = new Job();
        job.setId(5L);

        User user = new User();
        user.setId(1L);
        user.setFullName("Candidate");

        ApplyForm savedForm = ApplyForm.builder()
                .id(11L)
                .userId(1L)
                .build();

        ApplyFormSentToJob savedSent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(5L, 11L))
                .timeSent(null)
                .build();

        when(jobRepository.findById(5L)).thenReturn(Optional.of(job));
        when(candidateApplicationRepository.existsByUserIdAndJobId(1L, 5L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(applyFormRepository.save(any(ApplyForm.class))).thenReturn(savedForm);
        when(candidateApplicationRepository.save(any(ApplyFormSentToJob.class))).thenReturn(savedSent);

        ApplicationSubmitResponse result = service.applyJob(1L, request);

        assertEquals(11L, result.getId());
        assertEquals(5L, result.getJobId());
        assertNull(result.getTimeSent());
    }

    @Test
    void withdrawApplication_whenApplyFormUserIdIsNull_shouldThrowNullPointerException() {
        ApplyForm form = ApplyForm.builder()
                .id(10L)
                .userId(null)
                .build();

        when(applyFormRepository.findById(10L)).thenReturn(Optional.of(form));

        assertThrows(NullPointerException.class,
                () -> service.withdrawApplication(1L, 10L));

        verify(candidateApplicationRepository, never()).deleteByIdApplyFormId(any());
        verify(applyFormRepository, never()).deleteById(any());
    }

    @Test
    void withdrawApplication_whenApplicationIdIsNull_andRepositoryReturnsEmpty_shouldThrowNotFound() {
        when(applyFormRepository.findById(null)).thenReturn(Optional.empty());

        org.springframework.web.server.ResponseStatusException ex =
                assertThrows(org.springframework.web.server.ResponseStatusException.class,
                        () -> service.withdrawApplication(1L, null));

        assertEquals(org.springframework.http.HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(candidateApplicationRepository, never()).deleteByIdApplyFormId(any());
        verify(applyFormRepository, never()).deleteById(any());
    }

    @Test
    void getMyApplications_whenSentIdApplyFormIdIsNull_shouldPassNullToFindByIdThenThrowApplyFormNotFound() {
        ApplyFormSentToJob sent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(5L, null))
                .build();

        when(candidateApplicationRepository.findByUserId(eq(1L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sent)));
        when(applyFormRepository.findById(null)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.getMyApplications(1L, 0, 10));

        assertEquals("ApplyForm not found", ex.getMessage());
        verify(applyFormRepository).findById(null);
        verifyNoInteractions(applicationMapperUtil);
    }

    @Test
    void getMyApplications_whenMapperReturnsNull_shouldContainNullElementInPage() {
        ApplyFormSentToJob sent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(5L, 10L))
                .build();

        ApplyForm form = ApplyForm.builder()
                .id(10L)
                .build();

        when(candidateApplicationRepository.findByUserId(eq(1L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sent)));
        when(applyFormRepository.findById(10L)).thenReturn(Optional.of(form));
        when(applicationMapperUtil.buildFullResponse(form, sent)).thenReturn(null);

        org.springframework.data.domain.Page<ApplicationResponse> result =
                service.getMyApplications(1L, 0, 10);

        assertEquals(1, result.getContent().size());
        assertNull(result.getContent().get(0));
    }

    @Test
    void getMyApplications_whenRepositoryReturnsNullPage_shouldThrowNullPointerException() {
        when(candidateApplicationRepository.findByUserId(eq(1L), any(Pageable.class)))
                .thenReturn(null);

        assertThrows(NullPointerException.class,
                () -> service.getMyApplications(1L, 0, 10));

        verifyNoInteractions(applyFormRepository, applicationMapperUtil);
    }

    @Test
    void hasApplied_whenRepositoryThrows_shouldPropagateException() {
        when(candidateApplicationRepository.existsByUserIdAndJobId(1L, 5L))
                .thenThrow(new RuntimeException("db check failed"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.hasApplied(1L, 5L));

        assertEquals("db check failed", ex.getMessage());
    }
}
