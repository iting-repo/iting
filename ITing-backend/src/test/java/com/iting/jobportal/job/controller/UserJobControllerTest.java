package com.iting.jobportal.job.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.dto.response.SalaryReportResponse;
import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobType;
import com.iting.jobportal.job.service.JobService;
import com.iting.jobportal.job.service.VectorSearchService;
import com.iting.jobportal.recommendation.entity.enums.InteractionType;
import com.iting.jobportal.recommendation.service.InteractionService;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
class UserJobControllerTest {

  @Mock private JobService jobService;
  @Mock private InteractionService interactionService;
  @Mock private VectorSearchService vectorSearchService;
  @InjectMocks private UserJobController controller;

  // ── searchJobs ───────────────────────────────────────────────────────

  @Test
  void searchJobs_buildsRequestFromAllParams() {
    Page<JobResponse> page = new PageImpl<>(List.of());
    when(jobService.searchJobs(any(JobSearchRequest.class), eq(1L))).thenReturn(page);

    controller.searchJobs(
        1L,
        "java",
        "HCM",
        "FULL_TIME",
        null,
        "MIDDLE",
        null,
        new BigDecimal("1000"),
        new BigDecimal("5000"),
        24,
        5L,
        "DEV",
        "BACKEND,FRONTEND",
        "java,spring",
        "java",
        "lastUpdate",
        "desc",
        false,
        0,
        10);

    ArgumentCaptor<JobSearchRequest> cap = ArgumentCaptor.forClass(JobSearchRequest.class);
    verify(jobService).searchJobs(cap.capture(), eq(1L));
    JobSearchRequest r = cap.getValue();
    assertEquals("java", r.getKeyword());
    assertEquals("HCM", r.getLocation());
    assertEquals(JobType.FULL_TIME, r.getJobType());
    assertEquals(ExperienceLevel.MIDDLE, r.getExperienceLevel());
    assertEquals(new BigDecimal("1000"), r.getMinSalary());
    assertEquals(new BigDecimal("5000"), r.getMaxSalary());
    assertEquals(24, r.getPostedWithinHours());
    assertEquals(5L, r.getCompanyId());
    assertEquals("DEV", r.getDomain());
    assertEquals(List.of("BACKEND", "FRONTEND"), r.getSubDomains());
    assertEquals(List.of("java", "spring"), r.getTechs());
    assertEquals("java", r.getSkills());
    assertEquals("lastUpdate", r.getSortBy());
    assertEquals("desc", r.getSortOrder());
    assertEquals(false, r.getIsAiSearch());
  }

  @Test
  void searchJobs_keywordOrLocationPresent_tracksSearch() {
    when(jobService.searchJobs(any(JobSearchRequest.class), eq(1L)))
        .thenReturn(new PageImpl<>(List.of()));

    controller.searchJobs(
        1L,
        "java",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "lastUpdate",
        "desc",
        false,
        0,
        10);

    verify(interactionService).trackSearch(1L, "java", null);
  }

  @Test
  void searchJobs_anonymous_noTracking() {
    when(jobService.searchJobs(any(JobSearchRequest.class), org.mockito.ArgumentMatchers.isNull()))
        .thenReturn(new PageImpl<>(List.of()));

    controller.searchJobs(
        null,
        "java",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "lastUpdate",
        "desc",
        false,
        0,
        10);

    verify(interactionService, never()).trackSearch(any(), any(), any());
  }

  @Test
  void searchJobs_noKeywordOrLocation_noTracking() {
    when(jobService.searchJobs(any(JobSearchRequest.class), eq(1L)))
        .thenReturn(new PageImpl<>(List.of()));

    controller.searchJobs(
        1L,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "lastUpdate",
        "desc",
        false,
        0,
        10);

    verify(interactionService, never()).trackSearch(any(), any(), any());
  }

  @Test
  void searchJobs_multipleJobTypes_csvParsed() {
    when(jobService.searchJobs(any(JobSearchRequest.class), eq(1L)))
        .thenReturn(new PageImpl<>(List.of()));

    controller.searchJobs(
        1L,
        null,
        null,
        null,
        "FULL_TIME,PART_TIME",
        null,
        "MIDDLE,SENIOR",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "lastUpdate",
        "desc",
        false,
        0,
        10);

    ArgumentCaptor<JobSearchRequest> cap = ArgumentCaptor.forClass(JobSearchRequest.class);
    verify(jobService).searchJobs(cap.capture(), eq(1L));
    assertEquals(List.of(JobType.FULL_TIME, JobType.PART_TIME), cap.getValue().getJobTypes());
    assertEquals(
        List.of(ExperienceLevel.MIDDLE, ExperienceLevel.SENIOR),
        cap.getValue().getExperienceLevels());
  }

  @Test
  void searchJobs_blankCsv_resultsInNullList() {
    when(jobService.searchJobs(any(JobSearchRequest.class), eq(1L)))
        .thenReturn(new PageImpl<>(List.of()));

    controller.searchJobs(
        1L,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "",
        "",
        null,
        "lastUpdate",
        "desc",
        false,
        0,
        10);

    ArgumentCaptor<JobSearchRequest> cap = ArgumentCaptor.forClass(JobSearchRequest.class);
    verify(jobService).searchJobs(cap.capture(), eq(1L));
    assertNull(cap.getValue().getSubDomains());
    assertNull(cap.getValue().getTechs());
  }

  @Test
  void searchJobs_invalidJobType_throwsIAE() {
    assertThrows(
        IllegalArgumentException.class,
        () ->
            controller.searchJobs(
                1L,
                null,
                null,
                "GIBBERISH",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                "lastUpdate",
                "desc",
                false,
                0,
                10));
  }

  // ── getJob ───────────────────────────────────────────────────────────

  @Test
  void getJob_authenticated_tracksViewInteraction() {
    JobResponse expected = JobResponse.builder().build();
    when(jobService.getJobByIdWithView(5L)).thenReturn(expected);

    ResponseEntity<JobResponse> resp = controller.getJob(1L, 5L);

    verify(interactionService).trackInteraction(1L, 5L, InteractionType.VIEW);
    assertSame(expected, resp.getBody());
  }

  @Test
  void getJob_anonymous_noTracking() {
    when(jobService.getJobByIdWithView(5L)).thenReturn(JobResponse.builder().build());

    controller.getJob(null, 5L);

    verify(interactionService, never()).trackInteraction(any(), any(), any());
  }

  // ── getLatestJobs / getHotJobs ──────────────────────────────────────

  @Test
  void getLatestJobs_delegatesToService() {
    List<JobResponse> jobs = List.of();
    when(jobService.getLatestJobs(10)).thenReturn(jobs);

    assertSame(jobs, controller.getLatestJobs(10).getBody());
  }

  @Test
  void getHotJobs_delegatesToService() {
    List<JobResponse> jobs = List.of();
    when(jobService.getHotJobs(10)).thenReturn(jobs);

    assertSame(jobs, controller.getHotJobs(10).getBody());
  }

  // ── getSalaryReport ─────────────────────────────────────────────────

  @Test
  void getSalaryReport_passesAllArgs() {
    SalaryReportResponse expected = new SalaryReportResponse();
    when(jobService.getSalaryReport("dev", "HCM", "MID")).thenReturn(expected);

    assertSame(expected, controller.getSalaryReport("dev", "HCM", "MID").getBody());
  }

  // ── analyzeCv ───────────────────────────────────────────────────────

  @Test
  void analyzeCv_delegatesToService() {
    JobSearchRequest expected = new JobSearchRequest();
    when(jobService.analyzeCvForSearch("CV text")).thenReturn(expected);

    assertSame(expected, controller.analyzeCv("CV text"));
  }

  @Test
  void analyzeCvFile_delegatesToService() {
    MockMultipartFile file =
        new MockMultipartFile("file", "cv.pdf", "application/pdf", new byte[100]);
    JobSearchRequest expected = new JobSearchRequest();
    when(jobService.analyzeCvFileForSearch(any())).thenReturn(expected);

    assertSame(expected, controller.analyzeCvFile(file));
  }

  // ── getRecommendedJobs ──────────────────────────────────────────────

  @Test
  void getRecommendedJobs_anonymous_fallbackToLatest() {
    List<JobResponse> latest = List.of();
    when(jobService.getLatestJobs(10)).thenReturn(latest);

    ResponseEntity<List<JobResponse>> resp = controller.getRecommendedJobs(null, 10);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(latest, resp.getBody());
    verify(vectorSearchService, never()).recommendJobsForCandidate(any(), any(Integer.class));
  }

  @Test
  void getRecommendedJobs_authenticatedButEmptyResults_fallbackToLatest() {
    when(vectorSearchService.recommendJobsForCandidate(1L, 10)).thenReturn(List.of());
    List<JobResponse> latest = List.of();
    when(jobService.getLatestJobs(10)).thenReturn(latest);

    assertSame(latest, controller.getRecommendedJobs(1L, 10).getBody());
  }

  @Test
  void getRecommendedJobs_authenticated_withScores_setsMatchScore() {
    VectorSearchService.ScoredJobResult scored =
        new VectorSearchService.ScoredJobResult(42L, 0.8523);
    when(vectorSearchService.recommendJobsForCandidate(1L, 10)).thenReturn(List.of(scored));
    JobResponse job = JobResponse.builder().build();
    when(jobService.getJobById(42L)).thenReturn(job);

    ResponseEntity<List<JobResponse>> resp = controller.getRecommendedJobs(1L, 10);

    assertEquals(1, resp.getBody().size());
    assertEquals(
        85.23, resp.getBody().get(0).getMatchScore(), "Score scaled to 0-100 with 2 decimals");
  }

  @Test
  void getRecommendedJobs_negativeScore_clampedToZero() {
    // Cosine có thể âm với vector orthogonal/opposite — controller clamp ≥ 0
    VectorSearchService.ScoredJobResult scored = new VectorSearchService.ScoredJobResult(42L, -0.5);
    when(vectorSearchService.recommendJobsForCandidate(1L, 10)).thenReturn(List.of(scored));
    when(jobService.getJobById(42L)).thenReturn(JobResponse.builder().build());

    ResponseEntity<List<JobResponse>> resp = controller.getRecommendedJobs(1L, 10);

    assertEquals(0.0, resp.getBody().get(0).getMatchScore());
  }
}
