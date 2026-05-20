package com.iting.jobportal.userprofile.service.embedding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;

/**
 * Embedding client tới Hugging Face AI Matching API
 * (https://deeatetee-ai-matching-api.hf.space).
 *
 * Endpoint chọn theo property {@code huggingface.ai.model}:
 * <ul>
 *   <li>{@code gemma} (mặc định) → {@code POST /embed} — vector 768d cho CV/job matching.</li>
 *   <li>{@code minilm} → {@code POST /embed/minilm} — vector 384d cho behavior matching.</li>
 * </ul>
 *
 * Kích hoạt bằng {@code ai.provider=huggingface}. Khi đó bean này thay thế
 * {@link OpenAiEmbeddingClient}.
 */
@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "huggingface")
@RequiredArgsConstructor
@Slf4j
public class HuggingFaceEmbeddingClient implements EmbeddingClient {

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

    @Override
    public Optional<double[]> embed(String input) {
        if (input == null || input.isBlank()) return Optional.empty();

        try {
            URI uri = URI.create(resolveEndpoint());
            String body = objectMapper.writeValueAsString(Map.of("text", input));

            HttpRequest.Builder builder = HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body));
            if (token != null && !token.isBlank()) {
                builder.header("Authorization", "Bearer " + token);
                builder.header("X-API-KEY", token);
            }

            HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                log.warn("HF embed failed: status={} body={}", response.statusCode(), truncate(response.body()));
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode first = root.path("embeddings").path(0);
            if (!first.isArray() || first.isEmpty()) return Optional.empty();

            double[] vec = new double[first.size()];
            for (int i = 0; i < first.size(); i++) {
                vec[i] = first.get(i).asDouble();
            }
            return Optional.of(vec);
        } catch (Exception e) {
            log.warn("HF embed exception: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private String resolveEndpoint() {
        String base = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String path = "minilm".equalsIgnoreCase(model) ? "/embed/minilm" : "/embed";
        return base + path;
    }

    private static String truncate(String s) {
        if (s == null) return "";
        return s.length() > 300 ? s.substring(0, 300) + "..." : s;
    }
}
