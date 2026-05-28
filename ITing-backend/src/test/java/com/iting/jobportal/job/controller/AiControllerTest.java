package com.iting.jobportal.job.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

import com.iting.jobportal.common.service.KnowledgeGraphService;
import com.iting.jobportal.common.service.MlServiceClient;
import com.iting.jobportal.job.service.JobEmbeddingService;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class AiControllerTest {

  @Mock private KnowledgeGraphService knowledgeGraphService;
  @Mock private JobEmbeddingService jobEmbeddingService;
  @Mock private MlServiceClient mlServiceClient;

  @InjectMocks private AiController controller;

  // ── KG expand ────────────────────────────────────────────────────────

  @Test
  void expandKeyword_returnsAllFields() {
    when(knowledgeGraphService.expandKeyword("java")).thenReturn(Set.of("Java", "JVM"));
    when(knowledgeGraphService.getRelatedSkills("java", 2)).thenReturn(Set.of("Spring", "Maven"));
    when(knowledgeGraphService.normalize("java")).thenReturn("JAVA_LANG");

    ResponseEntity<Map<String, Object>> resp = controller.expandKeyword("java");

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    Map<String, Object> body = resp.getBody();
    assertEquals("java", body.get("original"));
    assertEquals("JAVA_LANG", body.get("normalizedId"));
    assertEquals(Set.of("Java", "JVM"), body.get("expanded"));
    assertEquals(Set.of("Spring", "Maven"), body.get("relatedSkills"));
  }

  @Test
  void expandKeyword_normalizeNull_returnsUnknown() {
    when(knowledgeGraphService.expandKeyword("xyz")).thenReturn(Set.of());
    when(knowledgeGraphService.getRelatedSkills("xyz", 2)).thenReturn(Set.of());
    when(knowledgeGraphService.normalize("xyz")).thenReturn(null);

    Map<String, Object> body = controller.expandKeyword("xyz").getBody();

    assertEquals("UNKNOWN", body.get("normalizedId"));
  }

  // ── KG explain ──────────────────────────────────────────────────────

  @Test
  void explainMatch_returnsExplanationsWithCount() {
    List<String> cv = List.of("java", "spring");
    List<String> jd = List.of("java", "kafka");
    List<String> explanations = List.of("java exact match");
    when(knowledgeGraphService.explainMatch(cv, jd)).thenReturn(explanations);

    ResponseEntity<Map<String, Object>> resp = controller.explainMatch(cv, jd);

    Map<String, Object> body = resp.getBody();
    assertEquals(cv, body.get("cvSkills"));
    assertEquals(jd, body.get("jdSkills"));
    assertEquals(explanations, body.get("explanations"));
    assertEquals(1, body.get("matchCount"));
  }

  @Test
  void explainMatch_noMatch_countZero() {
    when(knowledgeGraphService.explainMatch(List.of("a"), List.of("b"))).thenReturn(List.of());

    Map<String, Object> body = controller.explainMatch(List.of("a"), List.of("b")).getBody();
    assertEquals(0, body.get("matchCount"));
  }

  // ── Embedding trigger ───────────────────────────────────────────────

  @Test
  void triggerEmbedding_passesBatchSize() {
    when(jobEmbeddingService.embedMissingJobs(50)).thenReturn(30);

    Map<String, Object> body = controller.triggerEmbedding(50).getBody();

    assertEquals(30, body.get("processedCount"));
    assertEquals(50, body.get("batchSize"));
  }

  @Test
  void triggerEmbedding_zeroProcessed_returnsZero() {
    when(jobEmbeddingService.embedMissingJobs(100)).thenReturn(0);

    Map<String, Object> body = controller.triggerEmbedding(100).getBody();
    assertEquals(0, body.get("processedCount"));
  }

  // ── ML health ────────────────────────────────────────────────────────

  @Test
  void mlHealth_available() {
    when(mlServiceClient.isAvailable()).thenReturn(true);

    Map<String, Object> body = controller.mlHealth().getBody();

    assertEquals(true, body.get("mlServiceAvailable"));
    assertEquals("CONNECTED", body.get("status"));
  }

  @Test
  void mlHealth_unavailable() {
    when(mlServiceClient.isAvailable()).thenReturn(false);

    Map<String, Object> body = controller.mlHealth().getBody();
    assertEquals(false, body.get("mlServiceAvailable"));
    assertEquals("UNAVAILABLE", body.get("status"));
  }

  // ── Skill NER ────────────────────────────────────────────────────────

  @Test
  void extractSkills_validText_returnsSkillsAndCount() {
    when(mlServiceClient.extractSkills("Need Java + Spring developer"))
        .thenReturn(List.of("Java", "Spring"));
    when(mlServiceClient.isAvailable()).thenReturn(true);

    ResponseEntity<Map<String, Object>> resp =
        controller.extractSkills(Map.of("text", "Need Java + Spring developer"));

    Map<String, Object> body = resp.getBody();
    assertEquals(List.of("Java", "Spring"), body.get("skills"));
    assertEquals(2, body.get("count"));
    assertEquals("ML_SERVICE", body.get("source"));
  }

  @Test
  void extractSkills_mlUnavailable_sourceUnavailable() {
    when(mlServiceClient.extractSkills("text")).thenReturn(List.of("Java"));
    when(mlServiceClient.isAvailable()).thenReturn(false);

    Map<String, Object> body = controller.extractSkills(Map.of("text", "text")).getBody();

    assertEquals("UNAVAILABLE", body.get("source"));
  }

  @Test
  void extractSkills_blankText_returns400() {
    ResponseEntity<Map<String, Object>> resp = controller.extractSkills(Map.of("text", ""));

    assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
    assertEquals("Text is required", resp.getBody().get("error"));
  }

  @Test
  void extractSkills_missingTextKey_returns400() {
    ResponseEntity<Map<String, Object>> resp = controller.extractSkills(Map.of());

    assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
    assertNotNull(resp.getBody().get("error"));
  }
}
