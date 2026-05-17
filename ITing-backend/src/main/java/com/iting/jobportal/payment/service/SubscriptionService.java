package com.iting.jobportal.payment.service;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.payment.entity.HrSubscription;
import com.iting.jobportal.payment.entity.PaymentOrder;
import com.iting.jobportal.payment.entity.PaymentStatus;
import com.iting.jobportal.payment.entity.SubscriptionTier;
import com.iting.jobportal.payment.repository.HrSubscriptionRepository;
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
import java.util.Optional;

/**
 * Subscribe / activate / cancel HR Premium subscriptions.
 *
 * <p>Recurring billing flow:
 * <ul>
 *   <li>HR clicks "Subscribe Pro" → {@link #createSubscriptionOrder} creates a SEPAY {@link PaymentOrder}
 *       with item_type = PREMIUM_SUBSCRIPTION.</li>
 *   <li>When SEPAY webhook fires PAID → {@link #activateAfterPayment} extends/creates HrSubscription.</li>
 *   <li>{@link com.iting.jobportal.payment.task.SubscriptionRenewalTask} polls expiring subscriptions
 *       every hour and creates a fresh PENDING order for auto_renew=true users.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

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
     * Create a PENDING SEPAY order to subscribe (or renew) to a tier.
     * Returns same shape as boost-order — QR + bank info.
     */
    @Transactional
    public Map<String, Object> createSubscriptionOrder(Long accountId, SubscriptionTier tier, boolean autoRenew) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account không tồn tại"));

        String orderCode = generateOrderCode();
        PaymentOrder order = PaymentOrder.builder()
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
        bank.put("qrImageUrl", String.format(
                "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%d&des=%s&template=%s",
                accountNumber, bankCode, tier.getPriceVnd(), orderCode, qrTemplate));
        response.put("bank", bank);

        log.info("[Subscription] Order created: code={} tier={} account={}",
                orderCode, tier.name(), accountId);
        return response;
    }

    /**
     * Called by {@link SepayPaymentService#handleWebhook} when a PREMIUM_SUBSCRIPTION order is PAID.
     * Creates / extends the HrSubscription record.
     */
    @Transactional
    public void activateAfterPayment(PaymentOrder order) {
        if (!"PREMIUM_SUBSCRIPTION".equals(order.getItemType())) return;

        SubscriptionTier tier;
        try {
            tier = SubscriptionTier.valueOf(order.getTier());
        } catch (Exception e) {
            log.error("[Subscription] Unknown tier {} in order {}", order.getTier(), order.getOrderCode());
            return;
        }

        Long accountId = order.getAccount().getId();
        LocalDateTime now = LocalDateTime.now();

        Optional<HrSubscription> existing = subscriptionRepository
                .findFirstByAccount_IdAndStatusOrderByExpiresAtDesc(accountId, "ACTIVE");

        HrSubscription sub;
        if (existing.isPresent() && existing.get().getExpiresAt().isAfter(now)) {
            // Extend: add period to current expiry
            sub = existing.get();
            sub.setExpiresAt(sub.getExpiresAt().plus(tier.getPeriod()));
            sub.setTier(tier);
            sub.setLastPaymentOrderId(order.getId());
        } else {
            // New subscription
            sub = HrSubscription.builder()
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
        log.info("[Subscription] Activated: account={} tier={} expires={}",
                accountId, tier.name(), sub.getExpiresAt());
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
