package com.iting.jobportal.recommendation.controller;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.recommendation.entity.SavedSearch;
import com.iting.jobportal.recommendation.repository.SavedSearchRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/me/saved-searches")
@RequiredArgsConstructor
public class SavedSearchController {

    private final SavedSearchRepository repository;
    private final AccountRepository accountRepository;
    private final JwtTokenUtil jwtTokenUtil;

    @GetMapping
    public ResponseEntity<List<SavedSearch>> list(HttpServletRequest request) {
        Long userId = requireUser(request);
        return ResponseEntity.ok(repository.findByAccount_IdOrderByCreatedAtDesc(userId));
    }

    @PostMapping
    public ResponseEntity<SavedSearch> create(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        Long userId = requireUser(request);

        if (repository.countByAccount_Id(userId) >= 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Bạn đã đạt giới hạn 20 saved searches. Vui lòng xóa bớt trước khi tạo mới.");
        }

        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));

        SavedSearch s = SavedSearch.builder()
                .account(account)
                .name(asString(body.get("name"), "Tìm kiếm mới"))
                .keyword(asString(body.get("keyword"), null))
                .location(asString(body.get("location"), null))
                .jobType(asString(body.get("jobType"), null))
                .experienceLevel(asString(body.get("experienceLevel"), null))
                .minSalary(asBigDecimal(body.get("minSalary")))
                .maxSalary(asBigDecimal(body.get("maxSalary")))
                .emailAlertsEnabled(Boolean.TRUE.equals(body.get("emailAlertsEnabled")) ||
                        body.get("emailAlertsEnabled") == null)
                .alertFrequency(asString(body.get("alertFrequency"), "DAILY"))
                .build();

        return ResponseEntity.ok(repository.save(s));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavedSearch> update(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        Long userId = requireUser(request);
        SavedSearch s = requireOwned(id, userId);

        if (body.containsKey("name")) s.setName(asString(body.get("name"), s.getName()));
        if (body.containsKey("keyword")) s.setKeyword(asString(body.get("keyword"), null));
        if (body.containsKey("location")) s.setLocation(asString(body.get("location"), null));
        if (body.containsKey("jobType")) s.setJobType(asString(body.get("jobType"), null));
        if (body.containsKey("experienceLevel")) s.setExperienceLevel(asString(body.get("experienceLevel"), null));
        if (body.containsKey("minSalary")) s.setMinSalary(asBigDecimal(body.get("minSalary")));
        if (body.containsKey("maxSalary")) s.setMaxSalary(asBigDecimal(body.get("maxSalary")));
        if (body.containsKey("emailAlertsEnabled")) {
            s.setEmailAlertsEnabled(Boolean.TRUE.equals(body.get("emailAlertsEnabled")));
        }
        if (body.containsKey("alertFrequency")) {
            s.setAlertFrequency(asString(body.get("alertFrequency"), "DAILY"));
        }

        return ResponseEntity.ok(repository.save(s));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        SavedSearch s = requireOwned(id, userId);
        repository.delete(s);
        return ResponseEntity.ok(Map.of("message", "Đã xóa saved search"));
    }

    // ── helpers ────────────────────────────────────────────────────

    private Long requireUser(HttpServletRequest request) {
        Long userId = jwtTokenUtil.getUserIdFromHeader(request);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
        }
        return userId;
    }

    private SavedSearch requireOwned(Long id, Long userId) {
        SavedSearch s = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saved search không tồn tại"));
        if (s.getAccount() == null || !userId.equals(s.getAccount().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền truy cập");
        }
        return s;
    }

    private static String asString(Object o, String defaultValue) {
        if (o == null) return defaultValue;
        String s = o.toString();
        return s.isBlank() ? defaultValue : s;
    }

    private static BigDecimal asBigDecimal(Object o) {
        if (o == null) return null;
        try {
            return new BigDecimal(o.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
