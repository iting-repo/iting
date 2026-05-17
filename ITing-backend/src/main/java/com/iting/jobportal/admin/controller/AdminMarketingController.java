package com.iting.jobportal.admin.controller;

import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.common.entity.Referral;
import com.iting.jobportal.common.entity.ReferralCode;
import com.iting.jobportal.common.repository.NewsletterSubscriptionRepository;
import com.iting.jobportal.common.repository.ReferralCodeRepository;
import com.iting.jobportal.common.repository.ReferralRepository;
import com.iting.jobportal.common.service.SalaryReportPdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin-only marketing analytics endpoints — UTM funnel, top referrers, newsletter stats.
 *
 * <p>Default time window: last 30 days. Override via `?days=N`.
 */
@RestController
@RequestMapping("/api/admin/marketing")
@RequiredArgsConstructor
public class AdminMarketingController {

    private final AccountRepository accountRepository;
    private final ReferralCodeRepository referralCodeRepository;
    private final ReferralRepository referralRepository;
    private final NewsletterSubscriptionRepository newsletterRepository;
    private final SalaryReportPdfService salaryReportPdfService;

    /**
     * Regenerate the Salary Report PDF lead magnet and upload to S3.
     * <p>Runs on-demand; typically called by admin or via a scheduled task once/month.
     */
    @PostMapping("/regenerate-salary-report")
    public ResponseEntity<Map<String, Object>> regenerateSalaryReport() {
        String publicUrl = salaryReportPdfService.generateAndUpload();
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "publicUrl", publicUrl,
                "message", "Salary report regenerated and uploaded to S3 successfully."
        ));
    }

    /**
     * UTM funnel by source / medium / campaign.
     * Returns: { sources: [...], mediums: [...], campaigns: [...] }
     */
    @GetMapping("/utm-funnel")
    public ResponseEntity<Map<String, Object>> utmFunnel(
            @RequestParam(defaultValue = "30") int days) {

        LocalDateTime since = LocalDateTime.now().minusDays(days);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timeWindowDays", days);
        response.put("since", since.toString());

        response.put("bySource", aggToList(accountRepository.aggregateByUtmSource(since)));
        response.put("byMedium", aggToList(accountRepository.aggregateByUtmMedium(since)));
        response.put("byCampaign", aggToList(accountRepository.aggregateByUtmCampaign(since)));

        return ResponseEntity.ok(response);
    }

    /**
     * Top N referrers (by total successful conversions).
     */
    @GetMapping("/top-referrers")
    public ResponseEntity<List<Map<String, Object>>> topReferrers(
            @RequestParam(defaultValue = "20") int limit) {

        List<ReferralCode> codes = referralCodeRepository.findAll(
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "totalSignups"))
        ).getContent();

        return ResponseEntity.ok(codes.stream().map(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("accountId", c.getAccount() != null ? c.getAccount().getId() : null);
            m.put("email", c.getAccount() != null ? c.getAccount().getEmail() : null);
            m.put("fullName", c.getAccount() != null ? c.getAccount().getFullName() : null);
            m.put("code", c.getCode());
            m.put("totalSignups", c.getTotalSignups());
            m.put("totalInvited", c.getTotalInvited());
            m.put("convertedCount", referralRepository
                    .countByReferrer_IdAndFirstApplicationAtIsNotNull(c.getAccount().getId()));
            return m;
        }).collect(Collectors.toList()));
    }

    /**
     * Overall marketing KPIs at a glance.
     */
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> overview(
            @RequestParam(defaultValue = "30") int days) {

        LocalDateTime since = LocalDateTime.now().minusDays(days);

        long totalSignups = accountRepository.countByCreatedAtAfter(since);
        long totalReferralCodes = referralCodeRepository.count();
        long activeNewsletterSubs = newsletterRepository.countByUnsubscribedAtIsNull();
        long totalReferrals = referralRepository.count();

        long convertedReferrals = referralRepository.findAll().stream()
                .filter(r -> r.getFirstApplicationAt() != null)
                .count();

        double referralConversionRate = totalReferrals > 0
                ? Math.round(convertedReferrals * 10000.0 / totalReferrals) / 100.0
                : 0.0;

        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("timeWindowDays", days);
        overview.put("totalSignups", totalSignups);
        overview.put("activeReferralCodes", totalReferralCodes);
        overview.put("activeNewsletterSubs", activeNewsletterSubs);
        overview.put("totalReferrals", totalReferrals);
        overview.put("convertedReferrals", convertedReferrals);
        overview.put("referralConversionRate", referralConversionRate);
        return ResponseEntity.ok(overview);
    }

    /**
     * Recent referrals timeline (most recent N).
     */
    @GetMapping("/recent-referrals")
    public ResponseEntity<List<Map<String, Object>>> recentReferrals(
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(
            referralRepository.findAll(PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "signupAt")))
                .stream()
                .map(this::referralToMap)
                .collect(Collectors.toList())
        );
    }

    private Map<String, Object> referralToMap(Referral r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("codeUsed", r.getCodeUsed());
        m.put("signupAt", r.getSignupAt());
        m.put("firstApplicationAt", r.getFirstApplicationAt());
        m.put("rewarded", r.getRewarded());
        m.put("referrerEmail", r.getReferrer() != null ? r.getReferrer().getEmail() : null);
        m.put("referredEmail", r.getReferred() != null ? r.getReferred().getEmail() : null);
        return m;
    }

    /** Convert Object[2] aggregation results → list of { label, count } maps. */
    private List<Map<String, Object>> aggToList(List<Object[]> rows) {
        return rows.stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("label", row[0]);
            m.put("count", row[1]);
            return m;
        }).collect(Collectors.toList());
    }
}
