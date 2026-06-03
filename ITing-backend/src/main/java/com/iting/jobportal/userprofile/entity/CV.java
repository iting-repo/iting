package com.iting.jobportal.userprofile.entity;

import com.iting.jobportal.userprofile.entity.enums.CvStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "CV")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CV {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "profile_id", nullable = false)
  @com.fasterxml.jackson.annotation.JsonIgnore
  private UserProfile profile;

  @Column(name = "Title", length = 255)
  private String title;

  @Column(name = "File_name", length = 255)
  private String fileName;

  @Column(name = "File_path", columnDefinition = "TEXT", nullable = false)
  private String fileUrl;

  @Column(name = "S3_key", length = 500)
  private String s3Key;

  @Enumerated(EnumType.STRING)
  @Column(name = "Cv_status", length = 50)
  private CvStatus cvStatus;

    @Column(name = "Is_default")
    @Builder.Default
    private Boolean isDefault = false;

  @Column(name = "Upload_time")
  private LocalDateTime uploadedAt;

  /**
   * Vector embedding (vd 768-d) sinh từ nội dung CV (parse PDF/DOCX → text → HF/OpenAI). Dùng cho
   * candidate ↔ job similarity matching. NULL khi chưa parse xong. Lưu dạng JSON array: "[0.0123,
   * -0.0456, ...]".
   */
  @Column(name = "Cv_embedding", columnDefinition = "TEXT")
  private String cvEmbedding;

  @Column(name = "embedding_updated_at")
  private LocalDateTime embeddingUpdatedAt;

    /**
     * JSON output của HF /extract-cv: skills, experience, education,
     * personal info đã được AI parse từ file CV. Dùng để pre-fill
     * UserProfile form hoặc hiển thị tóm tắt. NULL nếu chưa parse.
     */
    @Column(name = "extracted_data_json", columnDefinition = "TEXT")
    private String extractedDataJson;

    /** LLM-evaluated CV quality score (0–100), NULL if not yet scored. */
    @Column(name = "overall_score")
    private Integer overallScore;

    /**
     * Full rubric breakdown as JSON string.
     * Keys: overall_score, score_breakdown (5 dims), strengths, improvement_areas,
     * critical_issues, recommendations, evaluation_summary.
     */
    @Column(name = "score_json", columnDefinition = "TEXT")
    private String scoreJson;

    /** Timestamp when the score was computed. */
    @Column(name = "scored_at")
    private LocalDateTime scoredAt;
}
