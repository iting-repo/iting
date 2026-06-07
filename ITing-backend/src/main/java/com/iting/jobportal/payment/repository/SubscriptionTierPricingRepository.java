package com.iting.jobportal.payment.repository;

import com.iting.jobportal.payment.entity.SubscriptionTierPricing;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** PK là tier code (BASIC/PRO/ENTERPRISE hoặc gói tùy chỉnh do admin tạo). */
public interface SubscriptionTierPricingRepository
    extends JpaRepository<SubscriptionTierPricing, String> {

  List<SubscriptionTierPricing> findAllByOrderBySortOrderAscPriceVndAsc();
}
