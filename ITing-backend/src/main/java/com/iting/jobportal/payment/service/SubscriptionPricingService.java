package com.iting.jobportal.payment.service;

import com.iting.jobportal.payment.dto.SubscriptionTierUpdateRequest;
import com.iting.jobportal.payment.entity.SubscriptionTier;
import com.iting.jobportal.payment.entity.SubscriptionTierPricing;
import com.iting.jobportal.payment.repository.SubscriptionTierPricingRepository;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Nguồn sự thật cho giá/quyền lợi/quota của gói HR. Đọc override từ DB ({@link
 * SubscriptionTierPricing}); nếu một tier chưa có row thì fallback về default hardcode trong {@link
 * SubscriptionTier}. Nhờ đó admin đổi giá là có hiệu lực ngay, không cần redeploy.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionPricingService {

  private final SubscriptionTierPricingRepository repo;

  /** Giá hiệu lực của một tier (DB override hoặc default enum). Không bao giờ trả null. */
  public SubscriptionTierPricing getPricing(SubscriptionTier tier) {
    return repo.findById(tier.name()).orElseGet(() -> fromEnum(tier));
  }

  /** Tất cả tier theo thứ tự enum, kèm giá hiệu lực — dùng cho trang admin. */
  public List<SubscriptionTierPricing> listAll() {
    return Arrays.stream(SubscriptionTier.values())
        .map(this::getPricing)
        .collect(Collectors.toList());
  }

  /** Chỉ các tier đang active — dùng cho bảng giá public. */
  public List<SubscriptionTierPricing> listActive() {
    return listAll().stream()
        .filter(SubscriptionTierPricing::isActive)
        .collect(Collectors.toList());
  }

  /** Admin cập nhật (partial) giá/quyền lợi của một tier. Tự seed row nếu chưa tồn tại. */
  @Transactional
  public SubscriptionTierPricing update(
      String code, SubscriptionTierUpdateRequest req, Long adminId) {
    SubscriptionTier tier;
    try {
      tier = SubscriptionTier.valueOf(code.toUpperCase());
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tier code không hợp lệ: " + code);
    }

    SubscriptionTierPricing p = repo.findById(tier.name()).orElseGet(() -> fromEnum(tier));

    if (req.getDisplayName() != null) {
      if (req.getDisplayName().isBlank()) throw badRequest("Tên hiển thị không được để trống");
      p.setDisplayName(req.getDisplayName().trim());
    }
    if (req.getPriceVnd() != null) {
      if (req.getPriceVnd() < 0) throw badRequest("Giá không được âm");
      p.setPriceVnd(req.getPriceVnd());
    }
    if (req.getPeriodDays() != null) {
      if (req.getPeriodDays() < 1) throw badRequest("Số ngày phải ≥ 1");
      p.setPeriodDays(req.getPeriodDays());
    }
    if (req.getCredits() != null) {
      if (req.getCredits() < 0) throw badRequest("Credits không được âm");
      p.setCredits(req.getCredits());
    }
    if (req.getBenefits() != null) p.setBenefits(req.getBenefits().trim());
    if (req.getMaxJobsPerMonth() != null) {
      if (req.getMaxJobsPerMonth() < -1) throw badRequest("Giới hạn job không hợp lệ (-1 = vô hạn)");
      p.setMaxJobsPerMonth(req.getMaxJobsPerMonth());
    }
    if (req.getMaxBoostsPerMonth() != null) {
      if (req.getMaxBoostsPerMonth() < -1)
        throw badRequest("Giới hạn boost không hợp lệ (-1 = vô hạn)");
      p.setMaxBoostsPerMonth(req.getMaxBoostsPerMonth());
    }
    if (req.getActive() != null) p.setActive(req.getActive());
    p.setUpdatedBy(adminId);

    SubscriptionTierPricing saved = repo.save(p);
    log.info(
        "[Pricing] Tier {} updated by admin {} → price={} period={}d credits={} active={}",
        saved.getCode(),
        adminId,
        saved.getPriceVnd(),
        saved.getPeriodDays(),
        saved.getCredits(),
        saved.isActive());
    return saved;
  }

  /** Build transient pricing từ default của enum (không persist). */
  private SubscriptionTierPricing fromEnum(SubscriptionTier t) {
    return SubscriptionTierPricing.builder()
        .code(t.name())
        .displayName(t.getDisplayName())
        .priceVnd(t.getPriceVnd())
        .periodDays((int) t.getPeriod().toDays())
        .credits(t.getCredits())
        .benefits(t.getBenefits())
        .maxJobsPerMonth(t.getMaxJobsPerMonth())
        .maxBoostsPerMonth(t.getMaxBoostsPerMonth())
        .active(true)
        .build();
  }

  private ResponseStatusException badRequest(String msg) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
  }
}
