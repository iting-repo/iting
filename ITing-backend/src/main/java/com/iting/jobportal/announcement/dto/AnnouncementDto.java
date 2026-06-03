package com.iting.jobportal.announcement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.iting.jobportal.announcement.entity.SystemAnnouncement;
import com.iting.jobportal.announcement.entity.enums.AnnouncementDisplayMode;
import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementDto {
  private Long id;
  private String title;
  private String bodyHtml;
  private String imageUrl;
  private AnnouncementDisplayMode displayMode;
  private Boolean requireAcknowledge;
  private List<String> targetRoles;
  private List<String> triggerRoutes;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
  private LocalDateTime startAt;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
  private LocalDateTime endAt;

  private Integer priority;
  private Boolean active;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public static AnnouncementDto fromEntity(SystemAnnouncement a) {
    return AnnouncementDto.builder()
        .id(a.getId())
        .title(a.getTitle())
        .bodyHtml(a.getBodyHtml())
        .imageUrl(a.getImageUrl())
        .displayMode(a.getDisplayMode())
        .requireAcknowledge(a.getRequireAcknowledge())
        .targetRoles(splitCsv(a.getTargetRoles()))
        .triggerRoutes(parseJsonArray(a.getTriggerRoutes()))
        .startAt(a.getStartAt())
        .endAt(a.getEndAt())
        .priority(a.getPriority())
        .active(a.getActive())
        .createdAt(a.getCreatedAt())
        .updatedAt(a.getUpdatedAt())
        .build();
  }

  private static List<String> splitCsv(String csv) {
    if (csv == null || csv.isBlank()) return List.of("ALL");
    return List.of(csv.split("\\s*,\\s*"));
  }

  /** Tối giản — parse "[\"/\", \"/jobs/*\"]" không cần Jackson. */
  private static List<String> parseJsonArray(String json) {
    if (json == null || json.isBlank()) return List.of("/");
    String trimmed = json.trim();
    if (!trimmed.startsWith("[")) return List.of(trimmed);
    String inner = trimmed.substring(1, Math.max(1, trimmed.length() - 1));
    if (inner.isBlank()) return List.of();
    String[] parts = inner.split(",");
    java.util.List<String> out = new java.util.ArrayList<>();
    for (String p : parts) {
      String s = p.trim();
      if (s.startsWith("\"") && s.endsWith("\"")) s = s.substring(1, s.length() - 1);
      if (!s.isEmpty()) out.add(s);
    }
    return out;
  }
}
