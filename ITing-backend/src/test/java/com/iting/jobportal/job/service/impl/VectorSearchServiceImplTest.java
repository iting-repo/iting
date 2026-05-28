package com.iting.jobportal.job.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.service.JobEmbeddingService;
import com.iting.jobportal.job.service.VectorSearchService.ScoredJobResult;
import com.iting.jobportal.userprofile.repository.CVRepository;
import com.iting.jobportal.userprofile.service.embedding.EmbeddingClient;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class VectorSearchServiceImplTest {

  @Mock private JobRepository jobRepository;
  @Mock private EmbeddingClient embeddingClient;
  @Mock private JobEmbeddingService jobEmbeddingService;
  @Mock private CVRepository cvRepository;

  @InjectMocks private VectorSearchServiceImpl service;

  private Job job(Long id, String emb) {
    return Job.builder().id(id).jobEmbedding(emb).build();
  }

  // ── semanticSearch ──────────────────────────────────────────────────

  @Test
  void semanticSearch_nullQuery_returnsEmpty() {
    assertTrue(service.semanticSearch(null, 5).isEmpty());
  }

  @Test
  void semanticSearch_blankQuery_returnsEmpty() {
    assertTrue(service.semanticSearch("   ", 5).isEmpty());
  }

  @Test
  void semanticSearch_embedFails_returnsEmpty() {
    when(embeddingClient.embed("foo")).thenReturn(Optional.empty());

    assertTrue(service.semanticSearch("foo", 5).isEmpty());
  }

  @Test
  void semanticSearch_returnsRankedResultsByScore() {
    double[] queryVec = {1.0, 0.0, 0.0};
    when(embeddingClient.embed(anyString())).thenReturn(Optional.of(queryVec));

    // job1 perfectly aligned (cos=1), job2 50% similar, job3 below threshold
    Job j1 = job(1L, "[1.0,0.0,0.0]");
    Job j2 = job(2L, "[0.7,0.7,0.0]");
    Job j3 = job(3L, "[0.1,0.1,1.0]"); // cos ~0.07, below 0.3 → filtered out

    when(jobRepository.findAllActiveWithEmbedding()).thenReturn(List.of(j1, j2, j3));
    when(jobEmbeddingService.parseEmbedding("[1.0,0.0,0.0]"))
        .thenReturn(new double[] {1.0, 0.0, 0.0});
    when(jobEmbeddingService.parseEmbedding("[0.7,0.7,0.0]"))
        .thenReturn(new double[] {0.7, 0.7, 0.0});
    when(jobEmbeddingService.parseEmbedding("[0.1,0.1,1.0]"))
        .thenReturn(new double[] {0.1, 0.1, 1.0});

    List<ScoredJobResult> result = service.semanticSearch("java", 5);

    assertEquals(2, result.size());
    assertEquals(1L, result.get(0).jobId()); // top = perfect match
    assertEquals(2L, result.get(1).jobId());
    assertTrue(result.get(0).score() > result.get(1).score());
  }

  @Test
  void semanticSearch_respectsTopK() {
    double[] queryVec = {1.0, 0.0};
    when(embeddingClient.embed(anyString())).thenReturn(Optional.of(queryVec));

    Job j1 = job(1L, "[1.0,0.0]");
    Job j2 = job(2L, "[0.9,0.1]");
    Job j3 = job(3L, "[0.8,0.2]");
    when(jobRepository.findAllActiveWithEmbedding()).thenReturn(List.of(j1, j2, j3));
    when(jobEmbeddingService.parseEmbedding("[1.0,0.0]")).thenReturn(new double[] {1.0, 0.0});
    when(jobEmbeddingService.parseEmbedding("[0.9,0.1]")).thenReturn(new double[] {0.9, 0.1});
    when(jobEmbeddingService.parseEmbedding("[0.8,0.2]")).thenReturn(new double[] {0.8, 0.2});

    assertEquals(2, service.semanticSearch("q", 2).size());
  }

  @Test
  void semanticSearch_noJobsInDb_returnsEmpty() {
    when(embeddingClient.embed(anyString())).thenReturn(Optional.of(new double[] {1.0}));
    when(jobRepository.findAllActiveWithEmbedding()).thenReturn(List.of());

    assertTrue(service.semanticSearch("q", 10).isEmpty());
  }

  @Test
  void semanticSearch_skipsJobWithNullEmbedding() {
    when(embeddingClient.embed(anyString())).thenReturn(Optional.of(new double[] {1.0}));

    Job good = job(1L, "[1.0]");
    Job bad = job(2L, "broken");
    when(jobRepository.findAllActiveWithEmbedding()).thenReturn(List.of(good, bad));
    when(jobEmbeddingService.parseEmbedding("[1.0]")).thenReturn(new double[] {1.0});
    when(jobEmbeddingService.parseEmbedding("broken")).thenReturn(null);

    List<ScoredJobResult> result = service.semanticSearch("q", 5);

    assertEquals(1, result.size());
    assertEquals(1L, result.get(0).jobId());
  }

  @Test
  void semanticSearch_skipsJobWithMismatchedDimensions() {
    when(embeddingClient.embed(anyString())).thenReturn(Optional.of(new double[] {1.0, 0.0}));

    Job good = job(1L, "[1.0,0.0]");
    Job mismatched = job(2L, "[1.0,0.0,0.0]");
    when(jobRepository.findAllActiveWithEmbedding()).thenReturn(List.of(good, mismatched));
    when(jobEmbeddingService.parseEmbedding("[1.0,0.0]")).thenReturn(new double[] {1.0, 0.0});
    when(jobEmbeddingService.parseEmbedding("[1.0,0.0,0.0]"))
        .thenReturn(new double[] {1.0, 0.0, 0.0});

    List<ScoredJobResult> result = service.semanticSearch("q", 5);

    assertEquals(1, result.size());
    assertEquals(1L, result.get(0).jobId());
  }

  // ── recommendJobsForCandidate ───────────────────────────────────────

  @Test
  void recommend_noCvEmbedding_returnsEmpty() {
    when(cvRepository.findActiveCvEmbeddingByProfileId(eq(1L), any(Pageable.class)))
        .thenReturn(List.of());

    assertTrue(service.recommendJobsForCandidate(1L, 10).isEmpty());
  }

  @Test
  void recommend_cvEmbeddingNull_returnsEmpty() {
    when(cvRepository.findActiveCvEmbeddingByProfileId(eq(1L), any(Pageable.class)))
        .thenReturn(List.of("bad"));
    when(jobEmbeddingService.parseEmbedding("bad")).thenReturn(null);

    assertTrue(service.recommendJobsForCandidate(1L, 10).isEmpty());
  }

  @Test
  void recommend_cvEmbeddingEmpty_returnsEmpty() {
    when(cvRepository.findActiveCvEmbeddingByProfileId(eq(1L), any(Pageable.class)))
        .thenReturn(List.of("[]"));
    when(jobEmbeddingService.parseEmbedding("[]")).thenReturn(new double[] {});

    assertTrue(service.recommendJobsForCandidate(1L, 10).isEmpty());
  }

  @Test
  void recommend_happyPath_returnsRanked() {
    when(cvRepository.findActiveCvEmbeddingByProfileId(eq(1L), any(Pageable.class)))
        .thenReturn(List.of("[1.0,0.0]"));
    when(jobEmbeddingService.parseEmbedding("[1.0,0.0]")).thenReturn(new double[] {1.0, 0.0});

    Job j1 = job(1L, "[1.0,0.0]");
    Job j2 = job(2L, "[0.5,0.5]");
    when(jobRepository.findAllActiveWithEmbedding()).thenReturn(List.of(j1, j2));
    lenient()
        .when(jobEmbeddingService.parseEmbedding("[1.0,0.0]"))
        .thenReturn(new double[] {1.0, 0.0});
    when(jobEmbeddingService.parseEmbedding("[0.5,0.5]")).thenReturn(new double[] {0.5, 0.5});

    List<ScoredJobResult> result = service.recommendJobsForCandidate(1L, 10);

    assertEquals(2, result.size());
    // perfect match first
    assertEquals(1L, result.get(0).jobId());
  }

  // ── ScoredJobResult record ─────────────────────────────────────────

  @Test
  void scoredJobResult_record_fieldsAccessible() {
    ScoredJobResult r = new ScoredJobResult(99L, 0.85);
    assertEquals(99L, r.jobId());
    assertEquals(0.85, r.score(), 0.0001);
  }
}
