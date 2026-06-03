package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.DashboardStats;
import com.iting.jobportal.admin.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

  private final AdminDashboardService adminDashboardService;

  @GetMapping("/stats")
  public ResponseEntity<DashboardStats> getStats() {
    return ResponseEntity.ok(adminDashboardService.getDashboardStats());
  }
}
