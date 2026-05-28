package com.iting.jobportal.announcement.service.impl;

import com.iting.jobportal.announcement.dto.AnnouncementDto;
import com.iting.jobportal.announcement.entity.AnnouncementAck;
import com.iting.jobportal.announcement.entity.SystemAnnouncement;
import com.iting.jobportal.announcement.entity.enums.AnnouncementDisplayMode;
import com.iting.jobportal.announcement.repository.AnnouncementAckRepository;
import com.iting.jobportal.announcement.repository.SystemAnnouncementRepository;
import com.iting.jobportal.announcement.service.SystemAnnouncementService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class SystemAnnouncementServiceImpl implements SystemAnnouncementService {

  private final SystemAnnouncementRepository repo;
  private final AnnouncementAckRepository ackRepo;

  @Override
  @Transactional(readOnly = true)
  public List<AnnouncementDto> getActiveForUser(Long userId, String userRole, String currentRoute) {
    if (userId == null) return List.of();

    List<SystemAnnouncement> candidates = repo.findActiveForUser(userId, LocalDateTime.now());

    // Filter theo role + route, lấy 1 cái priority cao nhất
    return candidates.stream()
        .filter(a -> matchesRole(a.getTargetRoles(), userRole))
        .filter(a -> matchesRoute(a.getTriggerRoutes(), currentRoute))
        .limit(1)
        .map(AnnouncementDto::fromEntity)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public void ack(Long userId, Long announcementId) {
    if (userId == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
    }
    // Idempotent: nếu đã ack rồi thì bỏ qua
    if (ackRepo.existsByUserIdAndAnnouncementId(userId, announcementId)) return;
    // Verify announcement tồn tại
    if (!repo.existsById(announcementId)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Announcement không tồn tại");
    }
    ackRepo.save(
        AnnouncementAck.builder()
            .userId(userId)
            .announcementId(announcementId)
            .ackedAt(LocalDateTime.now())
            .build());
  }

  @Override
  @Transactional(readOnly = true)
  public Page<AnnouncementDto> list(Pageable pageable) {
    return repo.findAllByOrderByPriorityDescIdDesc(pageable).map(AnnouncementDto::fromEntity);
  }

  @Override
  @Transactional(readOnly = true)
  public AnnouncementDto get(Long id) {
    return repo.findById(id)
        .map(AnnouncementDto::fromEntity)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy"));
  }

  @Override
  @Transactional
  public AnnouncementDto create(AnnouncementDto dto, Long createdBy) {
    SystemAnnouncement a =
        SystemAnnouncement.builder()
            .title(dto.getTitle())
            .bodyHtml(dto.getBodyHtml())
            .imageUrl(dto.getImageUrl())
            .displayMode(
                dto.getDisplayMode() != null
                    ? dto.getDisplayMode()
                    : AnnouncementDisplayMode.MODAL_DISMISSIBLE)
            .requireAcknowledge(Boolean.TRUE.equals(dto.getRequireAcknowledge()))
            .targetRoles(joinCsv(dto.getTargetRoles(), "ALL"))
            .triggerRoutes(toJsonArray(dto.getTriggerRoutes()))
            .startAt(dto.getStartAt())
            .endAt(dto.getEndAt())
            .priority(dto.getPriority() != null ? dto.getPriority() : 0)
            .active(dto.getActive() == null || dto.getActive())
            .createdBy(createdBy)
            .build();
    return AnnouncementDto.fromEntity(repo.save(a));
  }

  @Override
  @Transactional
  public AnnouncementDto update(Long id, AnnouncementDto dto) {
    SystemAnnouncement a =
        repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy"));
    if (dto.getTitle() != null) a.setTitle(dto.getTitle());
    if (dto.getBodyHtml() != null) a.setBodyHtml(dto.getBodyHtml());
    if (dto.getImageUrl() != null) a.setImageUrl(dto.getImageUrl());
    if (dto.getDisplayMode() != null) a.setDisplayMode(dto.getDisplayMode());
    if (dto.getRequireAcknowledge() != null) a.setRequireAcknowledge(dto.getRequireAcknowledge());
    if (dto.getTargetRoles() != null) a.setTargetRoles(joinCsv(dto.getTargetRoles(), "ALL"));
    if (dto.getTriggerRoutes() != null) a.setTriggerRoutes(toJsonArray(dto.getTriggerRoutes()));
    if (dto.getStartAt() != null) a.setStartAt(dto.getStartAt());
    if (dto.getEndAt() != null) a.setEndAt(dto.getEndAt());
    if (dto.getPriority() != null) a.setPriority(dto.getPriority());
    if (dto.getActive() != null) a.setActive(dto.getActive());
    return AnnouncementDto.fromEntity(repo.save(a));
  }

  @Override
  @Transactional
  public void delete(Long id) {
    if (!repo.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy");
    }
    repo.deleteById(id);
  }

  // ─────────────────────────── Helpers ───────────────────────────

  private boolean matchesRole(String targetRoles, String userRole) {
    if (targetRoles == null || targetRoles.isBlank() || targetRoles.contains("ALL")) return true;
    if (userRole == null) return false;
    for (String r : targetRoles.split("\\s*,\\s*")) {
      if (r.equalsIgnoreCase(userRole)) return true;
    }
    return false;
  }

  /** Glob match: "*" trong pattern → ".*" regex. "/" exact match. "LOGIN" special token. */
  private boolean matchesRoute(String triggerRoutesJson, String currentRoute) {
    if (currentRoute == null) currentRoute = "/";
    if (triggerRoutesJson == null) return true;

    // Parse JSON array đơn giản
    String trimmed = triggerRoutesJson.trim();
    if (!trimmed.startsWith("[")) return globMatch(trimmed, currentRoute);

    String inner = trimmed.substring(1, Math.max(1, trimmed.length() - 1));
    if (inner.isBlank()) return false;
    for (String p : inner.split(",")) {
      String pat = p.trim();
      if (pat.startsWith("\"") && pat.endsWith("\"")) pat = pat.substring(1, pat.length() - 1);
      if (globMatch(pat, currentRoute)) return true;
    }
    return false;
  }

  /** Hỗ trợ "LOGIN" (route đặc biệt FE gửi sau login), "/" exact, "/jobs/*" glob. */
  private boolean globMatch(String pattern, String route) {
    if (pattern == null || route == null) return false;
    if (pattern.equals(route)) return true;
    // Glob → regex: thay * bằng .*, escape các ký tự đặc biệt khác
    String regex = Pattern.quote(pattern).replace("*", "\\E.*\\Q");
    try {
      return Pattern.matches(regex, route);
    } catch (Exception e) {
      return false;
    }
  }

  private String joinCsv(List<String> list, String defaultVal) {
    if (list == null || list.isEmpty()) return defaultVal;
    return String.join(",", list);
  }

  private String toJsonArray(List<String> list) {
    if (list == null || list.isEmpty()) return "[\"/\"]";
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < list.size(); i++) {
      if (i > 0) sb.append(",");
      sb.append("\"").append(list.get(i).replace("\"", "\\\"")).append("\"");
    }
    sb.append("]");
    return sb.toString();
  }
}
