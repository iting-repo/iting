package com.iting.jobportal.notification.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Cài đặt thông báo của ứng viên (1-1 với Account via @MapsId).
 * Mỗi user có đúng 1 row; tự tạo lazily ở tầng service nếu chưa tồn tại.
 */
@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private Account account;

    // ── Notification categories ──
    @Column(name = "job_alerts", nullable = false)
    @Builder.Default
    private Boolean jobAlerts = true;

    @Column(name = "application_updates", nullable = false)
    @Builder.Default
    private Boolean applicationUpdates = true;

    @Column(name = "new_messages", nullable = false)
    @Builder.Default
    private Boolean newMessages = true;

    @Column(name = "recommendations", nullable = false)
    @Builder.Default
    private Boolean recommendations = true;

    @Column(name = "system_updates", nullable = false)
    @Builder.Default
    private Boolean systemUpdates = false;

    @Column(name = "promotions", nullable = false)
    @Builder.Default
    private Boolean promotions = false;

    @Column(name = "weekly_digest", nullable = false)
    @Builder.Default
    private Boolean weeklyDigest = true;

    @Column(name = "followed_companies", nullable = false)
    @Builder.Default
    private Boolean followedCompanies = true;

    // ── Delivery channels ──
    @Column(name = "email_enabled", nullable = false)
    @Builder.Default
    private Boolean emailEnabled = true;

    @Column(name = "push_enabled", nullable = false)
    @Builder.Default
    private Boolean pushEnabled = true;

    @Column(name = "sms_enabled", nullable = false)
    @Builder.Default
    private Boolean smsEnabled = false;

    @Column(name = "sound_enabled", nullable = false)
    @Builder.Default
    private Boolean soundEnabled = true;

    // ── Quiet hours ──
    @Column(name = "quiet_hours_enabled", nullable = false)
    @Builder.Default
    private Boolean quietHoursEnabled = false;

    @Column(name = "quiet_hours_from")
    @Builder.Default
    private LocalTime quietHoursFrom = LocalTime.of(22, 0);

    @Column(name = "quiet_hours_to")
    @Builder.Default
    private LocalTime quietHoursTo = LocalTime.of(7, 0);

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
