package com.iting.jobportal.payment.repository;

import com.iting.jobportal.payment.entity.SubscriptionTierPricing;
import org.springframework.data.jpa.repository.JpaRepository;

/** PK là tier code (BASIC/PRO/ENTERPRISE). */
public interface SubscriptionTierPricingRepository
    extends JpaRepository<SubscriptionTierPricing, String> {}
