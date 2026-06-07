package com.iting.jobportal.payment.service;

import com.iting.jobportal.payment.dto.SubscriptionTierCreateRequest;
import com.iting.jobportal.payment.dto.SubscriptionTierUpdateRequest;
import com.iting.jobportal.payment.entity.SubscriptionTierPricing;
import com.iting.jobportal.payment.repository.HrSubscriptionRepository;
import com.iting.jobportal.payment.repository.SubscriptionTierPricingRepository;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Nguồn sự thật cho giá / quyền lợi / quota của các gói HR. Toàn bộ gói lưu trong DB ({@link
 * SubscriptionTierPricing}) nên admin có thể tạo gói mới, sửa hoặc ẩn gói bất kỳ lúc nào mà không
 * cần redeploy. {@code code} là định danh duy nhất của gói (VD: BASIC, PRO, STARTER...).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionPricingService {

  private final SubscriptionTierPricingRepository repo;
  private final HrSubscriptionRepository subscriptionRepository;

  /** Code hợp lệ: in hoa, bắt đầu bằng chữ, chỉ chữ/số/gạch dưới, tối đa 30 ký tự. */
  private static final Pattern CODE_PATTERN = Pattern.compile("^[A-Z][A-Z0-9_]{1,29}$");

  // ─── Lookups ──────────────────────────────────────────────────────

  /** Tìm gói theo code (không phân biệt hoa thường). */
  public Optional<SubscriptionTierPricing> find(String code) {
    if (code == null || code.isBlank()) return Optional.empty();
    return repo.findById(code.trim().toUpperCase());
  }

  /** Lấy gói theo code, ném 404 nếu không tồn tại. */
  public SubscriptionTierPricing require(String code) {
    return find(code)
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gói không tồn tại: " + code));
  }

  /** Tất cả gói (kể cả đang ẩn) theo thứ tự hiển thị — dùng cho trang admin. */
  public List<SubscriptionTierPricing> listAll() {
    return repo.findAllByOrderBySortOrderAscPriceVndAsc();
  }

  /** Chỉ các gói đang active — dùng cho bảng giá public. */
  public List<SubscriptionTierPricing> listActive() {
    return listAll().stream().filter(SubscriptionTierPricing::isActive).toList();
  }

  // ─── Admin CRUD ───────────────────────────────────────────────────

  /** Admin tạo gói mới. */
  @Transactional
  public SubscriptionTierPricing create(SubscriptionTierCreateRequest req, Long adminId) {
    if (req.getCode() == null || req.getCode().isBlank()) throw badRequest("Vui lòng nhập mã gói");
    String code = req.getCode().trim().toUpperCase();
    if (!CODE_PATTERN.matcher(code).matches()) {
      throw badRequest("Mã gói chỉ gồm chữ in hoa, số, gạch dưới và bắt đầu bằng chữ (VD: STARTER)");
    }
    if (repo.existsById(code)) throw conflict("Mã gói đã tồn tại: " + code);
    if (req.getDisplayName() == null || req.getDisplayName().isBlank()) {
      throw badRequest("Vui lòng nhập tên hiển thị");
    }
    long price = req.getPriceVnd() == null ? 0 : req.getPriceVnd();
    if (price < 0) throw badRequest("Giá không được âm");
    int period = req.getPeriodDays() == null ? 30 : req.getPeriodDays();
    if (period < 1) throw badRequest("Số ngày phải ≥ 1");

    SubscriptionTierPricing p =
        SubscriptionTierPricing.builder()
            .code(code)
            .displayName(req.getDisplayName().trim())
            .priceVnd(price)
            .periodDays(period)
            .credits(nonNeg(req.getCredits(), "Credits"))
            .benefits(req.getBenefits() == null ? "" : req.getBenefits().trim())
            .maxJobsPerMonth(limitOrDefault(req.getMaxJobsPerMonth(), 0, "Giới hạn job"))
            .maxBoostsPerMonth(limitOrDefault(req.getMaxBoostsPerMonth(), 0, "Giới hạn boost"))
            .active(req.getActive() == null || req.getActive())
            .sortOrder(req.getSortOrder() == null ? 0 : req.getSortOrder())
            .popular(Boolean.TRUE.equals(req.getPopular()))
            .talentPool(Boolean.TRUE.equals(req.getTalentPool()))
            .badge(trimToNull(req.getBadge()))
            .accentColor(trimToNull(req.getAccentColor()))
            .updatedBy(adminId)
            .build();

    SubscriptionTierPricing saved = repo.save(p);
    log.info("[Pricing] Tier {} CREATED by admin {} (price={})", code, adminId, price);
    return saved;
  }

  /** Admin cập nhật (partial) một gói. */
  @Transactional
  public SubscriptionTierPricing update(
      String code, SubscriptionTierUpdateRequest req, Long adminId) {
    SubscriptionTierPricing p = require(code);

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
    if (req.getCredits() != null) p.setCredits(nonNeg(req.getCredits(), "Credits"));
    if (req.getBenefits() != null) p.setBenefits(req.getBenefits().trim());
    if (req.getMaxJobsPerMonth() != null) {
      p.setMaxJobsPerMonth(limitOrDefault(req.getMaxJobsPerMonth(), 0, "Giới hạn job"));
    }
    if (req.getMaxBoostsPerMonth() != null) {
      p.setMaxBoostsPerMonth(limitOrDefault(req.getMaxBoostsPerMonth(), 0, "Giới hạn boost"));
    }
    if (req.getActive() != null) p.setActive(req.getActive());
    if (req.getSortOrder() != null) p.setSortOrder(req.getSortOrder());
    if (req.getPopular() != null) p.setPopular(req.getPopular());
    if (req.getTalentPool() != null) p.setTalentPool(req.getTalentPool());
    if (req.getBadge() != null) p.setBadge(trimToNull(req.getBadge()));
    if (req.getAccentColor() != null) p.setAccentColor(trimToNull(req.getAccentColor()));
    p.setUpdatedBy(adminId);

    SubscriptionTierPricing saved = repo.save(p);
    log.info("[Pricing] Tier {} updated by admin {}", saved.getCode(), adminId);
    return saved;
  }

  /** Admin xóa gói. Chặn nếu đã có HR đăng ký (giữ toàn vẹn lịch sử) — nên ẩn thay vì xóa. */
  @Transactional
  public void delete(String code, Long adminId) {
    SubscriptionTierPricing p = require(code);
    if (subscriptionRepository.existsByTier(p.getCode())) {
      throw conflict(
          "Không thể xóa gói đã có HR đăng ký. Hãy tắt 'Hiển thị công khai' để ẩn gói thay vì xóa.");
    }
    repo.delete(p);
    log.info("[Pricing] Tier {} DELETED by admin {}", p.getCode(), adminId);
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  private int nonNeg(Integer v, String label) {
    int x = v == null ? 0 : v;
    if (x < 0) throw badRequest(label + " không được âm");
    return x;
  }

  /** -1 = vô hạn; cho phép -1 và số không âm. */
  private int limitOrDefault(Integer v, int def, String label) {
    int x = v == null ? def : v;
    if (x < -1) throw badRequest(label + " không hợp lệ (-1 = vô hạn)");
    return x;
  }

  private String trimToNull(String s) {
    if (s == null) return null;
    String t = s.trim();
    return t.isEmpty() ? null : t;
  }

  private ResponseStatusException badRequest(String msg) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
  }

  private ResponseStatusException conflict(String msg) {
    return new ResponseStatusException(HttpStatus.CONFLICT, msg);
  }
}
