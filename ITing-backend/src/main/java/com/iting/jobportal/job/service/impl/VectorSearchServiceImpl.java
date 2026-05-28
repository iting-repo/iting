package com.iting.jobportal.job.service.impl;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.service.JobEmbeddingService;
import com.iting.jobportal.job.service.VectorSearchService;
import com.iting.jobportal.userprofile.repository.CVRepository;
import com.iting.jobportal.userprofile.service.embedding.EmbeddingClient;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

/**
 * In-memory vector search implementation using brute-force cosine similarity. Loads all job
 * embeddings from DB, compares with query embedding.
 *
 * <p>Performance note: Suitable for up to ~10,000 jobs. For larger scale, migrate to FAISS (Python)
 * or pgvector.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VectorSearchServiceImpl implements VectorSearchService {

  private final JobRepository jobRepository;
  private final EmbeddingClient embeddingClient;
  private final JobEmbeddingService jobEmbeddingService;
  private final CVRepository cvRepository;

  @Override
  public List<ScoredJobResult> semanticSearch(String queryText, int topK) {
    if (queryText == null || queryText.isBlank()) return List.of();

    // Step 1: Embed the query
    Optional<double[]> queryEmbedding = embeddingClient.embed(queryText);
    if (queryEmbedding.isEmpty()) {
      log.warn("Failed to embed query text, falling back to empty results");
      return List.of();
    }

    return rankJobsByVector(queryEmbedding.get(), topK);
  }

  @Override
  public List<ScoredJobResult> recommendJobsForCandidate(Long userId, int topK) {
    List<String> embeddings =
        cvRepository.findActiveCvEmbeddingByProfileId(userId, PageRequest.of(0, 1));
    if (embeddings.isEmpty()) {
      log.debug("No CV embedding for userId={}, cannot recommend", userId);
      return List.of();
    }

    double[] cvVec = jobEmbeddingService.parseEmbedding(embeddings.get(0));
    if (cvVec == null || cvVec.length == 0) return List.of();

    log.info("🤖 Recommending jobs for userId={} (cvVec={}d)", userId, cvVec.length);
    return rankJobsByVector(cvVec, topK);
  }

  /** Xếp hạng tất cả active jobs theo cosine similarity với query vector. */
  private List<ScoredJobResult> rankJobsByVector(double[] queryVec, int topK) {
    List<Job> jobs = jobRepository.findAllActiveWithEmbedding();
    if (jobs.isEmpty()) return List.of();

    List<ScoredJobResult> results = new ArrayList<>(jobs.size());
    for (Job job : jobs) {
      double[] jobVec = jobEmbeddingService.parseEmbedding(job.getJobEmbedding());
      if (jobVec == null) continue;
      if (jobVec.length != queryVec.length) continue;

      double similarity = cosineSimilarity(queryVec, jobVec);
      if (similarity > 0.3) {
        results.add(new ScoredJobResult(job.getId(), similarity));
      }
    }

    results.sort(Comparator.comparingDouble(ScoredJobResult::score).reversed());

    return results.stream().limit(topK).collect(Collectors.toList());
  }

  /** Compute cosine similarity between two vectors. */
  private static double cosineSimilarity(double[] a, double[] b) {
    if (a == null || b == null) return 0.0;
    if (a.length == 0 || b.length == 0) return 0.0;
    if (a.length != b.length) return 0.0;

    double dot = 0.0;
    double normA = 0.0;
    double normB = 0.0;
    for (int i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA == 0.0 || normB == 0.0) return 0.0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
