package com.iting.jobportal.auth.controller;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.company.repository.CompanyHrAffiliationRepository;
import com.iting.jobportal.company.repository.UserFollowCompanyRepository;
import com.iting.jobportal.job.repository.UserSaveJobRepository;
import com.iting.jobportal.recommendation.repository.UserJobInteractionRepository;
import com.iting.jobportal.recommendation.repository.UserSearchHistoryRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * GDPR / Nghị định 13 — endpoint cho user tự download toàn bộ dữ liệu cá nhân của họ.
 *
 * <p>Returns JSON containing every record linked to the authenticated user:
 * account info, follow list, saved jobs, search history, interactions, HR affiliations.
 *
 * <p>Excludes sensitive internal data: password hash, refresh tokens (revoke-only).
 */
@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeDataExportController {

    private final AccountRepository accountRepository;
    private final UserSaveJobRepository userSaveJobRepository;
    private final UserFollowCompanyRepository userFollowCompanyRepository;
    private final UserSearchHistoryRepository userSearchHistoryRepository;
    private final UserJobInteractionRepository userJobInteractionRepository;
    private final CompanyHrAffiliationRepository companyHrAffiliationRepository;
    private final JwtTokenUtil jwtTokenUtil;

    @GetMapping("/data-export")
    public ResponseEntity<Map<String, Object>> exportMyData(HttpServletRequest request) {
        Long userId = jwtTokenUtil.getUserIdFromHeader(request);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
        }

        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account không tồn tại"));

        Map<String, Object> export = new LinkedHashMap<>();
        export.put("exportedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        export.put("notice",
                "Đây là toàn bộ dữ liệu cá nhân ITing lưu về tài khoản của bạn. "
              + "Để yêu cầu xóa, gửi email đến support@iting.vn.");

        // 1. Account info (no password hash)
        Map<String, Object> accountInfo = new LinkedHashMap<>();
        accountInfo.put("id", account.getId());
        accountInfo.put("email", account.getEmail());
        accountInfo.put("fullName", account.getFullName());
        accountInfo.put("phone", account.getPhone());
        accountInfo.put("avatarUrl", account.getAvatarUrl());
        accountInfo.put("role", account.getRole() != null ? account.getRole().name() : null);
        accountInfo.put("status", account.getStatus() != null ? account.getStatus().name() : null);
        accountInfo.put("adminRole", account.getAdminRole());
        accountInfo.put("lastLoginAt", account.getLastLoginAt());
        accountInfo.put("createdAt", account.getCreatedAt());
        export.put("account", accountInfo);

        // 2. Saved job IDs
        export.put("savedJobIds", userSaveJobRepository.findAllJobIdByUserId(userId));
        export.put("savedJobsCount", userSaveJobRepository.countByUserId(userId));

        // 3. Followed companies
        var followed = userFollowCompanyRepository
                .findByUserId(userId, PageRequest.of(0, Integer.MAX_VALUE))
                .getContent()
                .stream()
                .map(f -> Map.of(
                        "companyId", f.getCompanyId(),
                        "followDate", String.valueOf(f.getFollowDate())))
                .collect(Collectors.toList());
        export.put("followedCompanies", followed);

        // 4. Search history
        var searches = userSearchHistoryRepository
                .findByAccountIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 1000))
                .stream()
                .map(s -> Map.of(
                        "keyword", String.valueOf(s.getKeyword()),
                        "location", String.valueOf(s.getLocation()),
                        "createdAt", String.valueOf(s.getCreatedAt())))
                .collect(Collectors.toList());
        export.put("searchHistory", searches);
        export.put("searchHistoryCount", userSearchHistoryRepository.countByAccountId(userId));

        // 5. Job interactions (views, applies, saves)
        var interactions = userJobInteractionRepository.findByAccountId(userId).stream()
                .map(i -> Map.of(
                        "jobId", i.getJob() != null ? i.getJob().getId() : null,
                        "type", i.getInteractionType() != null ? i.getInteractionType().name() : null,
                        "weight", i.getWeight()))
                .collect(Collectors.toList());
        export.put("jobInteractions", interactions);

        // 6. HR affiliations (if employer)
        var affiliations = companyHrAffiliationRepository
                .findByHrAccount_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(a -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("affiliationId", a.getId());
                    m.put("companyId", a.getCompany() != null ? a.getCompany().getId() : null);
                    m.put("status", a.getStatus() != null ? a.getStatus().name() : null);
                    m.put("submissionStatus", a.getSubmissionStatus() != null ? a.getSubmissionStatus().name() : null);
                    m.put("requestedAt", String.valueOf(a.getRequestedAt()));
                    return m;
                })
                .collect(Collectors.toList());
        export.put("hrAffiliations", affiliations);

        // Force browser download as JSON
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setContentDisposition(org.springframework.http.ContentDisposition
                .attachment()
                .filename("iting-data-export-" + account.getId() + "-" + System.currentTimeMillis() + ".json")
                .build());

        return ResponseEntity.ok().headers(headers).body(export);
    }
}
