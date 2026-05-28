package com.iting.jobportal.payment.entity;

import java.time.Duration;

/**
 * HR Premium tier pricing. Production: move to DB-driven config so admin can update prices without
 * redeploy.
 */
public enum SubscriptionTier {
  BASIC(
      199_000L,
      Duration.ofDays(30),
      "Basic — 199.000đ / tháng",
      "Đăng 10 job/tháng · 5 boost mỗi tháng · Email support",
      50),

  PRO(
      499_000L,
      Duration.ofDays(30),
      "Pro — 499.000đ / tháng",
      "Đăng 50 job/tháng · 20 boost · Talent pool search · Priority support · Analytics",
      200),

  ENTERPRISE(
      1_499_000L,
      Duration.ofDays(30),
      "Enterprise — 1.499.000đ / tháng",
      "Không giới hạn job · Bulk boost · AI auto-screening · Dedicated CSM · SLA 99.9%",
      1000);

  private final long priceVnd;
  private final Duration period;
  private final String displayName;
  private final String benefits;
  private final int credits;

  SubscriptionTier(
      long priceVnd, Duration period, String displayName, String benefits, int credits) {
    this.priceVnd = priceVnd;
    this.period = period;
    this.displayName = displayName;
    this.benefits = benefits;
    this.credits = credits;
  }

  public long getPriceVnd() {
    return priceVnd;
  }

  public Duration getPeriod() {
    return period;
  }

  public String getDisplayName() {
    return displayName;
  }

  public String getBenefits() {
    return benefits;
  }

  public int getCredits() {
    return credits;
  }
}
