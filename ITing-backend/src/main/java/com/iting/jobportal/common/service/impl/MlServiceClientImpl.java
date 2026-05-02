package com.iting.jobportal.common.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.common.service.MlServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

/**
 * HTTP client implementation for the Python ML microservice.
 * Communicates via REST API with FastAPI service.
 * Gracefully degrades if ML service is unavailable (returns empty results).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MlServiceClientImpl implements MlServiceClient {

    private final ObjectMapper objectMapper;

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    @Value("${ml.service.timeout:30}")
    private int timeoutSeconds;

    @Value("${ml.service.enabled:true}")
    private boolean enabled;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Override
    public List<RankedResult> rerank(String query, List<String> documents, List<Long> docIds) {
        if (!enabled || query == null || documents == null || documents.isEmpty()) {
            return List.of();
        }

        try {
            Map<String, Object> body = Map.of(
                    "query", query,
                    "documents", documents,
                    "doc_ids", docIds);

            JsonNode response = postRequest("/rerank", body);
            if (response == null)
                return List.of();

            JsonNode results = response.get("results");
            if (results == null || !results.isArray())
                return List.of();

            List<RankedResult> ranked = new ArrayList<>();
            for (JsonNode item : results) {
                long id = item.get("id").asLong();
                double score = item.get("score").asDouble();
                ranked.add(new RankedResult(id, score));
            }

            double latency = response.has("latency_ms") ? response.get("latency_ms").asDouble() : 0;
            log.info("✅ Cross-Encoder reranked {} docs in {}ms", documents.size(), latency);

            return ranked;
        } catch (Exception e) {
            log.warn("⚠️ ML rerank failed (graceful degradation): {}", e.getMessage());
            return List.of();
        }
    }

    @Override
    public List<String> extractSkills(String text) {
        if (!enabled || text == null || text.isBlank()) {
            return List.of();
        }

        try {
            Map<String, Object> body = Map.of("text", text);

            JsonNode response = postRequest("/extract-skills", body);
            if (response == null)
                return List.of();

            JsonNode skills = response.get("skills");
            if (skills == null || !skills.isArray())
                return List.of();

            List<String> result = new ArrayList<>();
            for (JsonNode skill : skills) {
                result.add(skill.asText());
            }

            log.info("✅ Extracted {} skills from text", result.size());
            return result;
        } catch (Exception e) {
            log.warn("⚠️ ML skill extraction failed: {}", e.getMessage());
            return List.of();
        }
    }

    @Override
    public boolean isAvailable() {
        if (!enabled)
            return false;

        try {
            String url = normalizeUrl(mlServiceUrl) + "/health";
            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(3))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() == 200;
        } catch (Exception e) {
            return false;
        }
    }

    // ─── Internal helpers ──────────────────────────────────

    private JsonNode postRequest(String path, Map<String, Object> body) {
        try {
            String url = normalizeUrl(mlServiceUrl) + path;
            String jsonBody = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() / 100 != 2) {
                log.warn("ML service returned {}: {}", response.statusCode(), response.body());
                return null;
            }

            return objectMapper.readTree(response.body());
        } catch (java.net.ConnectException e) {
            log.debug("ML service not available at {} (connection refused)", mlServiceUrl);
            return null;
        } catch (Exception e) {
            log.warn("ML service request to {} failed: {}", path, e.getMessage());
            return null;
        }
    }

    private String normalizeUrl(String url) {
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
