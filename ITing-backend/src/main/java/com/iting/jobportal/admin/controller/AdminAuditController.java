package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.response.AuditLogResponse;
import com.iting.jobportal.admin.service.AdminActivityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
      @RequestParam(required = false) String search,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {

    return ResponseEntity.ok(
        adminActivityLogService.getAuditLogs(category, performerId, action, search, page, size));
  }
}
