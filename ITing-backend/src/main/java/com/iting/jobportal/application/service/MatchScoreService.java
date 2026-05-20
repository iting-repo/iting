package com.iting.jobportal.application.service;

import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.service.JobEmbeddingService;
import com.iting.jobportal.userprofile.repository.CVRepository;
import com.iting.jobportal.userprofile.service.embedding.HuggingFaceSimilarityClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.iting.jobportal.application.repository.ApplyFormSentToJobRepository;

import java.util.List;
import java.util.Optional;

/**
 * Service tính điểm phù hợp CV ↔ Job bằng AI cosine similarity.
 *
 * <p>Luồng: lấy cvEmbedding (CV đang dùng của candidate) + jobEmbedding (Job)
 * → gọi HF /similarity/vectors → lưu match_score (0–100%) vào ApplyFormSentToJob.
 *
 * <p>Chạy async để không block luồng ứng tuyển chính.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MatchScoreService {

    private final CVRepository cvRepository;
    private final JobEmbeddingService jobEmbeddingService;
    private final HuggingFaceSimilarityClient similarityClient;
    private final ApplyFormSentToJobRepository sentToJobRepository;

    /**
     * Tính match score bất đồng bộ sau khi ứng viên apply.
     * Nếu thiếu embedding → bỏ qua (match_score = null).
     */
    @Async
    @Transactional
    public void computeAndSaveAsync(ApplyFormSentToJob.ApplyFormSentToJobId sentId, Long userId, Job job) {
        try {
            Double score = compute(userId, job);
            if (score == null) return;

            sentToJobRepository.findById(sentId).ifPresent(sent -> {
                sent.setMatchScore(score);
                sentToJobRepository.save(sent);
                log.info("✅ Match score {}% saved for userId={} jobId={}",
                        String.format("%.1f", score), userId, job.getId());
            });
        } catch (Exception e) {
            log.warn("Failed to compute match score for userId={} jobId={}: {}",
                    userId, job.getId(), e.getMessage());
        }
    }

    /**
     * Tính match score đồng bộ (dùng cho ranking / on-demand).
     *
     * @return Percentage (0–100) hoặc null nếu thiếu embedding.
     */
    public Double compute(Long userId, Job job) {
        // 1. Lấy CV embedding (default CV, fallback CV mới nhất có embedding)
        List<String> embeddings = cvRepository.findActiveCvEmbeddingByProfileId(userId, PageRequest.of(0, 1));
        if (embeddings.isEmpty()) {
            log.debug("No CV embedding for userId={}", userId);
            return null;
        }

        double[] cvVec = jobEmbeddingService.parseEmbedding(embeddings.get(0));
        if (cvVec == null || cvVec.length == 0) return null;

        // 2. Lấy Job embedding
        double[] jobVec = jobEmbeddingService.parseEmbedding(job.getJobEmbedding());
        if (jobVec == null || jobVec.length == 0) return null;

        // 3. Kiểm tra cùng dimension
        if (cvVec.length != jobVec.length) {
            log.warn("Dimension mismatch: cv={}d job={}d", cvVec.length, jobVec.length);
            return null;
        }

        // 4. Gọi HF /similarity/vectors
        Optional<Double> cosine = similarityClient.similarityOfVectors(cvVec, jobVec);
        if (cosine.isEmpty()) {
            // Fallback: tính local nếu HF không khả dụng
            double score = localCosineSimilarity(cvVec, jobVec);
            return Math.round(Math.max(0, score) * 10000.0) / 100.0;
        }

        return Math.round(Math.max(0, cosine.get()) * 10000.0) / 100.0;
    }

    /**
     * Fallback cosine similarity khi HF API không khả dụng.
     */
    private static double localCosineSimilarity(double[] a, double[] b) {
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA == 0 || normB == 0) return 0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
