package com.iting.jobportal.common.service;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.common.entity.Referral;
import com.iting.jobportal.common.entity.ReferralCode;
import com.iting.jobportal.common.repository.ReferralCodeRepository;
import com.iting.jobportal.common.repository.ReferralRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Quản lý referral codes + attribution khi user đăng ký bằng `?ref=CODE`.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReferralService {

    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // skip I/O/0/1
    private static final int CODE_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ReferralCodeRepository codeRepository;
    private final ReferralRepository referralRepository;

    /**
     * Tạo (hoặc lấy) referral code cho 1 account. Idempotent.
     */
    @Transactional
    public ReferralCode getOrCreateCodeFor(Account account) {
        Optional<ReferralCode> existing = codeRepository.findByAccount_Id(account.getId());
        if (existing.isPresent()) return existing.get();

        String code = generateUniqueCode();
        ReferralCode rc = ReferralCode.builder()
                .account(account)
                .code(code)
                .totalInvited(0)
                .totalSignups(0)
                .build();
        return codeRepository.save(rc);
    }

    /**
     * Khi 1 user mới đăng ký với `?ref=CODE`, attribute họ vào referrer's account.
     * Idempotent — đã có Referral cho `referred` thì return existing.
     */
    @Transactional
    public Optional<Referral> attributeSignup(String refCode, Account newAccount) {
        if (refCode == null || refCode.isBlank()) return Optional.empty();

        Optional<ReferralCode> ownerCode = codeRepository.findByCode(refCode.toUpperCase().trim());
        if (ownerCode.isEmpty()) {
            log.debug("Referral code not found: {}", refCode);
            return Optional.empty();
        }

        ReferralCode owner = ownerCode.get();

        // Anti-fraud: không cho self-refer
        if (owner.getAccount() != null && newAccount.getId().equals(owner.getAccount().getId())) {
            log.warn("Self-referral attempt blocked for account {}", newAccount.getId());
            return Optional.empty();
        }

        // Idempotent
        Optional<Referral> existing = referralRepository.findByReferred_Id(newAccount.getId());
        if (existing.isPresent()) return existing;

        Referral ref = Referral.builder()
                .referrer(owner.getAccount())
                .referred(newAccount)
                .codeUsed(owner.getCode())
                .build();
        referralRepository.save(ref);

        // Update referrer's stats
        owner.setTotalSignups(owner.getTotalSignups() + 1);
        owner.setTotalInvited(owner.getTotalInvited() + 1);
        codeRepository.save(owner);

        log.info("Referral attributed: referrer={} referred={}", owner.getAccount().getId(), newAccount.getId());
        return Optional.of(ref);
    }

    /**
     * Đánh dấu conversion khi referred user submit ứng tuyển đầu tiên.
     * Trigger: gọi từ CandidateApplicationServiceImpl.applyJob.
     */
    @Transactional
    public void markFirstApplication(Long referredAccountId) {
        referralRepository.findByReferred_Id(referredAccountId)
                .filter(r -> r.getFirstApplicationAt() == null)
                .ifPresent(r -> {
                    r.setFirstApplicationAt(LocalDateTime.now());
                    referralRepository.save(r);
                    log.info("Referral conversion: referred={} -> first apply", referredAccountId);
                });
    }

    private String generateUniqueCode() {
        for (int attempts = 0; attempts < 10; attempts++) {
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                sb.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
            }
            String candidate = sb.toString();
            if (!codeRepository.existsByCode(candidate)) return candidate;
        }
        throw new IllegalStateException("Cannot generate unique referral code after 10 attempts");
    }
}
