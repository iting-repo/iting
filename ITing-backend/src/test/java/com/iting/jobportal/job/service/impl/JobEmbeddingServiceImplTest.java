package com.iting.jobportal.job.service.impl;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.userprofile.service.embedding.EmbeddingClient;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class JobEmbeddingServiceImplTest {

  @Mock private JobRepository jobRepository;
  @Mock private EmbeddingClient embeddingClient;
  @Spy private ObjectMapper objectMapper = new ObjectMapper();

  @InjectMocks private JobEmbeddingServiceImpl service;

  // ── embedJob ────────────────────────────────────────────────────────

  @Test
  void embedJob_happyPath_savesEmbeddingJson() {
    Job job = Job.builder().id(1L).title("Backend Dev").skills(List.of("Java")).build();
    when(embeddingClient.embed(anyString())).thenReturn(Optional.of(new double[] {0.1, 0.2, 0.3}));

    boolean result = service.embedJob(job);

    assertTrue(result);
    ArgumentCaptor<Job> cap = ArgumentCaptor.forClass(Job.class);
    verify(jobRepository).save(cap.capture());
    Job saved = cap.getValue();
    assertTrue(saved.getJobEmbedding().contains("0.1"));
    assertNotNull(saved.getEmbeddingUpdatedAt());
  }

  @Test
  void embedJob_blankText_returnsFalse() {
    // Empty job → buildEmbeddingText returns blank
    Job job = Job.builder().id(1L).build();

    assertFalse(service.embedJob(job));
    verify(jobRepository, never()).save(any());
  }

  @Test
  void embedJob_embeddingClientReturnsEmpty_returnsFalse() {
    Job job = Job.builder().id(1L).title("Dev").build();
    when(embeddingClient.embed(anyString())).thenReturn(Optional.empty());

    assertFalse(service.embedJob(job));
    verify(jobRepository, never()).save(any());
  }

  @Test
  void embedJob_embeddingThrows_returnsFalse() {
    Job job = Job.builder().id(1L).title("Dev").build();
    when(embeddingClient.embed(anyString())).thenThrow(new RuntimeException("API down"));

    assertFalse(service.embedJob(job));
    verify(jobRepository, never()).save(any());
  }

  @Test
  void embedJob_includesAllOptionalFields() {
    Job job =
        Job.builder()
            .id(1L)
            .title("Backend")
            .position("Dev")
            .skills(List.of("Java", "Spring"))
            .description("Build APIs")
            .experienceLevel(ExperienceLevel.SENIOR)
            .build();
    when(embeddingClient.embed(anyString())).thenReturn(Optional.of(new double[] {1.0}));

    boolean result = service.embedJob(job);

    assertTrue(result);
    ArgumentCaptor<String> textCap = ArgumentCaptor.forClass(String.class);
    verify(embeddingClient).embed(textCap.capture());
    String text = textCap.getValue();
    assertTrue(text.contains("Vị trí: Backend"));
    assertTrue(text.contains("Chức danh: Dev"));
    assertTrue(text.contains("Công nghệ: Java, Spring"));
    assertTrue(text.contains("Mô tả: Build APIs"));
    assertTrue(text.contains("Kinh nghiệm: SENIOR"));
  }

  @Test
  void embedJob_truncatesLongDescription() {
    String longDesc = "x".repeat(600);
    Job job = Job.builder().id(1L).title("Dev").description(longDesc).build();
    when(embeddingClient.embed(anyString())).thenReturn(Optional.of(new double[] {1.0}));

    service.embedJob(job);

    ArgumentCaptor<String> textCap = ArgumentCaptor.forClass(String.class);
    verify(embeddingClient).embed(textCap.capture());
    String text = textCap.getValue();
    // 500 'x' chars + rest of template — total text bounded; specifically count 'x':
    long xCount = text.chars().filter(c -> c == 'x').count();
    assertEquals(500, xCount);
  }

  // ── embedMissingJobs ────────────────────────────────────────────────

  @Test
  void embedMissingJobs_returnsCountOfSuccessful() {
    Job j1 = Job.builder().id(1L).title("A").build();
    Job j2 = Job.builder().id(2L).title("B").build();
    when(jobRepository.findJobsWithoutEmbedding(eq(JobStatus.ACTIVE), any(Pageable.class)))
        .thenReturn(List.of(j1, j2));
    // Both succeed
    when(embeddingClient.embed(anyString())).thenReturn(Optional.of(new double[] {0.5}));

    int count = service.embedMissingJobs(50);

    assertEquals(2, count);
  }

  @Test
  void embedMissingJobs_emptyList_returnsZero() {
    when(jobRepository.findJobsWithoutEmbedding(eq(JobStatus.ACTIVE), any(Pageable.class)))
        .thenReturn(List.of());

    assertEquals(0, service.embedMissingJobs(50));
  }

  @Test
  void embedMissingJobs_partialFailure_countsOnlySuccess() {
    Job j1 = Job.builder().id(1L).title("A").build();
    Job j2 = Job.builder().id(2L).build(); // blank text → fails

    when(jobRepository.findJobsWithoutEmbedding(eq(JobStatus.ACTIVE), any(Pageable.class)))
        .thenReturn(List.of(j1, j2));
    when(embeddingClient.embed(anyString())).thenReturn(Optional.of(new double[] {1.0}));

    int count = service.embedMissingJobs(50);

    assertEquals(1, count);
  }

  // ── parseEmbedding ──────────────────────────────────────────────────

  @Test
  void parseEmbedding_validJson_returnsArray() {
    double[] arr = service.parseEmbedding("[0.1, 0.2, 0.3]");

    assertNotNull(arr);
    assertArrayEquals(new double[] {0.1, 0.2, 0.3}, arr, 0.0001);
  }

  @Test
  void parseEmbedding_nullInput_returnsNull() {
    assertNull(service.parseEmbedding(null));
  }

  @Test
  void parseEmbedding_blankInput_returnsNull() {
    assertNull(service.parseEmbedding("   "));
  }

  @Test
  void parseEmbedding_malformedJson_returnsNull() {
    assertNull(service.parseEmbedding("not-json"));
  }

  @Test
  void parseEmbedding_nullElement_defaultsToZero() {
    double[] arr = service.parseEmbedding("[0.1, null, 0.3]");

    assertNotNull(arr);
    assertArrayEquals(new double[] {0.1, 0.0, 0.3}, arr, 0.0001);
  }

  // ── scheduledEmbedding ──────────────────────────────────────────────

  @Test
  void scheduledEmbedding_callsEmbedMissingJobsWith50() {
    when(jobRepository.findJobsWithoutEmbedding(eq(JobStatus.ACTIVE), any(Pageable.class)))
        .thenReturn(List.of());

    service.scheduledEmbedding();

    ArgumentCaptor<Pageable> pageCap = ArgumentCaptor.forClass(Pageable.class);
    verify(jobRepository).findJobsWithoutEmbedding(eq(JobStatus.ACTIVE), pageCap.capture());
    assertEquals(50, pageCap.getValue().getPageSize());
  }

  // helper for static import in this file
  private static <T> T eq(T value) {
    return org.mockito.ArgumentMatchers.eq(value);
  }
}
