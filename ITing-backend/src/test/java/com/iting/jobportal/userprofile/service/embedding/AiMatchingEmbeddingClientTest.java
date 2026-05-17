package com.iting.jobportal.userprofile.service.embedding;

import com.fasterxml.jackson.databind.JsonNode;
import com.iting.jobportal.common.service.MlServiceClient;
import org.junit.jupiter.api.Test;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class AiMatchingEmbeddingClientTest {

    @Test
    void embedDelegatesToAiMatchingMlClient() {
        double[] expected = new double[] {0.7, 0.8};
        EmbeddingClient client = new AiMatchingEmbeddingClient(new StubMlServiceClient(expected));

        Optional<double[]> embedding = client.embed("Backend Java");

        assertThat(embedding).isPresent();
        assertThat(embedding.get()).containsExactly(expected);
    }

    private record StubMlServiceClient(double[] embedding) implements MlServiceClient {
        @Override
        public Optional<double[]> embed(String text) {
            return Optional.of(embedding);
        }

        @Override
        public Optional<JsonNode> extractCv(MultipartFile file) {
            return Optional.empty();
        }

        @Override
        public List<RankedResult> rerank(String query, List<String> documents, List<Long> docIds) {
            return List.of();
        }

        @Override
        public List<String> extractSkills(String text) {
            return List.of();
        }

        @Override
        public boolean isAvailable() {
            return true;
        }
    }
}
