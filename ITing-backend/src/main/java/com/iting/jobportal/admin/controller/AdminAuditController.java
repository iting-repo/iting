package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.response.AuditLogResponse;
import com.iting.jobportal.admin.service.AdminActivityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
@Tag(name = "Audit Management", description = "Admin APIs for system-wide activity logging")
public class AdminAuditController {

  private final AdminActivityLogService adminActivityLogService;

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Get system audit logs")
  public ResponseEntity<Page<AuditLogResponse>> getAuditLogs(
      @RequestParam(required = false) String category,
      @RequestParam(required = false) Long performerId,
      @RequestParam(required = false) String action,
      @RequestParam(required = false) String risk,
      @RequestParam(required = false) String search,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {

    // Mở rộng date (chỉ ngày) thành khoảng đầy đủ trong ngày.
    LocalDateTime from = dateFrom != null ? dateFrom.atStartOfDay() : null;
    LocalDateTime to = dateTo != null ? dateTo.atTime(LocalTime.MAX) : null;

    return ResponseEntity.ok(
        adminActivityLogService.getAuditLogs(
            category, performerId, action, risk, search, from, to, page, size));
  }

  @GetMapping("/categories")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Danh sách danh mục (entityType) thực tế để lọc")
  public ResponseEntity<List<String>> getCategories() {
    return ResponseEntity.ok(adminActivityLogService.getDistinctCategories());
  }

  @GetMapping("/export")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Xuất audit log ra CSV (theo bộ lọc hiện tại)")
  public ResponseEntity<byte[]> exportCsv(
      @RequestParam(required = false) String category,
      @RequestParam(required = false) Long performerId,
      @RequestParam(required = false) String action,
      @RequestParam(required = false) String risk,
      @RequestParam(required = false) String search,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {

    LocalDateTime from = dateFrom != null ? dateFrom.atStartOfDay() : null;
    LocalDateTime to = dateTo != null ? dateTo.atTime(LocalTime.MAX) : null;

    // Tối đa 10.000 dòng cho 1 lần xuất.
    List<AuditLogResponse> rows =
        adminActivityLogService
            .getAuditLogs(category, performerId, action, risk, search, from, to, 0, 10000)
            .getContent();

    String csv = buildCsv(rows);
    // BOM UTF-8 để Excel mở đúng tiếng Việt.
    byte[] bom = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
    byte[] body = csv.getBytes(StandardCharsets.UTF_8);
    byte[] out = new byte[bom.length + body.length];
    System.arraycopy(bom, 0, out, 0, bom.length);
    System.arraycopy(body, 0, out, bom.length, body.length);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
    headers.setContentDispositionFormData("attachment", "audit-logs.csv");
    return ResponseEntity.ok().headers(headers).body(out);
  }

  private String buildCsv(List<AuditLogResponse> rows) {
    StringBuilder sb = new StringBuilder();
    sb.append("Thời gian,Danh mục,Hành động,Mức rủi ro,Đối tượng,Người thực hiện,Vai trò,IP,Mô tả\n");
    for (AuditLogResponse r : rows) {
      sb.append(csv(r.getTimestamp() == null ? "" : r.getTimestamp().toString()))
          .append(',')
          .append(csv(r.getCategory()))
          .append(',')
          .append(csv(r.getAction()))
          .append(',')
          .append(csv(r.getRiskLevel()))
          .append(',')
          .append(csv(r.getTarget()))
          .append(',')
          .append(csv(r.getPerformer()))
          .append(',')
          .append(csv(r.getPerformerRole()))
          .append(',')
          .append(csv(r.getIp()))
          .append(',')
          .append(csv(r.getDetail()))
          .append('\n');
    }
    return sb.toString();
  }

  /** Escape 1 ô CSV: bọc nháy kép nếu chứa dấu phẩy/nháy/xuống dòng. */
  private String csv(String value) {
    if (value == null) return "";
    String v = value.replace("\"", "\"\"");
    if (v.contains(",") || v.contains("\"") || v.contains("\n") || v.contains("\r")) {
      return "\"" + v + "\"";
    }
    return v;
  }
}
