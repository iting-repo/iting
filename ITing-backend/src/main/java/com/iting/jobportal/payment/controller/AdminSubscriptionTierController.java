package com.iting.jobportal.payment.controller;

import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.payment.dto.SubscriberRow;
import com.iting.jobportal.payment.dto.SubscriptionTierCreateRequest;
import com.iting.jobportal.payment.dto.SubscriptionTierUpdateRequest;
import com.iting.jobportal.payment.entity.SubscriptionTierPricing;
import com.iting.jobportal.payment.service.SubscriptionPricingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Admin quản lý giá / quyền lợi / quota của các gói HR Premium. */
@RestController
@RequestMapping("/api/admin/subscription-tiers")
@RequiredArgsConstructor
@Tag(name = "Admin Subscription Tiers", description = "Quản lý giá gói HR Premium")
public class AdminSubscriptionTierController {

  private final SubscriptionPricingService pricingService;
  private final JwtTokenUtil jwtTokenUtil;

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Danh sách tất cả gói HR kèm giá hiệu lực")
  public ResponseEntity<List<SubscriptionTierPricing>> list() {
    return ResponseEntity.ok(pricingService.listAll());
  }

  @GetMapping("/subscribers")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(
      summary = "Danh sách người đăng ký — tài khoản nào đang đăng ký gói nào + công ty trực thuộc")
  public ResponseEntity<List<SubscriberRow>> subscribers(
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String tier) {
    return ResponseEntity.ok(pricingService.listSubscribers(status, tier));
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Tạo gói HR mới")
  public ResponseEntity<SubscriptionTierPricing> create(
      @RequestBody SubscriptionTierCreateRequest req, HttpServletRequest request) {
    Long adminId = jwtTokenUtil.getUserIdFromHeader(request);
    return ResponseEntity.ok(pricingService.create(req, adminId));
  }

  @PutMapping("/{code}")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Cập nhật giá / quyền lợi / quota của một gói HR")
  public ResponseEntity<SubscriptionTierPricing> update(
      @PathVariable String code,
      @RequestBody SubscriptionTierUpdateRequest req,
      HttpServletRequest request) {
    Long adminId = jwtTokenUtil.getUserIdFromHeader(request);
    return ResponseEntity.ok(pricingService.update(code, req, adminId));
  }

  @DeleteMapping("/{code}")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Xóa một gói HR (chặn nếu đã có HR đăng ký)")
  public ResponseEntity<Void> delete(@PathVariable String code, HttpServletRequest request) {
    Long adminId = jwtTokenUtil.getUserIdFromHeader(request);
    pricingService.delete(code, adminId);
    return ResponseEntity.noContent().build();
  }
}
