package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.DetailedStatsDto;
import com.iting.jobportal.admin.service.AdminStatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
@Tag(name = "Admin Stats", description = "Admin APIs for detailed platform statistics")
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    @GetMapping("/detailed")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get detailed platform statistics")
    public ResponseEntity<DetailedStatsDto> getDetailedStats(
            @RequestParam(required = false, defaultValue = "7days") String dateRange) {
        return ResponseEntity.ok(adminStatsService.getDetailedStats(dateRange));
    }
}
