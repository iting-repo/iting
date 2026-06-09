package com.iting.jobportal.admin.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.iting.jobportal.admin.service.impl.AdminJobServiceImpl;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.repository.JobReviewHistoryRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AdminJobServiceImplTest {

  @Mock private JobRepository jobRepository;
  @Mock private CompanyRepository companyRepository;
  @Mock private JobReviewHistoryRepository jobReviewHistoryRepository;

  @InjectMocks private AdminJobServiceImpl service;

  @BeforeEach
  void setUp() {
    // Optional<DistributedLockService> is left null by @InjectMocks; default to empty.
    ReflectionTestUtils.setField(service, "lockService", Optional.empty());
  }

  @Test
  void approveJob_shouldActivatePendingJob_clearReason_setAuditAndSave() {
    Job job = Job.builder().id(1L).status(JobStatus.PENDING).reviewReason("old reason").build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

    service.approveJob(5L, 1L);

    assertEquals(JobStatus.ACTIVE, job.getStatus());
    assertNull(job.getReviewReason());
    assertEquals(5L, job.getReviewedBy());
    assertNotNull(job.getReviewedAt());
    verify(jobRepository).save(job);
  }

  @Test
  void approveJob_whenJobNotFound_shouldThrowAndNotSave() {
    when(jobRepository.findById(1L)).thenReturn(Optional.empty());

    RuntimeException ex = assertThrows(RuntimeException.class, () -> service.approveJob(5L, 1L));

    assertEquals("Job not found", ex.getMessage());
    verify(jobRepository, never()).save(any());
  }

  @Test
  void approveJob_whenStatusIsNotPending_shouldThrowAndNotSave() {
    Job job = Job.builder().id(1L).status(JobStatus.ACTIVE).build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> service.approveJob(5L, 1L));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertTrue(ex.getReason().contains("ACTIVE"));
    verify(jobRepository, never()).save(any());
  }

  @Test
  void approveJob_whenDueDateExpired_shouldThrowAndNotMutateOrSave() {
    Job job =
        Job.builder()
            .id(1L)
            .status(JobStatus.PENDING)
            .reviewReason("old reason")
            .dueDate(LocalDate.now().minusDays(1))
            .build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> service.approveJob(5L, 1L));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    // Tin vẫn giữ nguyên PENDING (không tự đổi sang EXPIRED) để còn có thể từ chối / sửa hạn.
    assertEquals(JobStatus.PENDING, job.getStatus());
    assertEquals("old reason", job.getReviewReason());
    verify(jobRepository, never()).save(any());
  }

  @Test
  void approveJob_whenDueDateInFuture_shouldActivate() {
    Job job =
        Job.builder()
            .id(1L)
            .status(JobStatus.PENDING)
            .dueDate(LocalDate.now().plusDays(30))
            .build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

    service.approveJob(5L, 1L);

    assertEquals(JobStatus.ACTIVE, job.getStatus());
    verify(jobRepository).save(job);
  }

  @Test
  void rejectJob_shouldRejectPendingJob_trimReason_setAuditAndSave() {
    Job job = Job.builder().id(1L).status(JobStatus.PENDING).build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

    service.rejectJob(5L, 1L, "  not qualified  ");

    assertEquals(JobStatus.REJECTED, job.getStatus());
    assertEquals("not qualified", job.getReviewReason());
    assertEquals(5L, job.getReviewedBy());
    assertNotNull(job.getReviewedAt());
    verify(jobRepository).save(job);
  }

  @Test
  void rejectJob_withoutReason_shouldThrowAndNotSave() {
    Job job = Job.builder().id(1L).status(JobStatus.PENDING).build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

    IllegalArgumentException ex =
        assertThrows(IllegalArgumentException.class, () -> service.rejectJob(5L, 1L, " "));

    assertEquals("Lý do không được để trống", ex.getMessage());
    verify(jobRepository, never()).save(any());
  }

  @Test
  void rejectJob_whenStatusIsNotPending_shouldThrowAndNotSave() {
    Job job = Job.builder().id(1L).status(JobStatus.ACTIVE).build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> service.rejectJob(5L, 1L, "invalid content"));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertTrue(ex.getReason().contains("ACTIVE"));
    verify(jobRepository, never()).save(any());
  }

  @Test
  void featureJob_shouldSetFeaturedTrueAndSave() {
    Job job = Job.builder().id(1L).featured(false).build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

    service.featureJob(1L);

    assertTrue(job.getFeatured());
    verify(jobRepository).save(job);
  }

  @Test
  void unfeatureJob_shouldSetFeaturedFalseAndSave() {
    Job job = Job.builder().id(1L).featured(true).build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

    service.unfeatureJob(1L);

    assertFalse(job.getFeatured());
    verify(jobRepository).save(job);
  }

  @Test
  void suspendJob_withAdmin_shouldSuspendActiveJob_setReason_setAuditAndSave() {
    Job job = Job.builder().id(1L).status(JobStatus.ACTIVE).build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

    service.suspendJob(9L, 1L, "policy violation");

    assertEquals(JobStatus.SUSPENDED, job.getStatus());
    assertEquals("policy violation", job.getReviewReason());
    assertEquals(9L, job.getReviewedBy());
    assertNotNull(job.getReviewedAt());
    verify(jobRepository).save(job);
  }

  @Test
  void suspendJob_withAdmin_whenStatusIsNotActive_shouldThrowAndNotSave() {
    Job job = Job.builder().id(1L).status(JobStatus.PENDING).build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> service.suspendJob(9L, 1L, "policy violation"));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertTrue(ex.getReason().contains("PENDING"));
    verify(jobRepository, never()).save(any());
  }

  @Test
  void suspendJob_withoutAdmin_shouldSuspendWithoutStatusValidationOrAudit() {
    Job job = Job.builder().id(1L).status(JobStatus.PENDING).build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

    service.suspendJob(1L, "manual suspend");

    assertEquals(JobStatus.SUSPENDED, job.getStatus());
    assertEquals("manual suspend", job.getReviewReason());
    assertNull(job.getReviewedBy());
    assertNull(job.getReviewedAt());
    verify(jobRepository).save(job);
  }

  @Test
  void unsuspendJob_shouldRestoreActiveStatus_setAuditAndSave() {
    Job job = Job.builder().id(1L).status(JobStatus.SUSPENDED).reviewReason("policy").build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

    service.unsuspendJob(5L, 1L);

    assertEquals(JobStatus.ACTIVE, job.getStatus());
    assertEquals(5L, job.getReviewedBy());
    assertNotNull(job.getReviewedAt());
    verify(jobRepository).save(job);
  }

  @Test
  void unsuspendJob_whenStatusIsNotSuspended_shouldThrowAndNotSave() {
    Job job = Job.builder().id(1L).status(JobStatus.ACTIVE).build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> service.unsuspendJob(5L, 1L));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertTrue(ex.getReason().contains("ACTIVE"));
    verify(jobRepository, never()).save(any());
  }

  @Test
  void closeJobByAdmin_shouldCloseActiveJob_setAuditAndSave() {
    Job job = Job.builder().id(1L).status(JobStatus.ACTIVE).build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

    service.closeJobByAdmin(7L, 1L);

    assertEquals(JobStatus.CLOSED, job.getStatus());
    assertEquals(7L, job.getReviewedBy());
    assertNotNull(job.getReviewedAt());
    verify(jobRepository).save(job);
  }

  @Test
  void closeJobByAdmin_whenStatusIsNotActive_shouldThrowAndNotSave() {
    Job job = Job.builder().id(1L).status(JobStatus.PENDING).build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> service.closeJobByAdmin(7L, 1L));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertTrue(ex.getReason().contains("PENDING"));
    verify(jobRepository, never()).save(any());
  }

  @Test
  void bulkApproveJobs_shouldProcessEachId() {
    Job job1 = Job.builder().id(1L).status(JobStatus.PENDING).build();
    Job job2 = Job.builder().id(2L).status(JobStatus.PENDING).build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job1));
    when(jobRepository.findById(2L)).thenReturn(Optional.of(job2));

    service.bulkApproveJobs(3L, List.of(1L, 2L));

    assertEquals(JobStatus.ACTIVE, job1.getStatus());
    assertEquals(JobStatus.ACTIVE, job2.getStatus());
    verify(jobRepository).save(job1);
    verify(jobRepository).save(job2);
  }

  @Test
  void bulkApproveJobs_whenIdsNull_shouldDoNothing() {
    service.bulkApproveJobs(3L, null);

    verifyNoInteractions(jobRepository);
  }

  @Test
  void bulkRejectJobs_shouldProcessEachId() {
    Job job1 = Job.builder().id(1L).status(JobStatus.PENDING).build();
    Job job2 = Job.builder().id(2L).status(JobStatus.PENDING).build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job1));
    when(jobRepository.findById(2L)).thenReturn(Optional.of(job2));

    service.bulkRejectJobs(3L, List.of(1L, 2L), "spam");

    assertEquals(JobStatus.REJECTED, job1.getStatus());
    assertEquals(JobStatus.REJECTED, job2.getStatus());
    assertEquals("spam", job1.getReviewReason());
    assertEquals("spam", job2.getReviewReason());
    verify(jobRepository).save(job1);
    verify(jobRepository).save(job2);
  }

  @Test
  void bulkSuspendJobs_shouldProcessEachId() {
    Job job1 = Job.builder().id(1L).status(JobStatus.ACTIVE).build();
    Job job2 = Job.builder().id(2L).status(JobStatus.ACTIVE).build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job1));
    when(jobRepository.findById(2L)).thenReturn(Optional.of(job2));

    service.bulkSuspendJobs(3L, List.of(1L, 2L), "policy");

    assertEquals(JobStatus.SUSPENDED, job1.getStatus());
    assertEquals(JobStatus.SUSPENDED, job2.getStatus());
    verify(jobRepository).save(job1);
    verify(jobRepository).save(job2);
  }

  @Test
  void bulkCloseJobs_shouldProcessEachId() {
    Job job1 = Job.builder().id(1L).status(JobStatus.ACTIVE).build();
    Job job2 = Job.builder().id(2L).status(JobStatus.ACTIVE).build();

    when(jobRepository.findById(1L)).thenReturn(Optional.of(job1));
    when(jobRepository.findById(2L)).thenReturn(Optional.of(job2));

    service.bulkCloseJobs(3L, List.of(1L, 2L));

    assertEquals(JobStatus.CLOSED, job1.getStatus());
    assertEquals(JobStatus.CLOSED, job2.getStatus());
    verify(jobRepository).save(job1);
    verify(jobRepository).save(job2);
  }
}
