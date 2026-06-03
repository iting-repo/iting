package com.iting.jobportal.payment.service;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.common.service.EmailService;
import com.iting.jobportal.payment.entity.HrSubscription;
import com.iting.jobportal.payment.entity.PaymentOrder;
import com.iting.jobportal.payment.entity.PaymentStatus;
import com.iting.jobportal.payment.entity.SubscriptionTier;
import com.iting.jobportal.payment.repository.HrSubscriptionRepository;
import com.iting.jobportal.payment.repository.PaymentOrderRepository;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Subscribe / activate / cancel HR Premium subscriptions.
 *
 * <p>Recurring billing flow:
 *
 * <ul>
 *   <li>HR clicks "Subscribe Pro" → {@link #createSubscriptionOrder} creates a SEPAY {@link
 *       PaymentOrder} with item_type = PREMIUM_SUBSCRIPTION.
 *   <li>When SEPAY webhook fires PAID → {@link #activateAfterPayment} extends/creates
 *       HrSubscription.
 *   <li>{@link com.iting.jobportal.payment.task.SubscriptionRenewalTask} polls expiring
 *       subscriptions every hour and creates a fresh PENDING order for auto_renew=true users.
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

  private final CreditService creditService;

  @Value("${sepay.order-prefix:ITI}")
  private String orderPrefix;

  @Value("${sepay.bank-code:Vietcombank}")
  private String bankCode;

  @Value("${sepay.account-number:0123456789}")
  private String accountNumber;

  @Value("${sepay.account-name:ITING JSC}")
  private String accountName;

  @Value("${sepay.qr-template:compact2}")
  private String qrTemplate;

  private final HrSubscriptionRepository subscriptionRepository;
  private final PaymentOrderRepository orderRepository;
  private final AccountRepository accountRepository;
  private final EmailService emailService;

  private static final SecureRandom RANDOM = new SecureRandom();
  private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  // ─── Public API ────────────────────────────────────────────────────

  /** Returns the HR's currently-active subscription, if any. */
  public Optional<HrSubscription> getActiveSubscription(Long accountId) {
    return subscriptionRepository
        .findFirstByAccount_IdAndStatusOrderByExpiresAtDesc(accountId, "ACTIVE")
        .filter(s -> s.getExpiresAt().isAfter(LocalDateTime.now()));
  }

  /**
   * Create a PENDING SEPAY order to subscribe (or renew) to a tier. Returns same shape as
   * boost-order — QR + bank info.
   */
  @Transactional
  public Map<String, Object> createSubscriptionOrder(
      Long accountId, SubscriptionTier tier, boolean autoRenew) {
    Account account =
        accountRepository
            .findById(accountId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account không tồn tại"));

    String orderCode = generateOrderCode();
    PaymentOrder order =
        PaymentOrder.builder()
            .account(account)
            .orderCode(orderCode)
            .amount(tier.getPriceVnd())
            .description("Subscription " + tier.name() + (autoRenew ? " (auto-renew)" : ""))
            .itemType("PREMIUM_SUBSCRIPTION")
            .itemId(null)
            .tier(tier.name())
            .status(PaymentStatus.PENDING)
            .gateway("SEPAY")
            .expiresAt(LocalDateTime.now().plusMinutes(30))
            .build();
    orderRepository.save(order);

    Map<String, Object> response = new LinkedHashMap<>();
    response.put("orderId", order.getId());
    response.put("orderCode", orderCode);
    response.put("amount", tier.getPriceVnd());
    response.put("status", "PENDING");
    response.put("tier", tier.name());
    response.put("tierDisplayName", tier.getDisplayName());
    response.put("autoRenew", autoRenew);

    Map<String, Object> bank = new LinkedHashMap<>();
    bank.put("bankCode", bankCode);
    bank.put("accountNumber", accountNumber);
    bank.put("accountName", accountName);
    bank.put("transferContent", orderCode);
    bank.put(
        "qrImageUrl",
        String.format(
            "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%d&des=%s&template=%s",
            accountNumber, bankCode, tier.getPriceVnd(), orderCode, qrTemplate));
    response.put("bank", bank);

    log.info(
        "[Subscription] Order created: code={} tier={} account={}",
        orderCode,
        tier.name(),
        accountId);
    return response;
  }

  /**
   * Called by {@link SepayPaymentService#handleWebhook} when a PREMIUM_SUBSCRIPTION order is PAID.
   * Creates / extends the HrSubscription record, adds credits, and sends marketing email.
   */
  @Transactional
  public void activateAfterPayment(PaymentOrder order) {
    if (!"PREMIUM_SUBSCRIPTION".equals(order.getItemType())) return;

    SubscriptionTier tier;
    try {
      tier = SubscriptionTier.valueOf(order.getTier());
    } catch (Exception e) {
      log.error(
          "[Subscription] Unknown tier {} in order {}", order.getTier(), order.getOrderCode());
      return;
    }

    Long accountId = order.getAccount().getId();
    LocalDateTime now = LocalDateTime.now();

    Optional<HrSubscription> existing =
        subscriptionRepository.findFirstByAccount_IdAndStatusOrderByExpiresAtDesc(
            accountId, "ACTIVE");

    // Idempotency guard: nếu đã có subscription gắn với chính order này (qua
    // lastPaymentOrderId) → đã activate rồi, skip. Tránh double credits/expiry
    // khi SePay retry webhook hoặc khi giao dịch đã PAID được reactivate.
    if (existing.isPresent()
        && order.getId().equals(existing.get().getLastPaymentOrderId())) {
      log.info(
          "[Subscription] Order {} already activated → skip (subscriptionId={})",
          order.getOrderCode(),
          existing.get().getId());
      return;
    }

    HrSubscription sub;
    if (existing.isPresent() && existing.get().getExpiresAt().isAfter(now)) {
      // Extend: add period to current expiry
      sub = existing.get();
      sub.setExpiresAt(sub.getExpiresAt().plus(tier.getPeriod()));
      sub.setTier(tier);
      sub.setLastPaymentOrderId(order.getId());
    } else {
      // New subscription
      sub =
          HrSubscription.builder()
              .account(order.getAccount())
              .tier(tier)
              .status("ACTIVE")
              .startedAt(now)
              .expiresAt(now.plus(tier.getPeriod()))
              .autoRenew(true)
              .lastPaymentOrderId(order.getId())
              .build();
    }
    subscriptionRepository.save(sub);

    // ── Add credits to HR account (via CreditService để có audit ledger) ──
    Account account = order.getAccount();
    int creditsToAdd = tier.getCredits();
    creditService.grant(
        accountId,
        creditsToAdd,
        "SUBSCRIPTION",
        sub.getId(),
        "Kích hoạt gói " + tier.getDisplayName() + " (" + tier.name() + ")");
    account.setPremiumUntil(sub.getExpiresAt());
    account.setPremiumSource(tier.name());
    accountRepository.save(account);

    log.info(
        "[Subscription] Activated: account={} tier={} expires={} credits_added={}",
        accountId,
        tier.name(),
        sub.getExpiresAt(),
        creditsToAdd);

    // ── Send marketing welcome email (async, non-blocking) ──
    try {
      sendSubscriptionWelcomeEmail(account, tier, sub, creditsToAdd);
    } catch (Exception e) {
      log.warn(
          "[Subscription] Failed to send welcome email to {}: {}",
          account.getEmail(),
          e.getMessage());
    }
  }

  /** Sends a styled HTML welcome email after successful subscription. */
  private void sendSubscriptionWelcomeEmail(
      Account account, SubscriptionTier tier, HrSubscription sub, int creditsAdded) {
    String to = account.getEmail();
    if (to == null || to.isBlank()) return;

    String name = account.getFullName() != null ? account.getFullName() : "Nhà tuyển dụng";
    String expiryDate = sub.getExpiresAt().toLocalDate().toString();

    String subject = "🎉 Chào mừng bạn đến với ITing " + tier.name() + "!";
    String html =
        """
<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
  <div style="background:linear-gradient(135deg,#3AB4E6 0%%,#1e40af 100%%);padding:32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px">🚀 Chào mừng %s!</h1>
    <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px">Bạn đã kích hoạt gói <strong>%s</strong> thành công</p>
  </div>
  <div style="padding:24px 32px">
    <table style="width:100%%;border-collapse:collapse;margin-bottom:20px">
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Gói đăng ký</td><td style="padding:8px 0;text-align:right;font-weight:bold;color:#1f2937;font-size:14px">%s</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Thời hạn</td><td style="padding:8px 0;text-align:right;font-weight:bold;color:#1f2937;font-size:14px">%d ngày</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Ngày hết hạn</td><td style="padding:8px 0;text-align:right;font-weight:bold;color:#1f2937;font-size:14px">%s</td></tr>
      <tr style="background:#f0fdf4;border-radius:8px">
        <td style="padding:12px 8px;color:#059669;font-weight:bold;font-size:14px">💰 Credits được cộng</td>
        <td style="padding:12px 8px;text-align:right;font-weight:bold;color:#059669;font-size:18px">+%d credits</td>
      </tr>
    </table>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0;color:#1e40af;font-size:13px;font-weight:600">✨ Quyền lợi gói %s:</p>
      <p style="margin:8px 0 0;color:#374151;font-size:13px;line-height:1.6">%s</p>
    </div>
    <div style="text-align:center;margin:24px 0">
      <a href="https://datnhk252iting.dpdns.org/employer/dashboard" style="display:inline-block;background:#3AB4E6;color:#fff;padding:12px 32px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:14px">Bắt đầu tuyển dụng ngay →</a>
    </div>
    <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:24px;border-top:1px solid #f3f4f6;padding-top:16px">
      Cảm ơn bạn đã tin tưởng ITing. Nếu cần hỗ trợ, hãy liên hệ <a href="mailto:support@iting.vn" style="color:#3AB4E6">support@iting.vn</a>
    </p>
  </div>
</div>
"""
            .formatted(
                name,
                tier.name(),
                tier.getDisplayName(),
                tier.getPeriod().toDays(),
                expiryDate,
                creditsAdded,
                tier.name(),
                tier.getBenefits().replace("·", "<br>·"));

    emailService.sendHtmlEmail(to, subject, html);
    log.info("[Subscription] Welcome email sent to {}", to);
  }

  @Transactional
  public void cancelAutoRenew(Long accountId, String reason) {
    Optional<HrSubscription> opt = getActiveSubscription(accountId);
    if (opt.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không có subscription active");
    }
    HrSubscription sub = opt.get();
    sub.setAutoRenew(false);
    sub.setCancelReason(reason);
    sub.setCanceledAt(LocalDateTime.now());
    subscriptionRepository.save(sub);
  }

  private String generateOrderCode() {
    StringBuilder sb = new StringBuilder(orderPrefix).append("S");
    for (int i = 0; i < 7; i++) {
      sb.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
    }
    String code = sb.toString();
    if (orderRepository.findByOrderCode(code).isPresent()) return generateOrderCode();
    return code;
  }
}
