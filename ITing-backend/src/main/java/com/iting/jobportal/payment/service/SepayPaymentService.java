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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * SEPAY integration — generates VietQR bank-transfer codes & processes webhooks.
 *
 * <p>Flow:
 * <ol>
 *   <li>HR clicks "Boost job 7 ngày" → frontend POST <code>/api/hr/jobs/{id}/boost?tier=BOOST_7D</code></li>
 *   <li>This service creates a {@link PaymentOrder} (status=PENDING) + returns a unique <code>orderCode</code>
 *       and a SEPAY QR image URL.</li>
 *   <li>HR scans QR with banking app → transfers exact amount with <code>orderCode</code> in description.</li>
 *   <li>SEPAY's bank-statement watcher detects the transfer → sends webhook to
 *       <code>POST /api/public/payments/sepay-webhook</code> with the order code.</li>
 *   <li>{@link #handleWebhook} matches by orderCode → updates status to PAID → activates featured.</li>
 *   <li>Frontend polls <code>GET /api/me/payment-orders/{id}/status</code> every ~3s for the status flip.</li>
 * </ol>
 *
 * <p>Config (application.properties):
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

    /** Shared secret in HTTP header "Authorization: Apikey XXX" — set both here and in SEPAY dashboard. */
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
    private final java.util.Optional<SubscriptionService> subscriptionService;
    private final java.util.Optional<com.iting.jobportal.payment.service.InvoicePdfService> invoicePdfService;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    // ─────────────────────────────────────────────────────────
    // Public API: create boost order
    // ─────────────────────────────────────────────────────────

    /**
     * Create a new boost order for a job. Validates HR ownership of the job.
     *
     * @param hrId        authenticated HR account id
     * @param jobId       job to be boosted
     * @param tier        tier (price + duration)
     * @return order DTO including QR image URL + bank info
     */
    @Transactional
    public Map<String, Object> createBoostOrder(Long hrId, Long jobId, BoostTier tier) {
        // Verify HR owns this job (via approved company affiliation)
        Long hrCompanyId = authorizationService.requireApprovedCompanyOf(hrId);
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job không tồn tại"));
        if (job.getCompany() == null || !hrCompanyId.equals(job.getCompany().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền boost job này");
        }

        Account account = accountRepository.findById(hrId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account không tồn tại"));

        String orderCode = generateOrderCode();
        PaymentOrder order = PaymentOrder.builder()
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

        log.info("[SEPAY] Created boost order: id={} code={} jobId={} hr={} amount={}",
                order.getId(), orderCode, jobId, hrId, tier.getPriceVnd());

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
     * <p>We match by extracting <code>orderCode</code> from the <code>content</code> field
     * (since user types it in bank-transfer description).
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
            log.info("[SEPAY] Order {} already paid — idempotent skip", orderCode);
            return true;
        }

        // Verify amount matches (allow exact match; production may allow over-pay)
        long paidAmount = parseLong(payload.get("transferAmount"));
        if (paidAmount < order.getAmount()) {
            order.setStatus(PaymentStatus.FAILED);
            order.setPaidAmount(paidAmount);
            order.setRawWebhookPayload(payload.toString());
            orderRepository.save(order);
            log.warn("[SEPAY] Amount mismatch for order {}: expected={}, paid={}",
                    orderCode, order.getAmount(), paidAmount);
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

        log.info("[SEPAY] Order {} PAID — amount={} gateway={}", orderCode, paidAmount, order.getSepayGatewayName());
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
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("\\b" + orderPrefix + "[A-Z0-9]{8}\\b")
                .matcher(content.toUpperCase());
        return m.find() ? m.group() : null;
    }

    /** Apply the boost / subscription / etc. to the target entity. */
    private void activatePurchase(PaymentOrder order) {
        switch (order.getItemType() == null ? "" : order.getItemType()) {
            case "BOOST_JOB" -> activateBoostJob(order);
            case "PREMIUM_SUBSCRIPTION" -> subscriptionService.ifPresent(s -> s.activateAfterPayment(order));
            default -> log.warn("Unknown item_type {}, skipping activation", order.getItemType());
        }

        // Auto-generate invoice for any PAID order (best-effort, non-blocking)
        invoicePdfService.ifPresent(svc -> {
            try { svc.autoGenerateForPaidOrder(order); }
            catch (Exception e) { log.warn("Invoice auto-gen failed for order {}: {}", order.getOrderCode(), e.getMessage()); }
        });
    }

    private void activateBoostJob(PaymentOrder order) {
        Job job = jobRepository.findById(order.getItemId()).orElse(null);
        if (job == null) {
            log.error("[SEPAY] BOOST_JOB activated but job {} not found", order.getItemId());
            return;
        }
        BoostTier tier = BoostTier.valueOf(order.getTier());
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime baseline = (job.getFeaturedUntil() != null && job.getFeaturedUntil().isAfter(now))
                ? job.getFeaturedUntil() : now;
        job.setFeaturedUntil(baseline.plus(tier.getDuration()));
        job.setFeaturedTier(tier.name());
        jobRepository.save(job);
        log.info("[SEPAY] Job {} boosted until {}", job.getId(), job.getFeaturedUntil());
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
        PaymentOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order không tồn tại"));

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
