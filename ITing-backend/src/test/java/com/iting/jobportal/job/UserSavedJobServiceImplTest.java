package com.iting.jobportal.job;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.UserSaveJob;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.repository.UserSaveJobRepository;
import com.iting.jobportal.job.service.impl.UserSavedJobServiceImpl;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
class UserSavedJobServiceImplTest {

  @Mock private UserSaveJobRepository userSaveJobRepository;
  @Mock private JobRepository jobRepository;
  @InjectMocks private UserSavedJobServiceImpl service;

  // ── saveJob ───────────────────────────────────────────────────

  @Test
  void saveJob_whenNotAlreadySaved_savesNewRecord() {
    when(userSaveJobRepository.existsByUserIdAndJobId(1L, 10L)).thenReturn(false);
    when(jobRepository.findById(10L)).thenReturn(Optional.of(new Job()));

    service.saveJob(1L, 10L);

    ArgumentCaptor<UserSaveJob> captor = ArgumentCaptor.forClass(UserSaveJob.class);
    verify(userSaveJobRepository).save(captor.capture());
    assertEquals(1L, captor.getValue().getUserId());
    assertEquals(10L, captor.getValue().getJobId());
  }

  @Test
  void saveJob_whenAlreadySaved_isIdempotent() {
    when(userSaveJobRepository.existsByUserIdAndJobId(1L, 10L)).thenReturn(true);

    service.saveJob(1L, 10L);

    verify(userSaveJobRepository, never()).save(any());
    verify(jobRepository, never()).findById(any());
  }

  @Test
  void saveJob_whenJobNotFound_throwsException() {
    when(userSaveJobRepository.existsByUserIdAndJobId(1L, 99L)).thenReturn(false);
    when(jobRepository.findById(99L)).thenReturn(Optional.empty());

    RuntimeException ex = assertThrows(RuntimeException.class, () -> service.saveJob(1L, 99L));
    assertEquals("Job not found", ex.getMessage());
    verify(userSaveJobRepository, never()).save(any());
  }

  // ── unsaveJob ─────────────────────────────────────────────────

  @Test
  void unsaveJob_delegatesToRepository() {
    service.unsaveJob(1L, 10L);

    verify(userSaveJobRepository).deleteByUserIdAndJobId(1L, 10L);
  }

  // ── isSaved ───────────────────────────────────────────────────

  @Test
  void isSaved_returnsTrue_whenRecordExists() {
    when(userSaveJobRepository.existsByUserIdAndJobId(1L, 10L)).thenReturn(true);

    assertTrue(service.isSaved(1L, 10L));
  }

  @Test
  void isSaved_returnsFalse_whenNoRecord() {
    when(userSaveJobRepository.existsByUserIdAndJobId(1L, 10L)).thenReturn(false);

    assertFalse(service.isSaved(1L, 10L));
  }

  // ── countSavedJobs ────────────────────────────────────────────

  @Test
  void countSavedJobs_returnsRepositoryCount() {
    when(userSaveJobRepository.countByUserId(1L)).thenReturn(7L);

    assertEquals(7L, service.countSavedJobs(1L));
  }

  // ── getSavedJobs ──────────────────────────────────────────────

  @Test
  void getSavedJobs_mapsJobDetailsCorrectly() {
    Job job = new Job();
    job.setId(10L);
    job.setTitle("Backend Engineer");

    UserSaveJob saved = UserSaveJob.builder().userId(1L).jobId(10L).build();

    when(userSaveJobRepository.findAllByUserId(eq(1L), any()))
        .thenReturn(new PageImpl<>(List.of(saved)));
    when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

    Page<?> result = service.getSavedJobs(1L, PageRequest.of(0, 10));

    assertEquals(1, result.getTotalElements());
  }

  @Test
  void getSavedJobs_whenJobNoLongerExists_returnsPartialResponse() {
    UserSaveJob saved = UserSaveJob.builder().userId(1L).jobId(99L).build();

    when(userSaveJobRepository.findAllByUserId(eq(1L), any()))
        .thenReturn(new PageImpl<>(List.of(saved)));
    when(jobRepository.findById(99L)).thenReturn(Optional.empty());

    Page<?> result = service.getSavedJobs(1L, PageRequest.of(0, 10));

    assertEquals(1, result.getTotalElements());
  }

  // ── getSavedJobIds ────────────────────────────────────────────

  @Test
  void getSavedJobIds_returnsListFromRepository() {
    when(userSaveJobRepository.findAllJobIdByUserId(1L)).thenReturn(List.of(10L, 20L, 30L));

    List<Long> ids = service.getSavedJobIds(1L);

    assertEquals(3, ids.size());
    assertTrue(ids.contains(20L));
  }
}
