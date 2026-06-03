package com.iting.jobportal.common.task;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.common.entity.Referral;
import com.iting.jobportal.common.repository.ReferralRepository;
import com.iting.jobportal.common.service.EmailService;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Scheduled task: scan unrewarded referrals → grant Premium 1 tháng cho mỗi 5 conversion.
 *
 * <p>Conversion = referred user submit ứng tuyển đầu tiên (firstApplicationAt IS NOT NULL). Mỗi 5
 * conversion (chưa rewarded) → cấp Premium 30 ngày + gửi email thông báo.
 *
 * <p>Chạy mỗi 2 giờ (đủ thường xuyên để feel "instant", không tốn tài nguyên).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ReferralRewardTask {

  private static final int CONVERSIONS_PER_REWARD = 5;
  private static final int PREMIUM_DAYS = 30;

  private final ReferralRepository referralRepository;
  private final AccountRepository accountRepository;
  private final EmailService emailService;

  @Scheduled(fixedRate = 2L * 60 * 60 * 1000) // mỗi 2 giờ
  @Transactional
  public void grantRewards() {
    // Gather ALL converted-but-not-rewarded referrals, group by referrer
    List<Referral> pending =
        referralRepository.findAll().stream()
            .filter(r -> r.getFirstApplicationAt() != null)
            .filter(r -> Boolean.FALSE.equals(r.getRewarded()))
            .toList();

    if (pending.isEmpty()) return;

    // Group by referrer id
    Map<Long, java.util.List<Referral>> byReferrer = new HashMap<>();
    for (Referral r : pending) {
      if (r.getReferrer() == null) continue;
      byReferrer.computeIfAbsent(r.getReferrer().getId(), k -> new java.util.ArrayList<>()).add(r);
    }

    for (Map.Entry<Long, java.util.List<Referral>> entry : byReferrer.entrySet()) {
      try {
        processReferrerBatch(entry.getKey(), entry.getValue());
      } catch (Exception e) {
        log.error(
            "Failed to grant referral rewards for referrer {}: {}", entry.getKey(), e.getMessage());
      }
    }
  }

  private void processReferrerBatch(Long referrerId, List<Referral> conversions) {
    if (conversions.size() < CONVERSIONS_PER_REWARD) return;

    Account referrer = accountRepository.findById(referrerId).orElse(null);
    if (referrer == null) return;

    // How many reward batches earned?
    int batches = conversions.size() / CONVERSIONS_PER_REWARD;
    int rewardableCount = batches * CONVERSIONS_PER_REWARD;

    // Mark these N referrals as rewarded (FIFO — oldest first)
    List<Referral> toReward =
        conversions.stream()
            .sorted((a, b) -> a.getFirstApplicationAt().compareTo(b.getFirstApplicationAt()))
            .limit(rewardableCount)
            .toList();

    LocalDateTime now = LocalDateTime.now();
    for (Referral r : toReward) {
      r.setRewarded(true);
      r.setRewardedAt(now);
      r.setRewardNote("Premium " + PREMIUM_DAYS + " ngày — batch of " + CONVERSIONS_PER_REWARD);
      referralRepository.save(r);
    }

    // Extend referrer's premium expiry
    LocalDateTime currentExpiry = referrer.getPremiumUntil();
    LocalDateTime baseline =
        currentExpiry != null && currentExpiry.isAfter(now) ? currentExpiry : now;
    LocalDateTime newExpiry = baseline.plusDays((long) batches * PREMIUM_DAYS);
    referrer.setPremiumUntil(newExpiry);
    referrer.setPremiumSource("REFERRAL");
    accountRepository.save(referrer);

    log.info(
        "Referral reward: referrer={} batches={} (×{} days) → premium until {}",
        referrerId,
        batches,
        PREMIUM_DAYS,
        newExpiry);

    // Send congrats email
    try {
      sendRewardEmail(referrer, batches);
    } catch (Exception e) {
      log.warn("Failed to send reward email to {}: {}", referrer.getEmail(), e.getMessage());
    }
  }

  private void sendRewardEmail(Account referrer, int batches) {
    if (referrer.getEmail() == null) return;
    int days = batches * PREMIUM_DAYS;
    String subject = "🎉 [ITing] Bạn vừa được tặng " + days + " ngày Premium!";

    String body =
        "Chào "
            + (referrer.getFullName() != null ? referrer.getFullName() : "bạn")
            + ",\n\n"
            + "Chúc mừng! Bạn đã giới thiệu thành công "
            + (batches * CONVERSIONS_PER_REWARD)
            + " ứng viên mới đã apply việc qua link của bạn.\n\n"
            + "🎁 Phần thưởng: "
            + days
            + " NGÀY PREMIUM được cộng vào tài khoản.\n"
            + "Premium expiry: "
            + referrer.getPremiumUntil()
            + "\n\n"
            + "Quyền lợi Premium:\n"
            + "• Profile được ưu tiên hiển thị với HR\n"
            + "• Apply không giới hạn\n"
            + "• Xem được công ty đã save profile của bạn\n"
            + "• Email alert ngay khi có job phù hợp (real-time)\n\n"
            + "Tiếp tục giới thiệu thêm bạn bè để nhận thêm Premium:\n"
            + "https://iting.vn/me/referral\n\n"
            + "Cảm ơn bạn đã đồng hành cùng ITing!\n"
            + "Đội ngũ ITing.";

    emailService.sendEmail(referrer.getEmail(), subject, body);
  }
}
