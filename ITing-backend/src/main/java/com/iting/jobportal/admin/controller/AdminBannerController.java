package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.entity.Banner;
import com.iting.jobportal.admin.entity.SystemConfig;
import com.iting.jobportal.admin.repository.BannerRepository;
import com.iting.jobportal.admin.repository.SystemConfigRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
@Tag(name = "Admin Banners", description = "Admin Banner Management")
public class AdminBannerController {

  /** Banner quảng cáo — loại bị giới hạn số lượng bật cùng lúc. */
  private static final String TYPE_ADVERTISEMENT = "ADVERTISEMENT";

  private static final String STATUS_ACTIVE = "ACTIVE";

  /** Giới hạn mặc định nếu chưa cấu hình. */
  private static final int DEFAULT_AD_LIMIT = 5;

  private final BannerRepository bannerRepository;
  private final SystemConfigRepository systemConfigRepository;

  /** Đọc giới hạn banner quảng cáo từ config (mặc định {@link #DEFAULT_AD_LIMIT}). */
  private int getAdLimit() {
    return systemConfigRepository
        .findFirstByOrderByIdAsc()
        .map(SystemConfig::getBannerAdLimit)
        .filter(v -> v != null && v > 0)
        .orElse(DEFAULT_AD_LIMIT);
  }

  /**
   * Chặn vượt quá giới hạn banner QUẢNG CÁO (ADVERTISEMENT) đang bật. Chỉ kiểm tra khi banner đích là
   * ADVERTISEMENT + ACTIVE. {@code excludeId} bỏ qua chính banner đang sửa/bật để không đếm trùng.
   */
  private void enforceAdLimit(String bannerType, String status, Long excludeId) {
    String type = bannerType == null ? TYPE_ADVERTISEMENT : bannerType;
    if (!TYPE_ADVERTISEMENT.equals(type) || !STATUS_ACTIVE.equals(status)) {
      return;
    }
    int limit = getAdLimit();
    long activeCount =
        (excludeId == null)
            ? bannerRepository.countByBannerTypeAndStatus(TYPE_ADVERTISEMENT, STATUS_ACTIVE)
            : bannerRepository.countByBannerTypeAndStatusAndIdNot(
                TYPE_ADVERTISEMENT, STATUS_ACTIVE, excludeId);
    if (activeCount >= limit) {
      throw new IllegalArgumentException(
          "Đã đạt giới hạn tối đa "
              + limit
              + " banner Quảng cáo đang bật. Hãy tắt bớt banner khác hoặc tăng giới hạn.");
    }
  }

  @GetMapping("/ad-limit")
  @Operation(summary = "Lấy giới hạn banner quảng cáo + số đang bật")
  public ResponseEntity<Map<String, Object>> getAdLimitInfo() {
    long active = bannerRepository.countByBannerTypeAndStatus(TYPE_ADVERTISEMENT, STATUS_ACTIVE);
    return ResponseEntity.ok(Map.of("limit", getAdLimit(), "active", active));
  }

  @PutMapping("/ad-limit")
  @Operation(summary = "Cập nhật giới hạn banner quảng cáo")
  public ResponseEntity<Map<String, Object>> updateAdLimit(@RequestParam int limit) {
    if (limit < 1 || limit > 50) {
      throw new IllegalArgumentException("Giới hạn phải trong khoảng 1–50");
    }
    SystemConfig cfg =
        systemConfigRepository.findFirstByOrderByIdAsc().orElseGet(SystemConfig::new);
    cfg.setBannerAdLimit(limit);
    systemConfigRepository.save(cfg);
    long active = bannerRepository.countByBannerTypeAndStatus(TYPE_ADVERTISEMENT, STATUS_ACTIVE);
    return ResponseEntity.ok(Map.of("limit", limit, "active", active));
  }

  @GetMapping
  @Operation(summary = "Get all banners")
  public ResponseEntity<List<Banner>> getAllBanners() {
    return ResponseEntity.ok(bannerRepository.findAll());
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get banner by ID")
  public ResponseEntity<Banner> getBanner(@PathVariable Long id) {
    return bannerRepository
        .findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping
  @Operation(summary = "Create a new banner")
  public ResponseEntity<Banner> createBanner(@RequestBody Banner banner) {
    if (banner.getStatus() == null) {
      banner.setStatus(STATUS_ACTIVE);
    }
    if (banner.getPriority() == null) {
      banner.setPriority(0);
    }
    if (banner.getBannerType() == null) {
      banner.setBannerType(TYPE_ADVERTISEMENT);
    }
    enforceAdLimit(banner.getBannerType(), banner.getStatus(), null);
    return ResponseEntity.ok(bannerRepository.save(banner));
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update a banner")
  public ResponseEntity<Banner> updateBanner(
      @PathVariable Long id, @RequestBody Banner bannerDetails) {
    return bannerRepository
        .findById(id)
        .map(
            banner -> {
              String newType =
                  bannerDetails.getBannerType() != null
                      ? bannerDetails.getBannerType()
                      : banner.getBannerType();
              enforceAdLimit(newType, bannerDetails.getStatus(), banner.getId());
              banner.setTitle(bannerDetails.getTitle());
              banner.setPosition(bannerDetails.getPosition());
              banner.setImageDesktop(bannerDetails.getImageDesktop());
              banner.setImageMobile(bannerDetails.getImageMobile());
              banner.setLink(bannerDetails.getLink());
              banner.setStartAt(bannerDetails.getStartAt());
              banner.setEndAt(bannerDetails.getEndAt());
              banner.setPriority(bannerDetails.getPriority());
              banner.setStatus(bannerDetails.getStatus());
              if (bannerDetails.getBannerType() != null) {
                banner.setBannerType(bannerDetails.getBannerType());
              }
              return ResponseEntity.ok(bannerRepository.save(banner));
            })
        .orElse(ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete a banner")
  public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
    return bannerRepository
        .findById(id)
        .map(
            banner -> {
              bannerRepository.delete(banner);
              return ResponseEntity.ok().build();
            })
        .orElse(ResponseEntity.notFound().build());
  }

  @PatchMapping("/{id}/status")
  @Operation(summary = "Toggle banner status")
  public ResponseEntity<Banner> toggleBannerStatus(
      @PathVariable Long id, @RequestParam String status) {
    return bannerRepository
        .findById(id)
        .map(
            banner -> {
              enforceAdLimit(banner.getBannerType(), status, banner.getId());
              banner.setStatus(status);
              return ResponseEntity.ok(bannerRepository.save(banner));
            })
        .orElse(ResponseEntity.notFound().build());
  }
}
