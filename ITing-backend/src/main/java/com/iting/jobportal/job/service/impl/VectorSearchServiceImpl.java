package com.iting.jobportal.job.service.impl;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.service.JobEmbeddingService;
import com.iting.jobportal.job.service.VectorSearchService;
import com.iting.jobportal.userprofile.service.embedding.EmbeddingClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * In-memory vector search implementation using brute-force cosine similarity.
 * Loads all job embeddings from DB, compares with query embedding.
 *
 * Performance note: Suitable for up to ~10,000 jobs.
 * For larger scale, migrate to FAISS (Python) or pgvector.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VectorSearchServiceImpl implements VectorSearchService {

    private final JobRepository jobRepository;
    private final EmbeddingClient embeddingClient;
    private final JobEmbeddingService jobEmbeddingService;

    @Override
    public List<ScoredJobResult> semanticSearch(String queryText, int topK) {
        if (queryText == null || queryText.isBlank())
            return List.of();

        // Step 1: Embed the query
        Optional<double[]> queryEmbedding = embeddingClient.embed(queryText);
        if (queryEmbedding.isEmpty()) {
            log.warn("Failed to embed query text, falling back to empty results");
            return List.of();
        }

        double[] queryVec = queryEmbedding.get();

        // Step 2: Load all job embeddings
        List<Job> jobs = jobRepository.findAllActiveWithEmbedding();
        if (jobs.isEmpty())
            return List.of();

        // Step 3: Compute cosine similarity for each job
        List<ScoredJobResult> results = new ArrayList<>(jobs.size());
        for (Job job : jobs) {
            double[] jobVec = jobEmbeddingService.parseEmbedding(job.getJobEmbedding());
            if (jobVec == null)
                continue;

            double similarity = cosineSimilarity(queryVec, jobVec);
            if (similarity > 0.3) { // Threshold: only include reasonably similar jobs
                results.add(new ScoredJobResult(job.getId(), similarity));
            }
        }

        // Step 4: Sort by similarity descending, take top K
        results.sort(Comparator.comparingDouble(ScoredJobResult::score).reversed());

        return results.stream()
                .limit(topK)
                .collect(Collectors.toList());
    }

    /**
     * Compute cosine similarity between two vectors.
     */
    private static double cosineSimilarity(double[] a, double[] b) {
        if (a == null || b == null)
            return 0.0;
        if (a.length == 0 || b.length == 0)
            return 0.0;
        if (a.length != b.length)
            return 0.0;

        double dot = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA == 0.0 || normB == 0.0)
            return 0.0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
