package com.iting.jobportal.payment.task;

import com.iting.jobportal.common.service.EmailService;
import com.iting.jobportal.payment.entity.HrSubscription;
import com.iting.jobportal.payment.entity.SubscriptionTier;
import com.iting.jobportal.payment.repository.HrSubscriptionRepository;
import com.iting.jobportal.payment.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Hourly cron: notify HRs whose subscriptions expire in 3 days + mark EXPIRED past expiry.
 *
 * <p>Auto-renew flow (NOT auto-charge yet — SEPAY doesn't support card-on-file; bank-transfer requires
 * manual action). Instead:
 *   1. T-3 days: send "Your subscription expires in 3 days — pay to renew" email with QR link.
 *   2. T-0:      mark status=EXPIRED and downgrade HR to free tier.
 *   3. T+7:      send "We miss you" win-back email if still expired.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionRenewalTask {

    private final HrSubscriptionRepository subscriptionRepository;
    private final SubscriptionService subscriptionService;
    private final EmailService emailService;

    /** Run every hour. */
    @Scheduled(fixedRate = 60L * 60 * 1000)
    @Transactional
    public void processExpiringSubscriptions() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Mark expired (past expiry)
        List<HrSubscription> expired = subscriptionRepository
                .findByStatusAndAutoRenewAndExpiresAtBefore("ACTIVE", true, now);
        for (HrSubscription sub : expired) {
            sub.setStatus("EXPIRED");
            subscriptionRepository.save(sub);
            log.info("[Renewal] Marked subscription {} EXPIRED for account {}", sub.getId(), sub.getAccount().getId());
            sendExpiredEmail(sub);
        }

        // 2. Send renewal reminder T-3 days (still ACTIVE, expires soon)
        LocalDateTime threeDaysAhead = now.plusDays(3);
        List<HrSubscription> expiringSoon = subscriptionRepository
                .findByStatusAndAutoRenewAndExpiresAtBefore("ACTIVE", true, threeDaysAhead);
        for (HrSubscription sub : expiringSoon) {
            if (sub.getExpiresAt().isAfter(now)) {
                sendRenewalReminderEmail(sub);
            }
        }
    }

    private void sendRenewalReminderEmail(HrSubscription sub) {
        if (sub.getAccount() == null || sub.getAccount().getEmail() == null) return;
        SubscriptionTier tier = sub.getTier();

        String subject = "⏰ [ITing] Subscription Premium sắp hết hạn — gia hạn ngay";
        String body = "Chào " + (sub.getAccount().getFullName() != null ? sub.getAccount().getFullName() : "bạn") + ",\n\n"
            + "Tài khoản Premium " + tier.getDisplayName() + " sẽ hết hạn ngày "
            + sub.getExpiresAt().toLocalDate() + " (còn vài ngày).\n\n"
            + "Gia hạn ngay để giữ các quyền lợi:\n"
            + "• " + tier.getBenefits() + "\n\n"
            + "→ Gia hạn: https://iting.vn/employer/subscription\n\n"
            + "Trân trọng,\nĐội ngũ ITing.";

        emailService.sendEmail(sub.getAccount().getEmail(), subject, body);
    }

    private void sendExpiredEmail(HrSubscription sub) {
        if (sub.getAccount() == null || sub.getAccount().getEmail() == null) return;
        String subject = "[ITing] Tài khoản Premium đã hết hạn";
        String body = "Chào bạn,\n\n"
            + "Subscription Premium của bạn đã hết hạn. Tài khoản chuyển về Free tier.\n\n"
            + "Đăng ký lại để khôi phục quyền lợi: https://iting.vn/employer/subscription\n\n"
            + "Trân trọng,\nĐội ngũ ITing.";
        emailService.sendEmail(sub.getAccount().getEmail(), subject, body);
    }
}
