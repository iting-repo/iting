package com.iting.jobportal.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "newsletter_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsletterSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    /** FOOTER | POPUP | LEAD_MAGNET | EXIT_INTENT */
    @Column(name = "source", nullable = false, length = 50)
    @Builder.Default
    private String source = "FOOTER";

    @Column(name = "lead_magnet", length = 100)
    private String leadMagnet;

    @Column(name = "unsubscribe_token", nullable = false, unique = true, length = 64)
    private String unsubscribeToken;

    @Column(name = "subscribed_at", nullable = false)
    private LocalDateTime subscribedAt;

    @Column(name = "unsubscribed_at")
    private LocalDateTime unsubscribedAt;

    @Column(name = "last_sent_at")
    private LocalDateTime lastSentAt;

    @Column(name = "utm_source", length = 100)
    private String utmSource;

    @Column(name = "utm_medium", length = 100)
    private String utmMedium;

    @Column(name = "utm_campaign", length = 200)
    private String utmCampaign;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @PrePersist
    void onCreate() {
        if (subscribedAt == null) subscribedAt = LocalDateTime.now();
    }
}
