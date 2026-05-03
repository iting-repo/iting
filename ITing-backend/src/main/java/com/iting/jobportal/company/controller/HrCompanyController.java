package com.iting.jobportal.company.controller;

import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.service.AuthorizationService;
import com.iting.jobportal.company.service.CompanyFollowService;
import com.iting.jobportal.company.service.CompanyService;
import com.iting.jobportal.job.controller.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/**
 * HR-side đọc thông tin Company (read-only).
 *
 * Sau Phase 2/3, HR KHÔNG còn sửa Company info trực tiếp — mọi thay đổi đi qua
 * affiliation snapshot ({@code /api/hr/affiliations/me/...}). Controller này chỉ
 * cung cấp endpoint read để HR xem Company info hiện đang public.
 */
@Tag(name = "09. HR Company (read-only)")
@RestController
@RequestMapping("/api/hr/companies")
@PreAuthorize("hasRole('EMPLOYER')")
@RequiredArgsConstructor
public class HrCompanyController {

    private final CompanyService companyService;
    private final CompanyFollowService companyFollowService;
    private final AuthorizationService authz;

    @GetMapping("/{id}")
    @Operation(summary = "Xem thông tin Company. {id} phải khớp với affiliation của HR đang login.")
    public ResponseEntity<CompanyResponse> getCompany(
            @Parameter(hidden = true) @CurrentUser Long hrAccountId,
            @PathVariable Long id) {

        // Validate: HR chỉ được xem Company mà mình có affiliation active.
        Long allowedCompanyId = authz.requireCompanyOf(hrAccountId);
        if (!allowedCompanyId.equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền xem thông tin công ty này");
        }

        return ResponseEntity.ok(companyService.getMyCompany(hrAccountId));
    }

    @GetMapping("/{id}/business-license/view")
    @Operation(summary = "Presigned URL xem giấy phép kinh doanh hiện tại của Company")
    public ResponseEntity<Map<String, String>> viewBusinessLicense(
            @Parameter(hidden = true) @CurrentUser Long hrAccountId,
            @PathVariable Long id) {

        Long allowedCompanyId = authz.requireCompanyOf(hrAccountId);
        if (!allowedCompanyId.equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền xem giấy phép của công ty này");
        }

        String url = companyService.getBusinessLicensePresignedUrlByAccountId(hrAccountId, 15);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/{id}/followers/count")
    @Operation(summary = "Đếm số follower của Company")
    public ResponseEntity<Map<String, Long>> getFollowerCount(
            @Parameter(hidden = true) @CurrentUser Long hrAccountId,
            @PathVariable Long id) {

        Long allowedCompanyId = authz.requireCompanyOf(hrAccountId);
        if (!allowedCompanyId.equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền xem thông tin follower của công ty này");
        }

        long count = companyFollowService.getFollowerCount(allowedCompanyId);
        return ResponseEntity.ok(Map.of("followerCount", count));
    }
}
