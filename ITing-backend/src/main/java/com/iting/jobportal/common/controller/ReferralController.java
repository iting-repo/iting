package com.iting.jobportal.common.controller;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.common.entity.Referral;
import com.iting.jobportal.common.entity.ReferralCode;
import com.iting.jobportal.common.repository.ReferralCodeRepository;
import com.iting.jobportal.common.repository.ReferralRepository;
import com.iting.jobportal.common.service.ReferralService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/me/referral")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralService referralService;
    private final ReferralCodeRepository codeRepository;
    private final ReferralRepository referralRepository;
    private final AccountRepository accountRepository;
    private final JwtTokenUtil jwtTokenUtil;

    @GetMapping
    public ResponseEntity<Map<String, Object>> myReferral(HttpServletRequest request) {
        Long userId = requireUser(request);

        Account me = accountRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));

        // Auto-create code on first access
        ReferralCode code = referralService.getOrCreateCodeFor(me);

        List<Referral> refs = referralRepository.findByReferrer_IdOrderBySignupAtDesc(userId);
        long totalInvited = codeRepository.findByAccount_Id(userId)
                .map(ReferralCode::getTotalInvited).orElse(0);
        long converted = referralRepository
                .countByReferrer_IdAndFirstApplicationAtIsNotNull(userId);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("code", code.getCode());
        response.put("shareUrl", "https://iting.vn/register?ref=" + code.getCode());
        response.put("totalInvited", totalInvited);
        response.put("totalSignups", code.getTotalSignups());
        response.put("converted", converted);  // signups who applied at least 1 job
        response.put("conversionRate", code.getTotalSignups() > 0
                ? Math.round(converted * 10000.0 / code.getTotalSignups()) / 100.0
                : 0.0);

        // List of referred users (no PII — just first letter + masked email)
        List<Map<String, Object>> recent = refs.stream()
                .limit(20)
                .map(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("signupAt", r.getSignupAt());
                    m.put("converted", r.getFirstApplicationAt() != null);
                    m.put("rewarded", r.getRewarded());
                    // Mask email: "n***@gmail.com"
                    String email = r.getReferred() != null ? r.getReferred().getEmail() : null;
                    m.put("referredEmail", maskEmail(email));
                    return m;
                })
                .collect(Collectors.toList());
        response.put("recentInvitees", recent);

        return ResponseEntity.ok(response);
    }

    private Long requireUser(HttpServletRequest request) {
        Long userId = jwtTokenUtil.getUserIdFromHeader(request);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
        }
        return userId;
    }

    private static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        int at = email.indexOf('@');
        if (at <= 1) return "*" + email.substring(at);
        return email.charAt(0) + "***" + email.substring(at);
    }
}
