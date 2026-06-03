package com.iting.jobportal.userprofile.service.embedding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "openai", matchIfMissing = true)
@RequiredArgsConstructor
public class OpenAiEmbeddingClient implements EmbeddingClient {

  private final ObjectMapper objectMapper;

  @Value("${openai.api.key:}")
  private String apiKey;

  @Value("${openai.embedding.model:text-embedding-3-small}")
  private String embeddingModel;

  @Value("${openai.base-url:https://api.openai.com}")
  private String baseUrl;

  private final HttpClient httpClient =
      HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

  @Override
  public Optional<double[]> embed(String input) {
    if (apiKey == null || apiKey.isBlank()) return Optional.empty();
    if (input == null || input.isBlank()) return Optional.empty();

    try {
      String url = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
      URI uri = URI.create(url + "/v1/embeddings");

      String body =
          objectMapper.writeValueAsString(
              Map.of(
                  "model", embeddingModel,
                  "input", input));

      HttpRequest request =
          HttpRequest.newBuilder(uri)
              .timeout(Duration.ofSeconds(30))
              .header("Authorization", "Bearer " + apiKey)
              .header("Content-Type", "application/json")
              .POST(HttpRequest.BodyPublishers.ofString(body))
              .build();

      HttpResponse<String> response =
          httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() / 100 != 2) {
        return Optional.empty();
      }

      JsonNode root = objectMapper.readTree(response.body());
      JsonNode embeddingNode = root.path("data").path(0).path("embedding");
      if (!embeddingNode.isArray() || embeddingNode.isEmpty()) return Optional.empty();

      double[] embedding = new double[embeddingNode.size()];
      for (int i = 0; i < embeddingNode.size(); i++) {
        embedding[i] = embeddingNode.get(i).asDouble();
      }

      return Optional.of(embedding);
    } catch (Exception e) {
      return Optional.empty();
    }
  }
}
