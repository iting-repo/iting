package com.iting.jobportal.common.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.common.service.MlServiceClient;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class MlServiceClientImplTest {

    private HttpServer server;

    @AfterEach
    void stopServer() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void embedCallsAiMatchingEmbedEndpointAndReadsFirstEmbedding() throws Exception {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/embed", exchange -> {
            String requestBody = readBody(exchange);
            assertThat(requestBody).contains("\"text\":\"Java Spring Boot\"");
            respondJson(exchange, 200, """
                    {
                      "embeddings": [[0.1, 0.2, 0.3]],
                      "dimension": 3,
                      "num_texts": 1
                    }
                    """);
        });
        server.start();

        MlServiceClient client = newClient();

        Optional<double[]> embedding = client.embed("Java Spring Boot");

        assertThat(embedding).isPresent();
        assertThat(embedding.get()).containsExactly(0.1, 0.2, 0.3);
    }

    @Test
    void extractCvPostsMultipartFileToAiMatchingAndReturnsJsonResponse() throws Exception {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/extract-cv", exchange -> {
            String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            String requestBody = readBody(exchange);

            assertThat(contentType).contains("multipart/form-data; boundary=");
            assertThat(requestBody).contains("name=\"file\"");
            assertThat(requestBody).contains("filename=\"cv.pdf\"");
            assertThat(requestBody).contains("fake-pdf-content");

            respondJson(exchange, 200, """
                    {
                      "status": "ok",
                      "extracted_data": {"skills": ["Java", "Spring Boot"]},
                      "embedding": [0.4, 0.5],
                      "dimension": 2
                    }
                    """);
        });
        server.start();

        MlServiceClient client = newClient();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "cv.pdf",
                "application/pdf",
                "fake-pdf-content".getBytes(StandardCharsets.UTF_8)
        );

        Optional<JsonNode> response = client.extractCv(file);

        assertThat(response).isPresent();
        assertThat(response.get().path("status").asText()).isEqualTo("ok");
        assertThat(response.get().path("embedding").get(0).asDouble()).isEqualTo(0.4);
    }

    private MlServiceClientImpl newClient() {
        MlServiceClientImpl client = new MlServiceClientImpl(new ObjectMapper());
        ReflectionTestUtils.setField(client, "mlServiceUrl", "http://localhost:" + server.getAddress().getPort());
        ReflectionTestUtils.setField(client, "timeoutSeconds", 5);
        ReflectionTestUtils.setField(client, "enabled", true);
        return client;
    }

    private static String readBody(HttpExchange exchange) throws IOException {
        return new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
    }

    private static void respondJson(HttpExchange exchange, int status, String json) throws IOException {
        byte[] response = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, response.length);
        exchange.getResponseBody().write(response);
        exchange.close();
    }
}
