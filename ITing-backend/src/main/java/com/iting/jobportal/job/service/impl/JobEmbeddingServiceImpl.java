package com.iting.jobportal.job.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.service.JobEmbeddingService;
import com.iting.jobportal.userprofile.service.embedding.EmbeddingClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Implementation of JobEmbeddingService.
 * Uses OpenAI Embedding API (via EmbeddingClient) to generate vectors.
 * Runs a scheduled job every night to embed new/updated jobs.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JobEmbeddingServiceImpl implements JobEmbeddingService {

    private final JobRepository jobRepository;
    private final EmbeddingClient embeddingClient;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public boolean embedJob(Job job) {
        try {
            String textToEmbed = buildEmbeddingText(job);
            if (textToEmbed.isBlank())
                return false;

            Optional<double[]> embedding = embeddingClient.embed(textToEmbed);
            if (embedding.isEmpty())
                return false;

            String embeddingJson = objectMapper.writeValueAsString(embedding.get());
            job.setJobEmbedding(embeddingJson);
            job.setEmbeddingUpdatedAt(LocalDateTime.now());
            jobRepository.save(job);

            return true;
        } catch (Exception e) {
            log.error("Failed to embed job {}: {}", job.getId(), e.getMessage());
            return false;
        }
    }

    @Override
    @Transactional
    public int embedMissingJobs(int batchSize) {
        List<Job> jobs = jobRepository.findJobsWithoutEmbedding(
                JobStatus.ACTIVE,
                PageRequest.of(0, batchSize));

        int count = 0;
        for (Job job : jobs) {
            if (embedJob(job)) {
                count++;
            }
            // Rate limiting: avoid hitting API too fast
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        if (count > 0) {
            log.info("✅ Embedded {} / {} jobs successfully", count, jobs.size());
        }

        return count;
    }

    @Override
    public double[] parseEmbedding(String embeddingJson) {
        if (embeddingJson == null || embeddingJson.isBlank())
            return null;
        try {
            List<Double> values = objectMapper.readValue(embeddingJson, new TypeReference<>() {
            });
            double[] arr = new double[values.size()];
            for (int i = 0; i < values.size(); i++) {
                arr[i] = values.get(i) == null ? 0.0 : values.get(i);
            }
            return arr;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Scheduled task: embed jobs without embedding every 2 hours.
     */
    @Scheduled(fixedDelay = 7200000) // 2 hours
    public void scheduledEmbedding() {
        log.info("🔄 Running scheduled job embedding...");
        int count = embedMissingJobs(50);
        log.info("📊 Scheduled embedding completed: {} jobs processed", count);
    }

    /**
     * Build a combined text from job fields for embedding.
     * Includes: title, position, tech stack, description (truncated).
     */
    private String buildEmbeddingText(Job job) {
        StringBuilder sb = new StringBuilder();

        if (job.getTitle() != null) {
            sb.append("Vị trí: ").append(job.getTitle()).append(". ");
        }
        if (job.getPosition() != null) {
            sb.append("Chức danh: ").append(job.getPosition()).append(". ");
        }
        if (job.getSkills() != null && !job.getSkills().isEmpty()) {
            sb.append("Công nghệ: ").append(String.join(", ", job.getSkills())).append(". ");
        }
        if (job.getDescription() != null) {
            // Truncate description to first 500 chars to stay within embedding limits
            String desc = job.getDescription();
            if (desc.length() > 500) {
                desc = desc.substring(0, 500);
            }
            sb.append("Mô tả: ").append(desc).append(". ");
        }
        if (job.getExperienceLevel() != null) {
            sb.append("Kinh nghiệm: ").append(job.getExperienceLevel().name()).append(". ");
        }

        return sb.toString().trim();
    }
}
