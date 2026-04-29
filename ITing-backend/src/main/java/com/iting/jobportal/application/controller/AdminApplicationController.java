package com.iting.jobportal.application.controller;

import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.service.AdminApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@Tag(name = "08.3 Application Admin", description = "APIs for admin to manage all applications")
@RestController
@RequestMapping("/api/admin/applications")
@RequiredArgsConstructor
public class AdminApplicationController {

    private final AdminApplicationService adminApplicationService;

    @GetMapping
    @Operation(summary = "Lấy tất cả đơn ứng tuyển của hệ thống")
    public ResponseEntity<Page<ApplicationResponse>> getAllSystemApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminApplicationService.getAllSystemApplications(page, size));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa đơn ứng tuyển khỏi hệ thống")
    public ResponseEntity<?> deleteApplication(@PathVariable Long id) {
        adminApplicationService.deleteApplication(id);
        return ResponseEntity.ok(Map.of("message", "Deleted application"));
    }
}
