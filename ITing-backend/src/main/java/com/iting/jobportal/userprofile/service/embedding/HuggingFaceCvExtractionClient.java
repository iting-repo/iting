package com.iting.jobportal.userprofile.service.embedding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

/**
 * Gọi {@code POST /extract-cv} của Hugging Face AI Matching API để parse CV
 * (PDF/Image) thành JSON cấu trúc + (tuỳ chọn) embedding vector.
 *
 * Bean này luôn đăng ký (không phụ thuộc {@code ai.provider}) vì là tính năng
 * standalone, không thay thế cho EmbeddingClient chung.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HuggingFaceCvExtractionClient {

    private final ObjectMapper objectMapper;

    @Value("${huggingface.ai.base-url:https://deeatetee-ai-matching-api.hf.space}")
    private String baseUrl;

    @Value("${huggingface.ai.token:}")
    private String token;

    @Value("${huggingface.ai.timeout-seconds:60}")
    private long timeoutSeconds;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public record CvExtractionResult(String status, JsonNode extractedData, double[] embedding, String error) {
        public boolean isSuccess() {
            return "success".equalsIgnoreCase(status) && extractedData != null;
        }
    }

    public Optional<CvExtractionResult> extract(MultipartFile file) {
        if (file == null || file.isEmpty()) return Optional.empty();
        try {
            String boundary = "----IT-" + UUID.randomUUID().toString().replace("-", "");
            byte[] body = buildMultipartBody(boundary, file);

            HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(resolveEndpoint()))
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(body));
            if (token != null && !token.isBlank()) {
                builder.header("Authorization", "Bearer " + token);
                builder.header("X-API-Key", token);
            }

            HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                log.warn("HF extract-cv failed: status={} body={}", response.statusCode(), truncate(response.body()));
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(response.body());
            String status = root.path("status").asText(null);
            JsonNode extracted = root.path("extracted_data");
            String error = root.path("error").isMissingNode() ? null : root.path("error").asText(null);

            double[] embedding = null;
            JsonNode embeddingNode = root.path("embedding");
            if (embeddingNode.isArray() && !embeddingNode.isEmpty()) {
                embedding = new double[embeddingNode.size()];
                for (int i = 0; i < embeddingNode.size(); i++) {
                    embedding[i] = embeddingNode.get(i).asDouble();
                }
            }

            return Optional.of(new CvExtractionResult(
                    status,
                    extracted.isMissingNode() ? null : extracted,
                    embedding,
                    error));
        } catch (Exception e) {
            log.warn("HF extract-cv exception: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private String resolveEndpoint() {
        String base = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        return base + "/extract-cv";
    }

    private static byte[] buildMultipartBody(String boundary, MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "cv.pdf";
        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        String header = "--" + boundary + "\r\n"
                + "Content-Disposition: form-data; name=\"file\"; filename=\"" + originalName + "\"\r\n"
                + "Content-Type: " + contentType + "\r\n\r\n";
        out.write(header.getBytes(StandardCharsets.UTF_8));
        out.write(file.getBytes());
        out.write(("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
        return out.toByteArray();
    }

    private static String truncate(String s) {
        if (s == null) return "";
        return s.length() > 300 ? s.substring(0, 300) + "..." : s;
    }
}
