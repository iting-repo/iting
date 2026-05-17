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

    @Value("${ml.service.api-key:}")
    private String apiKey;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    /**
     * Rerank impl on top of the current AI service (which does NOT expose a
     * dedicated /rerank endpoint). Strategy:
     *   1. Batch-embed [query, doc_1, ..., doc_N] in ONE /embed call (Gemma 300M)
     *   2. Compute cosine(query_vec, doc_i_vec) locally
     *   3. Return descending by score
     * This is bi-encoder rerank — less accurate than a cross-encoder but
     * acceptable for re-ordering an already-narrow shortlist.
     */
    @Override
    public List<RankedResult> rerank(String query, List<String> documents, List<Long> docIds) {
        if (!enabled || query == null || documents == null || documents.isEmpty()) {
            return List.of();
        }
        if (docIds == null || docIds.size() != documents.size()) {
            log.warn("rerank: docIds size mismatch with documents — skipping");
            return List.of();
        }

        long start = System.currentTimeMillis();
        try {
            List<String> texts = new ArrayList<>(documents.size() + 1);
            texts.add(query);
            texts.addAll(documents);

            JsonNode response = postRequest("/embed", Map.of("texts", texts));
            if (response == null) return List.of();

            JsonNode embeddings = response.get("embeddings");
            if (embeddings == null || !embeddings.isArray() || embeddings.size() < 2) {
                return List.of();
            }

            double[] queryVec = toVector(embeddings.get(0));
            List<RankedResult> ranked = new ArrayList<>();
            for (int i = 0; i < documents.size(); i++) {
                JsonNode docNode = embeddings.get(i + 1);
                if (docNode == null) continue;
                double score = cosine(queryVec, toVector(docNode));
                ranked.add(new RankedResult(docIds.get(i), score));
            }
            ranked.sort((a, b) -> Double.compare(b.score(), a.score()));

            log.info("✅ Bi-encoder reranked {} docs via /embed in {}ms",
                    documents.size(), System.currentTimeMillis() - start);
            return ranked;
        } catch (Exception e) {
            log.warn("⚠️ ML rerank failed (graceful degradation): {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * The current AI service does not expose a NER /extract-skills endpoint.
     * Returns empty list to preserve graceful behavior on callers; UI can
     * fall back to keyword-based skill parsing.
     */
    @Override
    public List<String> extractSkills(String text) {
        if (!enabled || text == null || text.isBlank()) {
            return List.of();
        }
        log.debug("extractSkills: AI service does not expose /extract-skills — returning empty");
        return List.of();
    }

    private static double[] toVector(JsonNode arr) {
        double[] v = new double[arr.size()];
        for (int i = 0; i < arr.size(); i++) v[i] = arr.get(i).asDouble();
        return v;
    }

    private static double cosine(double[] a, double[] b) {
        if (a.length != b.length || a.length == 0) return 0.0;
        double dot = 0, na = 0, nb = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        double denom = Math.sqrt(na) * Math.sqrt(nb);
        return denom == 0 ? 0.0 : dot / denom;
    }

    @Override
    public boolean isAvailable() {
        if (!enabled)
            return false;

        try {
            String url = normalizeUrl(mlServiceUrl) + "/health";
            HttpRequest.Builder reqBuilder = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(3))
                    .GET();
            if (apiKey != null && !apiKey.isBlank()) {
                reqBuilder.header("X-API-Key", apiKey);
            }

            HttpResponse<String> response = httpClient.send(reqBuilder.build(), HttpResponse.BodyHandlers.ofString());
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

            HttpRequest.Builder reqBuilder = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody));
            if (apiKey != null && !apiKey.isBlank()) {
                reqBuilder.header("X-API-Key", apiKey);
            }

            HttpResponse<String> response = httpClient.send(reqBuilder.build(), HttpResponse.BodyHandlers.ofString());

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
