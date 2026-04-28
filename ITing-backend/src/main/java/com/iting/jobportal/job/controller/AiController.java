package com.iting.jobportal.job.controller;

import com.iting.jobportal.common.service.KnowledgeGraphService;
import com.iting.jobportal.common.service.MlServiceClient;
import com.iting.jobportal.job.service.JobEmbeddingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "09. AI Services", description = "APIs cho Knowledge Graph, Embedding, NER và Explainability")
public class AiController {

    private final KnowledgeGraphService knowledgeGraphService;
    private final JobEmbeddingService jobEmbeddingService;
    private final MlServiceClient mlServiceClient;

    // ===== Phase 1: Knowledge Graph =====

    @GetMapping("/kg/expand")
    @Operation(summary = "Mở rộng từ khóa bằng Knowledge Graph")
    public ResponseEntity<Map<String, Object>> expandKeyword(@RequestParam String keyword) {
        Set<String> expanded = knowledgeGraphService.expandKeyword(keyword);
        Set<String> related = knowledgeGraphService.getRelatedSkills(keyword, 2);
        String normalized = knowledgeGraphService.normalize(keyword);

        return ResponseEntity.ok(Map.of(
                "original", keyword,
                "normalizedId", normalized != null ? normalized : "UNKNOWN",
                "expanded", expanded,
                "relatedSkills", related
        ));
    }

    // ===== Phase 5: Explainability =====

    @GetMapping("/kg/explain")
    @Operation(summary = "Giải thích matching giữa CV skills và JD skills qua Knowledge Graph")
    public ResponseEntity<Map<String, Object>> explainMatch(
            @RequestParam List<String> cvSkills,
            @RequestParam List<String> jdSkills) {
        List<String> explanations = knowledgeGraphService.explainMatch(cvSkills, jdSkills);
        return ResponseEntity.ok(Map.of(
                "cvSkills", cvSkills,
                "jdSkills", jdSkills,
                "explanations", explanations,
                "matchCount", explanations.size()
        ));
    }

    // ===== Phase 2: Embedding =====

    @PostMapping("/embedding/trigger")
    @Operation(summary = "Trigger batch embedding cho các job chưa có embedding")
    public ResponseEntity<Map<String, Object>> triggerEmbedding(
            @RequestParam(defaultValue = "50") int batchSize) {
        int count = jobEmbeddingService.embedMissingJobs(batchSize);
        return ResponseEntity.ok(Map.of(
                "processedCount", count,
                "batchSize", batchSize
        ));
    }

    // ===== Phase 3: ML Service Health =====

    @GetMapping("/ml/health")
    @Operation(summary = "Kiểm tra trạng thái Python ML Microservice")
    public ResponseEntity<Map<String, Object>> mlHealth() {
        boolean available = mlServiceClient.isAvailable();
        return ResponseEntity.ok(Map.of(
                "mlServiceAvailable", available,
                "status", available ? "CONNECTED" : "UNAVAILABLE"
        ));
    }

    // ===== Phase 4: Skill NER =====

    @PostMapping("/ner/extract")
    @Operation(summary = "Trích xuất kỹ năng IT từ văn bản (JD/CV)")
    public ResponseEntity<Map<String, Object>> extractSkills(@RequestBody Map<String, String> body) {
        String text = body.getOrDefault("text", "");
        if (text.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text is required"));
        }

        List<String> skills = mlServiceClient.extractSkills(text);
        return ResponseEntity.ok(Map.of(
                "skills", skills,
                "count", skills.size(),
                "source", mlServiceClient.isAvailable() ? "ML_SERVICE" : "UNAVAILABLE"
        ));
    }
}
