package com.iting.jobportal.payment.entity;

import java.time.Duration;

/**
 * Featured job boost pricing tiers.
 *
 * <p>Prices in VND (integer). Production có thể di chuyển sang SystemConfig để admin
 * điều chỉnh price không cần deploy lại.
 */
public enum BoostTier {

    BOOST_7D ( 99_000L, Duration.ofDays(7),  "Boost 7 ngày"),
    BOOST_14D(179_000L, Duration.ofDays(14), "Boost 14 ngày"),
    BOOST_30D(299_000L, Duration.ofDays(30), "Boost 30 ngày");

    private final long priceVnd;
    private final Duration duration;
    private final String displayName;

    BoostTier(long priceVnd, Duration duration, String displayName) {
        this.priceVnd = priceVnd;
        this.duration = duration;
        this.displayName = displayName;
    }

    public long getPriceVnd() { return priceVnd; }
    public Duration getDuration() { return duration; }
    public String getDisplayName() { return displayName; }
}
