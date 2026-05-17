package com.iting.jobportal.userprofile.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.common.service.MlServiceClient;
import com.iting.jobportal.userprofile.dto.response.CVResponse;
import com.iting.jobportal.userprofile.service.CVService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class CVControllerTest {

    @Test
    void parseCvReturnsAiMatchingExtractionResponse() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode aiResponse = objectMapper.readTree("""
                {
                  "status": "ok",
                  "extracted_data": {"skills": ["Java"]},
                  "embedding": [0.1]
                }
                """);
        CVController controller = new CVController(new NoopCvService(), new StubMlServiceClient(aiResponse));
        MockMultipartFile file = new MockMultipartFile("file", "cv.pdf", "application/pdf", "pdf".getBytes());

        ResponseEntity<?> response = controller.parseCV(1L, file);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isSameAs(aiResponse);
    }

    private static class NoopCvService implements CVService {
        @Override
        public List<CVResponse> getRecentCVs(Long userId) {
            return List.of();
        }

        @Override
        public CVResponse uploadCV(Long userId, MultipartFile file, String title) {
            return null;
        }

        @Override
        public void manageUserCVLimit(Long userId) {
        }
    }

    private record StubMlServiceClient(JsonNode cvResponse) implements MlServiceClient {
        @Override
        public Optional<double[]> embed(String text) {
            return Optional.empty();
        }

        @Override
        public Optional<JsonNode> extractCv(MultipartFile file) {
            return Optional.of(cvResponse);
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
