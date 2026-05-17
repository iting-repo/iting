package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.entity.Banner;
import com.iting.jobportal.admin.repository.BannerRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/banners")
@RequiredArgsConstructor
@Tag(name = "Public Banners", description = "Public Banner Retrieval")
public class PublicBannerController {

    private final BannerRepository bannerRepository;

    @GetMapping
    @Operation(summary = "Get active banners")
    public ResponseEntity<List<Banner>> getActiveBanners(@RequestParam(required = false) String position) {
        List<Banner> banners;
        if (position != null && !position.isEmpty()) {
            banners = bannerRepository.findByPositionOrderByPriorityDesc(position);
        } else {
            banners = bannerRepository.findByStatusOrderByPriorityDesc("ACTIVE");
        }

        // Filter out inactive or expired banners
        LocalDateTime now = LocalDateTime.now();
        List<Banner> activeBanners = banners.stream()
                .filter(b -> "ACTIVE".equals(b.getStatus()))
                .filter(b -> b.getStartAt() == null || !now.isBefore(b.getStartAt()))
                .filter(b -> b.getEndAt() == null || !now.isAfter(b.getEndAt()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(activeBanners);
    }
}
