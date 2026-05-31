package com.iting.jobportal.payment.entity;

import java.time.Duration;

/**
 * HR Premium tier pricing. Production: move to DB-driven config so admin can update prices without
 * redeploy.
 */
public enum SubscriptionTier {
  // Quota: maxJobs = số job được đăng trong 30 ngày từ start subscription.
  // maxBoosts = số boost trong cùng cửa sổ. -1 = unlimited (ENTERPRISE).
  BASIC(
      199_000L,
      Duration.ofDays(30),
      "Basic — 199.000đ / tháng",
      "Đăng 10 job/tháng · 5 boost mỗi tháng · Email support",
      50,
      10,
      5),

  PRO(
      499_000L,
      Duration.ofDays(30),
      "Pro — 499.000đ / tháng",
      "Đăng 50 job/tháng · 20 boost · Talent pool search · Priority support · Analytics",
      200,
      50,
      20),

  ENTERPRISE(
      1_499_000L,
      Duration.ofDays(30),
      "Enterprise — 1.499.000đ / tháng",
      "Không giới hạn job · Bulk boost · AI auto-screening · Dedicated CSM · SLA 99.9%",
      1000,
      -1,
      -1);

  /**
   * Free tier mặc định cho HR chưa subscribe — cho phép trải nghiệm trước khi mua.
   * Áp dụng cho cả jobs + boosts. Counted theo cùng cửa sổ 30 ngày (theo created_at).
   */
  public static final int FREE_MAX_JOBS_PER_MONTH = 3;
  public static final int FREE_MAX_BOOSTS_PER_MONTH = 1;

  private final long priceVnd;
  private final Duration period;
  private final String displayName;
  private final String benefits;
  private final int credits;
  private final int maxJobsPerMonth;
  private final int maxBoostsPerMonth;

  SubscriptionTier(
      long priceVnd,
      Duration period,
      String displayName,
      String benefits,
      int credits,
      int maxJobsPerMonth,
      int maxBoostsPerMonth) {
    this.priceVnd = priceVnd;
    this.period = period;
    this.displayName = displayName;
    this.benefits = benefits;
    this.credits = credits;
    this.maxJobsPerMonth = maxJobsPerMonth;
    this.maxBoostsPerMonth = maxBoostsPerMonth;
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

  /** -1 = unlimited (Enterprise). 0 hoặc dương = giới hạn cứng. */
  public int getMaxJobsPerMonth() {
    return maxJobsPerMonth;
  }

  public int getMaxBoostsPerMonth() {
    return maxBoostsPerMonth;
  }
}
