package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.entity.Banner;
import com.iting.jobportal.admin.repository.BannerRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
@Tag(name = "Admin Banners", description = "Admin Banner Management")
public class AdminBannerController {

  /** Vị trí hero carousel trang chủ. */
  private static final String HOMEPAGE_POSITION = "homepage_main";

  private static final String STATUS_ACTIVE = "ACTIVE";

  /** Giới hạn số banner đang bật ở carousel trang chủ — tránh vòng xoay quá dài. */
  private static final int MAX_HOMEPAGE_ACTIVE = 5;

  private final BannerRepository bannerRepository;

  /**
   * Chặn vượt quá {@link #MAX_HOMEPAGE_ACTIVE} banner ACTIVE ở vị trí homepage_main. Chỉ kiểm tra khi
   * banner đích thực sự là homepage_main + ACTIVE. {@code excludeId} bỏ qua chính banner đang
   * sửa/bật để không tự đếm trùng.
   */
  private void enforceHomepageLimit(String position, String status, Long excludeId) {
    if (!HOMEPAGE_POSITION.equals(position) || !STATUS_ACTIVE.equals(status)) {
      return;
    }
    long activeCount =
        (excludeId == null)
            ? bannerRepository.countByPositionAndStatus(HOMEPAGE_POSITION, STATUS_ACTIVE)
            : bannerRepository.countByPositionAndStatusAndIdNot(
                HOMEPAGE_POSITION, STATUS_ACTIVE, excludeId);
    if (activeCount >= MAX_HOMEPAGE_ACTIVE) {
      throw new IllegalArgumentException(
          "Đã đạt giới hạn tối đa "
              + MAX_HOMEPAGE_ACTIVE
              + " banner đang bật ở vị trí Trang chủ (Main). Hãy tắt bớt banner khác trước.");
    }
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
    enforceHomepageLimit(banner.getPosition(), banner.getStatus(), null);
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
              enforceHomepageLimit(
                  bannerDetails.getPosition(), bannerDetails.getStatus(), banner.getId());
              banner.setTitle(bannerDetails.getTitle());
              banner.setPosition(bannerDetails.getPosition());
              banner.setImageDesktop(bannerDetails.getImageDesktop());
              banner.setImageMobile(bannerDetails.getImageMobile());
              banner.setLink(bannerDetails.getLink());
              banner.setStartAt(bannerDetails.getStartAt());
              banner.setEndAt(bannerDetails.getEndAt());
              banner.setPriority(bannerDetails.getPriority());
              banner.setStatus(bannerDetails.getStatus());
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
              enforceHomepageLimit(banner.getPosition(), status, banner.getId());
              banner.setStatus(status);
              return ResponseEntity.ok(bannerRepository.save(banner));
            })
        .orElse(ResponseEntity.notFound().build());
  }
}
