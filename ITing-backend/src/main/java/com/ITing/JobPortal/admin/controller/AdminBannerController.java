package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.entity.Banner;
import com.iting.jobportal.admin.repository.BannerRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
@Tag(name = "Admin Banners", description = "Admin Banner Management")
public class AdminBannerController {

    private final BannerRepository bannerRepository;

    @GetMapping
    @Operation(summary = "Get all banners")
    public ResponseEntity<List<Banner>> getAllBanners() {
        return ResponseEntity.ok(bannerRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get banner by ID")
    public ResponseEntity<Banner> getBanner(@PathVariable Long id) {
        return bannerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new banner")
    public ResponseEntity<Banner> createBanner(@RequestBody Banner banner) {
        if (banner.getStatus() == null) {
            banner.setStatus("ACTIVE");
        }
        if (banner.getPriority() == null) {
            banner.setPriority(0);
        }
        return ResponseEntity.ok(bannerRepository.save(banner));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a banner")
    public ResponseEntity<Banner> updateBanner(@PathVariable Long id, @RequestBody Banner bannerDetails) {
        return bannerRepository.findById(id).map(banner -> {
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
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a banner")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        return bannerRepository.findById(id).map(banner -> {
            bannerRepository.delete(banner);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Toggle banner status")
    public ResponseEntity<Banner> toggleBannerStatus(@PathVariable Long id, @RequestParam String status) {
        return bannerRepository.findById(id).map(banner -> {
            banner.setStatus(status);
            return ResponseEntity.ok(bannerRepository.save(banner));
        }).orElse(ResponseEntity.notFound().build());
    }
}
