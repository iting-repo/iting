package com.iting.jobportal.admin.controller;

import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.company.entity.CompanyReview;
import com.iting.jobportal.company.repository.CompanyReviewRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Admin-only company review moderation endpoints.
 *
 * <ul>
 *   <li>GET /api/admin/reviews?status=PENDING&page=0&size=20
 *   <li>GET /api/admin/reviews/counts — counts per status
 *   <li>POST /api/admin/reviews/{id}/approve
 *   <li>POST /api/admin/reviews/{id}/reject?note=...
 * </ul>
 */
@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewModerationController {

  private final CompanyReviewRepository reviewRepository;
  private final JwtTokenUtil jwtTokenUtil;

  @GetMapping
  public ResponseEntity<Page<Map<String, Object>>> list(
      @RequestParam(defaultValue = "PENDING") String status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {

    Page<CompanyReview> p =
        reviewRepository.findByModerationStatusOrderByCreatedAtDesc(
            status.toUpperCase(), PageRequest.of(page, size));
    return ResponseEntity.ok(p.map(this::toDto));
  }

  @GetMapping("/counts")
  public ResponseEntity<Map<String, Long>> counts() {
    Map<String, Long> m = new LinkedHashMap<>();
    m.put("PENDING", reviewRepository.countByModerationStatus("PENDING"));
    m.put("APPROVED", reviewRepository.countByModerationStatus("APPROVED"));
    m.put("REJECTED", reviewRepository.countByModerationStatus("REJECTED"));
    return ResponseEntity.ok(m);
  }

  @PostMapping("/{id}/approve")
  public ResponseEntity<Map<String, String>> approve(
      @PathVariable Long id, HttpServletRequest request) {
    Long adminId = jwtTokenUtil.getUserIdFromHeader(request);
    CompanyReview r =
        reviewRepository
            .findById(id)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review không tồn tại"));
    r.setModerationStatus("APPROVED");
    r.setModeratedAt(LocalDateTime.now());
    r.setModeratedBy(adminId);
    r.setModeratorNote(null);
    reviewRepository.save(r);
    return ResponseEntity.ok(Map.of("message", "Đã duyệt review #" + id));
  }

  @PostMapping("/{id}/reject")
  public ResponseEntity<Map<String, String>> reject(
      @PathVariable Long id,
      @RequestParam(required = false) String note,
      HttpServletRequest request) {
    Long adminId = jwtTokenUtil.getUserIdFromHeader(request);
    CompanyReview r =
        reviewRepository
            .findById(id)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review không tồn tại"));
    r.setModerationStatus("REJECTED");
    r.setModeratedAt(LocalDateTime.now());
    r.setModeratedBy(adminId);
    r.setModeratorNote(note);
    reviewRepository.save(r);
    return ResponseEntity.ok(Map.of("message", "Đã từ chối review #" + id));
  }

  private Map<String, Object> toDto(CompanyReview r) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", r.getId());
    m.put("companyId", r.getCompany() != null ? r.getCompany().getId() : null);
    m.put("companyName", r.getCompany() != null ? r.getCompany().getName() : null);
    m.put("authorEmail", r.getAccount() != null ? r.getAccount().getEmail() : null);
    m.put("title", r.getTitle());
    m.put("rating", r.getRating());
    m.put("content", r.getContent());
    m.put("pros", r.getPros());
    m.put("cons", r.getCons());
    m.put("workType", r.getWorkType());
    m.put("jobTitle", r.getJobTitle());
    m.put("isAnonymous", r.getIsAnonymous());
    m.put("helpfulCount", r.getHelpfulCount());
    m.put("reportCount", r.getReportCount());
    m.put("moderationStatus", r.getModerationStatus());
    m.put("moderatorNote", r.getModeratorNote());
    m.put("moderatedAt", r.getModeratedAt());
    m.put("createdAt", r.getCreatedAt());
    return m;
  }
}
