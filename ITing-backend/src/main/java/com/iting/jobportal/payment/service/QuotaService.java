package com.iting.jobportal.payment.service;

import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.payment.entity.HrSubscription;
import com.iting.jobportal.payment.entity.SubscriptionTier;
import com.iting.jobportal.payment.repository.HrSubscriptionRepository;
import com.iting.jobportal.payment.repository.PaymentOrderRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Enforce monthly quotas của subscription tier: số job posting + số boost / 30 ngày.
 *
 * <p>Tier limits trong {@link SubscriptionTier}:
 *
 * <ul>
 *   <li>FREE (chưa subscribe): 3 jobs, 1 boost
 *   <li>BASIC: 10 jobs, 5 boosts
 *   <li>PRO: 50 jobs, 20 boosts
 *   <li>ENTERPRISE: unlimited (maxJobs = -1, maxBoosts = -1)
 * </ul>
 *
 * <p>Throw HTTP 402 Payment Required với message tiếng Việt nếu vượt quota — frontend bắt status
 * 402 → toast "Bạn đã hết quota, vui lòng nâng cấp gói".
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QuotaService {

  private final HrSubscriptionRepository subscriptionRepository;
  private final JobRepository jobRepository;
  private final PaymentOrderRepository paymentOrderRepository;
  private final SubscriptionPricingService pricingService;

  /** Window 30 ngày tính từ now (rolling). Khớp với period của subscription. */
  private static final int WINDOW_DAYS = 30;

  /**
   * Throw 402 nếu HR đã đăng đủ số job tối đa của tier hiện tại trong 30 ngày qua.
   *
   * @param hrAccountId HR account đang post job
   */
  public void requireJobQuota(Long hrAccountId) {
    int limit = resolveActiveTier(hrAccountId)
        .map(t -> pricingService.getPricing(t).getMaxJobsPerMonth())
        .orElse(SubscriptionTier.FREE_MAX_JOBS_PER_MONTH);
    if (limit < 0) return; // unlimited (ENTERPRISE)

    long used =
        jobRepository.countByPostedByHrIdAndCreatedAtAfter(
            hrAccountId, LocalDateTime.now().minusDays(WINDOW_DAYS));

    if (used >= limit) {
      String tierLabel = activeTierName(hrAccountId);
      log.info(
          "[QUOTA] HR {} blocked: posted {}/{} jobs in last {} days (tier={})",
          hrAccountId,
          used,
          limit,
          WINDOW_DAYS,
          tierLabel);
      throw new ResponseStatusException(
          HttpStatus.PAYMENT_REQUIRED,
          String.format(
              "Bạn đã đăng %d/%d job trong 30 ngày qua (gói %s). Vui lòng nâng cấp gói để tiếp tục.",
              used, limit, tierLabel));
    }
  }

  /**
   * Throw 402 nếu HR đã boost đủ số lần tối đa của tier hiện tại trong 30 ngày qua.
   *
   * @param hrAccountId HR account đang boost
   */
  public void requireBoostQuota(Long hrAccountId) {
    int limit = resolveActiveTier(hrAccountId)
        .map(t -> pricingService.getPricing(t).getMaxBoostsPerMonth())
        .orElse(SubscriptionTier.FREE_MAX_BOOSTS_PER_MONTH);
    if (limit < 0) return; // unlimited

    long used =
        paymentOrderRepository.countActivatedByAccountAndItemTypeSince(
            hrAccountId, "BOOST_JOB", LocalDateTime.now().minusDays(WINDOW_DAYS));

    if (used >= limit) {
      String tierLabel = activeTierName(hrAccountId);
      log.info(
          "[QUOTA] HR {} blocked: used {}/{} boosts in last {} days (tier={})",
          hrAccountId,
          used,
          limit,
          WINDOW_DAYS,
          tierLabel);
      throw new ResponseStatusException(
          HttpStatus.PAYMENT_REQUIRED,
          String.format(
              "Bạn đã dùng %d/%d lượt boost trong 30 ngày qua (gói %s). Vui lòng nâng cấp gói để tiếp tục.",
              used, limit, tierLabel));
    }
  }

  /**
   * Gate "Talent pool search" — chỉ PRO + ENTERPRISE. FREE và BASIC throw 402.
   *
   * <p>Khác với requireJobQuota/Boost (count-based), gate này là tier-based: tính năng cao cấp
   * cho phép HR search direct database ứng viên đang openToWork, không cần đăng job chờ apply.
   */
  public void requireTalentPoolAccess(Long hrAccountId) {
    SubscriptionTier tier = resolveActiveTier(hrAccountId).orElse(null);
    if (tier == SubscriptionTier.PRO || tier == SubscriptionTier.ENTERPRISE) {
      return; // allowed
    }
    String currentLabel = tier == null ? "FREE" : tier.name();
    log.info("[QUOTA] HR {} blocked talent-pool search (tier={})", hrAccountId, currentLabel);
    throw new ResponseStatusException(
        HttpStatus.PAYMENT_REQUIRED,
        "Tính năng Tìm kiếm ứng viên (Talent Pool) chỉ dành cho gói PRO trở lên. "
            + "Bạn đang dùng gói "
            + currentLabel
            + ". Vui lòng nâng cấp để sử dụng.");
  }

  /** Lookup tier subscription ACTIVE chưa expire của HR. */
  private Optional<SubscriptionTier> resolveActiveTier(Long hrAccountId) {
    Optional<HrSubscription> sub =
        subscriptionRepository.findFirstByAccount_IdAndStatusOrderByExpiresAtDesc(
            hrAccountId, "ACTIVE");
    if (sub.isEmpty()) return Optional.empty();
    if (sub.get().getExpiresAt() == null || sub.get().getExpiresAt().isBefore(LocalDateTime.now())) {
      return Optional.empty();
    }
    return Optional.ofNullable(sub.get().getTier());
  }

  private String activeTierName(Long hrAccountId) {
    return resolveActiveTier(hrAccountId).map(Enum::name).orElse("FREE");
  }
}
