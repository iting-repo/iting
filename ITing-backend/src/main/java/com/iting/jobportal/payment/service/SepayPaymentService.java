package com.iting.jobportal.payment.service;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.company.service.AuthorizationService;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.payment.entity.BoostTier;
import com.iting.jobportal.payment.entity.PaymentOrder;
import com.iting.jobportal.payment.entity.PaymentStatus;
import com.iting.jobportal.payment.repository.PaymentOrderRepository;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * SEPAY integration — generates VietQR bank-transfer codes & processes webhooks.
 *
 * <p>Flow:
 *
 * <ol>
 *   <li>HR clicks "Boost job 7 ngày" → frontend POST <code>/api/hr/jobs/{id}/boost?tier=BOOST_7D
 *       </code>
 *   <li>This service creates a {@link PaymentOrder} (status=PENDING) + returns a unique <code>
 *       orderCode</code> and a SEPAY QR image URL.
 *   <li>HR scans QR with banking app → transfers exact amount with <code>orderCode</code> in
 *       description.
 *   <li>SEPAY's bank-statement watcher detects the transfer → sends webhook to <code>
 *       POST /api/public/payments/sepay-webhook</code> with the order code.
 *   <li>{@link #handleWebhook} matches by orderCode → updates status to PAID → activates featured.
 *   <li>Frontend polls <code>GET /api/me/payment-orders/{id}/status</code> every ~3s for the status
 *       flip.
 * </ol>
 *
 * <p>Config (application.properties):
 *
 * <pre>
 *   sepay.bank-code=Vietcombank
 *   sepay.account-number=0123456789
 *   sepay.account-name=ITING JSC
 *   sepay.webhook-api-key=secret-shared-with-sepay-dashboard
 *   sepay.qr-template=compact2     # compact | compact2 | qr_only | print
 *   sepay.order-prefix=ITI         # prefix for transfer-description matching
 * </pre>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SepayPaymentService {

  @Value("${sepay.bank-code:Vietcombank}")
  private String bankCode;

  @Value("${sepay.account-number:0123456789}")
  private String accountNumber;

  @Value("${sepay.account-name:ITING JSC}")
  private String accountName;

  /**
   * Shared secret in HTTP header "Authorization: Apikey XXX" — set both here and in SEPAY
   * dashboard.
   */
  @Value("${sepay.webhook-api-key:test-key-replace-in-prod}")
  private String webhookApiKey;

  @Value("${sepay.qr-template:compact2}")
  private String qrTemplate;

  @Value("${sepay.order-prefix:ITI}")
  private String orderPrefix;

  /** Order expires after this many minutes if unpaid. */
  @Value("${sepay.order-ttl-minutes:30}")
  private int orderTtlMinutes;

  private final PaymentOrderRepository orderRepository;
  private final JobRepository jobRepository;
  private final AccountRepository accountRepository;
  private final AuthorizationService authorizationService;
  private final SubscriptionService subscriptionService;
  private final QuotaService quotaService;

  private static final SecureRandom RANDOM = new SecureRandom();
  private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  // ─────────────────────────────────────────────────────────
  // Public API: create boost order
  // ─────────────────────────────────────────────────────────

  /**
   * Boost MIỄN PHÍ bằng hạn mức gói (plan-included). Dùng 1 lượt boost trong quota tháng (vd PRO 20
   * lượt). Hết quota → throw 402. Job được featured 7 ngày (cộng dồn nếu đang featured). Ghi 1
   * PaymentOrder 0đ đã kích hoạt để {@link QuotaService#requireBoostQuota} đếm đúng số lượt.
   */
  @Transactional
  public Map<String, Object> boostJobWithQuota(Long hrId, Long jobId) {
    quotaService.requireBoostQuota(hrId); // 402 nếu hết quota

    Long hrCompanyId = authorizationService.requireApprovedCompanyOf(hrId);
    Job job =
        jobRepository
            .findById(jobId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job không tồn tại"));
    if (job.getCompany() == null || !hrCompanyId.equals(job.getCompany().getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền boost job này");
    }
    Account account =
        accountRepository
            .findById(hrId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account không tồn tại"));

    BoostTier tier = BoostTier.BOOST_7D; // độ dài boost mặc định cho gói
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime baseline =
        (job.getFeaturedUntil() != null && job.getFeaturedUntil().isAfter(now))
            ? job.getFeaturedUntil()
            : now;
    job.setFeatured(true);
    job.setFeaturedUntil(baseline.plus(tier.getDuration()));
    job.setFeaturedTier(tier.name());
    jobRepository.save(job);

    // Order 0đ đã kích hoạt → tính vào quota boost.
    PaymentOrder order =
        PaymentOrder.builder()
            .account(account)
            .orderCode(generateOrderCode())
            .amount(0L)
            .description("Boost job " + jobId + " — dùng quota gói")
            .itemType("BOOST_JOB")
            .itemId(jobId)
            .tier(tier.name())
            .status(PaymentStatus.PAID)
            .activatedAt(now)
            .gateway("QUOTA")
            .build();
    orderRepository.save(order);

    log.info("[BOOST-QUOTA] Job {} boosted until {} by HR {}", jobId, job.getFeaturedUntil(), hrId);

    Map<String, Object> res = new LinkedHashMap<>();
    res.put("jobId", jobId);
    res.put("featuredUntil", job.getFeaturedUntil());
    res.putAll(quotaService.getBoostUsage(hrId));
    res.put("message", "Đã đẩy tin lên đầu trang (dùng 1 lượt boost của gói).");
    return res;
  }

  /**
   * Create a new boost order for a job. Validates HR ownership of the job.
   *
   * @param hrId authenticated HR account id
   * @param jobId job to be boosted
   * @param tier tier (price + duration)
   * @return order DTO including QR image URL + bank info
   */
  @Transactional
  public Map<String, Object> createBoostOrder(Long hrId, Long jobId, BoostTier tier) {
    // Enforce subscription quota: throw 402 nếu HR đã dùng đủ N boost/30 ngày.
    // Check TRƯỚC khi tạo order — tránh tạo PENDING order rồi block ở activation.
    // Quota tính theo activated_at (PAID + activated) — order PENDING không count.
    quotaService.requireBoostQuota(hrId);

    // Verify HR owns this job (via approved company affiliation)
    Long hrCompanyId = authorizationService.requireApprovedCompanyOf(hrId);
    Job job =
        jobRepository
            .findById(jobId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job không tồn tại"));
    if (job.getCompany() == null || !hrCompanyId.equals(job.getCompany().getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền boost job này");
    }

    Account account =
        accountRepository
            .findById(hrId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account không tồn tại"));

    String orderCode = generateOrderCode();
    PaymentOrder order =
        PaymentOrder.builder()
            .account(account)
            .orderCode(orderCode)
            .amount(tier.getPriceVnd())
            .description("Boost job " + jobId + " — " + tier.getDisplayName())
            .itemType("BOOST_JOB")
            .itemId(jobId)
            .tier(tier.name())
            .status(PaymentStatus.PENDING)
            .gateway("SEPAY")
            .expiresAt(LocalDateTime.now().plusMinutes(orderTtlMinutes))
            .build();
    orderRepository.save(order);

    Map<String, Object> response = new LinkedHashMap<>();
    response.put("orderId", order.getId());
    response.put("orderCode", orderCode);
    response.put("amount", tier.getPriceVnd());
    response.put("status", order.getStatus().name());
    response.put("expiresAt", order.getExpiresAt());
    response.put("tier", tier.name());
    response.put("tierDisplayName", tier.getDisplayName());

    // Bank info (HR transfers to this account, with orderCode in description)
    Map<String, Object> bank = new LinkedHashMap<>();
    bank.put("bankCode", bankCode);
    bank.put("accountNumber", accountNumber);
    bank.put("accountName", accountName);
    bank.put("transferContent", orderCode);
    bank.put("qrImageUrl", buildQrUrl(orderCode, tier.getPriceVnd()));
    response.put("bank", bank);

    log.info(
        "[SEPAY] Created boost order: id={} code={} jobId={} hr={} amount={}",
        order.getId(),
        orderCode,
        jobId,
        hrId,
        tier.getPriceVnd());

    return response;
  }

  /**
   * SEPAY QR image URL — using their public image generator (no API call needed at our side).
   * Documentation: https://sepay.vn/lap-trinh-vien.html
   */
  private String buildQrUrl(String orderCode, long amount) {
    return String.format(
        "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%d&des=%s&template=%s",
        accountNumber, bankCode, amount, orderCode, qrTemplate);
  }

  private String generateOrderCode() {
    // Format: ITI<6 random alphanumeric> — short enough to fit in bank transfer description
    StringBuilder sb = new StringBuilder(orderPrefix);
    for (int i = 0; i < 8; i++) {
      sb.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
    }
    String code = sb.toString();
    // Retry if collision
    if (orderRepository.findByOrderCode(code).isPresent()) {
      return generateOrderCode();
    }
    return code;
  }

  // ─────────────────────────────────────────────────────────
  // Public API: webhook handler
  // ─────────────────────────────────────────────────────────

  /**
   * Process a SEPAY webhook notification.
   *
   * <p>Expected payload (camelCase JSON from SEPAY):
   *
   * <pre>
   *   {
   *     "id": 1234567,
   *     "gateway": "Vietcombank",
   *     "transactionDate": "2026-05-11 14:30:00",
   *     "accountNumber": "0123456789",
   *     "code": null,                          // optional
   *     "content": "ITIA1B2C3D4 transfer note",
   *     "transferType": "in",
   *     "transferAmount": 99000,
   *     "referenceCode": "FT123...",
   *     "description": "..."
   *   }
   * </pre>
   *
   * <p>We match by extracting <code>orderCode</code> from the <code>content</code> field (since
   * user types it in bank-transfer description).
   *
   * @return true if order was found & marked PAID; false if no match or already processed
   */
  @Transactional
  public boolean handleWebhook(String providedApiKey, Map<String, Object> payload) {
    if (!verifyApiKey(providedApiKey)) {
      log.warn("[SEPAY] Webhook rejected — invalid API key");
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid API key");
    }

    String transferType = String.valueOf(payload.getOrDefault("transferType", ""));
    if (!"in".equalsIgnoreCase(transferType)) {
      log.debug("[SEPAY] Ignoring non-incoming transfer: {}", transferType);
      return false;
    }

    String content = String.valueOf(payload.getOrDefault("content", ""));
    String orderCode = extractOrderCode(content);
    if (orderCode == null) {
      log.warn("[SEPAY] Could not extract order code from content: {}", content);
      return false;
    }

    PaymentOrder order = orderRepository.findByOrderCode(orderCode).orElse(null);
    if (order == null) {
      log.warn("[SEPAY] No matching order for code: {}", orderCode);
      return false;
    }

    if (order.getStatus() == PaymentStatus.PAID) {
      // Order đã PAID từ trước nhưng có thể activation chưa chạy (vd: bug cũ
      // không handle item_type, deploy mới fix → retry webhook để catch-up).
      // activatePurchase phải idempotent — subscription guard bằng
      // lastPaymentOrderId, boost guard bằng featured_until expiry.
      log.info("[SEPAY] Order {} already paid — retry activation idempotently", orderCode);
      activatePurchase(order);
      return true;
    }

    // Verify amount matches (allow exact match; production may allow over-pay)
    long paidAmount = parseLong(payload.get("transferAmount"));
    if (paidAmount < order.getAmount()) {
      order.setStatus(PaymentStatus.FAILED);
      order.setPaidAmount(paidAmount);
      order.setRawWebhookPayload(payload.toString());
      orderRepository.save(order);
      log.warn(
          "[SEPAY] Amount mismatch for order {}: expected={}, paid={}",
          orderCode,
          order.getAmount(),
          paidAmount);
      return false;
    }

    // Mark paid
    order.setStatus(PaymentStatus.PAID);
    order.setPaidAmount(paidAmount);
    order.setPaidAt(LocalDateTime.now());
    order.setSepayTransactionId(String.valueOf(payload.get("id")));
    order.setSepayGatewayName(String.valueOf(payload.get("gateway")));
    order.setRawWebhookPayload(payload.toString());
    orderRepository.save(order);

    // Activate the purchased item
    activatePurchase(order);

    log.info(
        "[SEPAY] Order {} PAID — amount={} gateway={}",
        orderCode,
        paidAmount,
        order.getSepayGatewayName());
    return true;
  }

  private boolean verifyApiKey(String providedHeader) {
    if (providedHeader == null) return false;
    // Header format: "Apikey XXX" (per SEPAY docs)
    String key = providedHeader.replaceFirst("(?i)^Apikey\\s+", "").trim();
    return key.equals(webhookApiKey);
  }

  /** Extract order code (ITI followed by 8 alphanumeric chars) from any transfer content string. */
  private String extractOrderCode(String content) {
    if (content == null) return null;
    java.util.regex.Matcher m =
        java.util.regex.Pattern.compile("\\b" + orderPrefix + "[A-Z0-9]{8}\\b")
            .matcher(content.toUpperCase());
    return m.find() ? m.group() : null;
  }

  /** Apply the boost (or other purchase) to the target entity. */
  private void activatePurchase(PaymentOrder order) {
    // Idempotency guard chính: activated_at IS NOT NULL → đã activate, skip
    // toàn bộ. Webhook retry/replay sẽ no-op an toàn.
    if (order.getActivatedAt() != null) {
      log.info(
          "[SEPAY] Order {} already activated at {} — skip",
          order.getOrderCode(),
          order.getActivatedAt());
      return;
    }

    String itemType = order.getItemType();
    boolean activated = false;

    // Dispatch theo item_type. Subscription activation đã có sẵn trong
    // SubscriptionService.activateAfterPayment (tạo HrSubscription, cộng
    // credits, gửi email welcome). Inner method còn check lastPaymentOrderId
    // làm second-line idempotency.
    if ("PREMIUM_SUBSCRIPTION".equals(itemType)) {
      subscriptionService.activateAfterPayment(order);
      activated = true;
    } else if ("BOOST_JOB".equals(itemType)) {
      Job job = jobRepository.findById(order.getItemId()).orElse(null);
      if (job == null) {
        log.error("[SEPAY] BOOST_JOB activated but job {} not found", order.getItemId());
        return;
      }
      BoostTier tier = BoostTier.valueOf(order.getTier());
      LocalDateTime now = LocalDateTime.now();
      LocalDateTime baseline =
          (job.getFeaturedUntil() != null && job.getFeaturedUntil().isAfter(now))
              ? job.getFeaturedUntil()
              : now;
      job.setFeaturedUntil(baseline.plus(tier.getDuration()));
      job.setFeaturedTier(tier.name());
      jobRepository.save(job);
      log.info("[SEPAY] Job {} boosted until {}", job.getId(), job.getFeaturedUntil());
      activated = true;
    } else {
      log.warn("Unknown item_type {}, skipping activation", itemType);
    }

    if (activated) {
      order.setActivatedAt(LocalDateTime.now());
      orderRepository.save(order);
    }
  }

  private long parseLong(Object o) {
    if (o == null) return 0;
    try {
      return Long.parseLong(o.toString().replaceAll("[^0-9-]", ""));
    } catch (NumberFormatException e) {
      return 0;
    }
  }

  // ─────────────────────────────────────────────────────────
  // Public API: order status lookup
  // ─────────────────────────────────────────────────────────

  public Map<String, Object> getOrderStatus(Long hrId, Long orderId) {
    PaymentOrder order =
        orderRepository
            .findById(orderId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order không tồn tại"));

    if (order.getAccount() == null || !hrId.equals(order.getAccount().getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền xem order này");
    }

    Map<String, Object> m = new LinkedHashMap<>();
    m.put("orderId", order.getId());
    m.put("orderCode", order.getOrderCode());
    m.put("status", order.getStatus().name());
    m.put("amount", order.getAmount());
    m.put("paidAmount", order.getPaidAmount());
    m.put("paidAt", order.getPaidAt());
    m.put("expiresAt", order.getExpiresAt());
    m.put("itemType", order.getItemType());
    m.put("itemId", order.getItemId());
    m.put("tier", order.getTier());
    return m;
  }
}
