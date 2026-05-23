package com.iting.jobportal.announcement.controller;

import com.iting.jobportal.announcement.dto.AnnouncementDto;
import com.iting.jobportal.announcement.service.SystemAnnouncementService;
import com.iting.jobportal.job.controller.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "13.1 System Announcements (Admin)")
@RestController
@RequestMapping("/api/admin/announcements")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminAnnouncementController {

    private final SystemAnnouncementService service;

    @GetMapping
    @Operation(summary = "List announcements (paginated)")
    public ResponseEntity<Page<AnnouncementDto>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(100, Math.max(1, size)));
        return ResponseEntity.ok(service.list(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get announcement detail")
    public ResponseEntity<AnnouncementDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PostMapping
    @Operation(summary = "Tạo announcement mới")
    public ResponseEntity<AnnouncementDto> create(
            @CurrentUser Long adminId,
            @RequestBody AnnouncementDto dto) {
        return ResponseEntity.ok(service.create(dto, adminId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật announcement (partial)")
    public ResponseEntity<AnnouncementDto> update(
            @PathVariable Long id,
            @RequestBody AnnouncementDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xoá announcement")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
