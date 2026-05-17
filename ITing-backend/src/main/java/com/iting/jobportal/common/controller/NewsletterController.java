package com.iting.jobportal.common.controller;

import com.iting.jobportal.common.entity.NewsletterSubscription;
import com.iting.jobportal.common.repository.NewsletterSubscriptionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Public newsletter signup endpoint — no auth required.
 *
 * <p>POST /api/public/newsletter/subscribe — create subscription
 * <p>GET  /api/public/newsletter/unsubscribe?token=xxx — opt-out via emailed link
 */
@RestController
@RequestMapping("/api/public/newsletter")
@RequiredArgsConstructor
public class NewsletterController {

    private static final Pattern EMAIL_REGEX = Pattern.compile(
            "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final NewsletterSubscriptionRepository repository;

    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, Object>> subscribe(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        String email = body.get("email");
        if (email == null || !EMAIL_REGEX.matcher(email.trim()).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email không hợp lệ");
        }
        email = email.trim().toLowerCase();

        var existing = repository.findByEmail(email);
        if (existing.isPresent()) {
            // Re-activate if previously unsubscribed
            NewsletterSubscription sub = existing.get();
            if (sub.getUnsubscribedAt() != null) {
                sub.setUnsubscribedAt(null);
                sub.setSubscribedAt(LocalDateTime.now());
                repository.save(sub);
            }
            return ResponseEntity.ok(Map.of(
                    "message", "Bạn đã đăng ký nhận newsletter trước đó. Cảm ơn!",
                    "alreadySubscribed", true
            ));
        }

        NewsletterSubscription sub = NewsletterSubscription.builder()
                .email(email)
                .source(body.getOrDefault("source", "FOOTER"))
                .leadMagnet(body.get("leadMagnet"))
                .unsubscribeToken(UUID.randomUUID().toString().replace("-", ""))
                .utmSource(body.get("utmSource"))
                .utmMedium(body.get("utmMedium"))
                .utmCampaign(body.get("utmCampaign"))
                .ipAddress(extractIp(request))
                .build();

        repository.save(sub);

        return ResponseEntity.ok(Map.of(
                "message", "Đăng ký thành công! Email xác nhận đã được gửi.",
                "alreadySubscribed", false
        ));
    }

    @GetMapping("/unsubscribe")
    public ResponseEntity<Map<String, String>> unsubscribe(@RequestParam String token) {
        NewsletterSubscription sub = repository.findByUnsubscribeToken(token)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Link không hợp lệ hoặc đã hết hạn"));

        if (sub.getUnsubscribedAt() == null) {
            sub.setUnsubscribedAt(LocalDateTime.now());
            repository.save(sub);
        }
        return ResponseEntity.ok(Map.of(
                "message", "Bạn đã hủy đăng ký nhận newsletter từ ITing. Hẹn gặp lại!"
        ));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        return ResponseEntity.ok(Map.of(
                "activeSubscribers", repository.countByUnsubscribedAtIsNull(),
                "total", repository.count()
        ));
    }

    private String extractIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = request.getHeader("X-Real-IP");
        if (ip == null || ip.isBlank()) ip = request.getRemoteAddr();
        if (ip != null && ip.contains(",")) ip = ip.split(",")[0].trim();
        return ip;
    }
}
