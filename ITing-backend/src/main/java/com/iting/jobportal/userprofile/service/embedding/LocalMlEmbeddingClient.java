package com.iting.jobportal.userprofile.service.embedding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;

/**
 * EmbeddingClient implementation gọi đến ai-matching FastAPI (local ML service).
 * 
 * Ưu tiên hơn OpenAiEmbeddingClient khi ml.service.enabled=true.
 * Gọi POST /embed với body {"text": "..."} → nhận về {embeddings: [[...]]}
 */
@Service
@Primary
@ConditionalOnProperty(name = "ml.service.enabled", havingValue = "true", matchIfMissing = false)
@RequiredArgsConstructor
@Slf4j
public class LocalMlEmbeddingClient implements EmbeddingClient {

    private final ObjectMapper objectMapper;

    @Value("${ml.service.url:http://localhost:7860}")
    private String mlServiceUrl;

    @Value("${ml.service.timeout:30}")
    private int timeout;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Override
    public Optional<double[]> embed(String input) {
        if (input == null || input.isBlank()) {
            return Optional.empty();
        }

        try {
            String url = mlServiceUrl.endsWith("/")
                    ? mlServiceUrl.substring(0, mlServiceUrl.length() - 1)
                    : mlServiceUrl;
            URI uri = URI.create(url + "/embed");

            // ai-matching expects {"text": "..."} for single text
            String body = objectMapper.writeValueAsString(Map.of("text", input));

            HttpRequest request = HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(timeout))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() / 100 != 2) {
                log.warn("ML service returned status {}: {}", response.statusCode(), response.body());
                return Optional.empty();
            }

            // Response: {"embeddings": [[0.1, 0.2, ...]], "dimension": 768, "num_texts": 1}
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode embeddingsNode = root.path("embeddings");

            if (!embeddingsNode.isArray() || embeddingsNode.isEmpty()) {
                log.warn("ML service returned empty embeddings");
                return Optional.empty();
            }

            // Lấy vector đầu tiên (single text → 1 embedding)
            JsonNode firstEmbedding = embeddingsNode.get(0);
            if (!firstEmbedding.isArray() || firstEmbedding.isEmpty()) {
                return Optional.empty();
            }

            double[] embedding = new double[firstEmbedding.size()];
            for (int i = 0; i < firstEmbedding.size(); i++) {
                embedding[i] = firstEmbedding.get(i).asDouble();
            }

            log.debug("Generated embedding via ML service: dimension={}", embedding.length);
            return Optional.of(embedding);

        } catch (Exception e) {
            log.error("Failed to call ML embedding service: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
