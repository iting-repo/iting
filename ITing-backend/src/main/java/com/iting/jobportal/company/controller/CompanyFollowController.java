package com.iting.jobportal.company.controller;

import com.iting.jobportal.company.dto.request.FollowCompanyRequest;
import com.iting.jobportal.company.dto.response.FollowedCompanyResponse;
import com.iting.jobportal.company.service.CompanyFollowService;
import com.iting.jobportal.job.controller.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/companies/follow")
@RequiredArgsConstructor
@Tag(name = "Company Follow", description = "APIs theo dõi công ty")
public class CompanyFollowController {

    private final CompanyFollowService companyFollowService;

    @PostMapping
    @Operation(summary = "Theo dõi công ty")
    public ResponseEntity<Map<String, String>> followCompany(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @Valid @RequestBody FollowCompanyRequest request) {
        companyFollowService.followCompany(userId, request.getCompanyId());
        return ResponseEntity.ok(Map.of("message", "Theo dõi công ty thành công"));
    }

    @DeleteMapping("/{companyId}")
    @Operation(summary = "Bỏ theo dõi công ty")
    public ResponseEntity<Map<String, String>> unfollowCompany(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @PathVariable Long companyId) {
        companyFollowService.unfollowCompany(userId, companyId);
        return ResponseEntity.ok(Map.of("message", "Bỏ theo dõi công ty thành công"));
    }

    @GetMapping("/check/{companyId}")
    @Operation(summary = "Kiểm tra đã theo dõi công ty chưa")
    public ResponseEntity<Map<String, Boolean>> checkFollowing(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @PathVariable Long companyId) {
        boolean isFollowing = companyFollowService.isFollowing(userId, companyId);
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }

    @GetMapping("/my-followed")
    @Operation(summary = "Lấy danh sách công ty đang theo dõi")
    public ResponseEntity<Page<FollowedCompanyResponse>> getFollowedCompanies(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(companyFollowService.getFollowedCompanies(userId, page, size));
    }
}
