package com.iting.jobportal.userprofile.service.embedding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Tiện ích so khớp 2 vector hoặc 2 đoạn text qua HF AI Matching API.
 *
 * Endpoint:
 * <ul>
 *   <li>{@code POST /similarity} — 2 text qua Gemma</li>
 *   <li>{@code POST /similarity/minilm} — 2 text qua MiniLM</li>
 *   <li>{@code POST /similarity/vectors} — 2 vector có sẵn (không cần model)</li>
 * </ul>
 *
 * Trả về cosine score trong [0, 1].
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HuggingFaceSimilarityClient {

    private final ObjectMapper objectMapper;

    @Value("${huggingface.ai.base-url:https://deeatetee-ai-matching-api.hf.space}")
    private String baseUrl;

    @Value("${huggingface.ai.model:gemma}")
    private String model;

    @Value("${huggingface.ai.token:}")
    private String token;

    @Value("${huggingface.ai.timeout-seconds:30}")
    private long timeoutSeconds;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public Optional<Double> similarityOfTexts(String text1, String text2) {
        if (text1 == null || text2 == null || text1.isBlank() || text2.isBlank()) return Optional.empty();
        String path = "minilm".equalsIgnoreCase(model) ? "/similarity/minilm" : "/similarity";
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("text1", text1);
        payload.put("text2", text2);
        return post(path, payload);
    }

    public Optional<Double> similarityOfVectors(double[] v1, double[] v2) {
        if (v1 == null || v2 == null || v1.length == 0 || v2.length == 0) return Optional.empty();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("vector1", v1);
        payload.put("vector2", v2);
        return post("/similarity/vectors", payload);
    }

    private Optional<Double> post(String path, Map<String, Object> payload) {
        try {
            String base = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
            String body = objectMapper.writeValueAsString(payload);

            HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(base + path))
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body));
            if (token != null && !token.isBlank()) {
                builder.header("Authorization", "Bearer " + token);
                builder.header("X-API-Key", token);
            }

            HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                log.warn("HF similarity {} failed: status={} body={}", path, response.statusCode(),
                        truncate(response.body()));
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode scoreNode = root.path("similarity_score");
            if (scoreNode.isMissingNode() || !scoreNode.isNumber()) return Optional.empty();
            return Optional.of(scoreNode.asDouble());
        } catch (Exception e) {
            log.warn("HF similarity {} exception: {}", path, e.getMessage());
            return Optional.empty();
        }
    }

    private static String truncate(String s) {
        if (s == null) return "";
        return s.length() > 300 ? s.substring(0, 300) + "..." : s;
    }
}
