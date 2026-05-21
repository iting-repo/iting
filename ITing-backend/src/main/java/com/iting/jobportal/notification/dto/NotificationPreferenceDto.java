package com.iting.jobportal.notification.dto;

import com.iting.jobportal.notification.entity.NotificationPreference;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalTime;

/**
 * DTO duy nhất dùng cho cả GET và PUT settings.
 * Tách khỏi entity để không lộ id/account, và để JSON time format ổn định ("HH:mm").
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferenceDto {

    // Notification categories
    private Boolean jobAlerts;
    private Boolean applicationUpdates;
    private Boolean newMessages;
    private Boolean recommendations;
    private Boolean systemUpdates;
    private Boolean promotions;
    private Boolean weeklyDigest;
    private Boolean followedCompanies;

    // Delivery channels
    private Boolean emailEnabled;
    private Boolean pushEnabled;
    private Boolean smsEnabled;
    private Boolean soundEnabled;

    // Quiet hours
    private Boolean quietHoursEnabled;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalTime quietHoursFrom;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalTime quietHoursTo;

    public static NotificationPreferenceDto fromEntity(NotificationPreference p) {
        return NotificationPreferenceDto.builder()
                .jobAlerts(p.getJobAlerts())
                .applicationUpdates(p.getApplicationUpdates())
                .newMessages(p.getNewMessages())
                .recommendations(p.getRecommendations())
                .systemUpdates(p.getSystemUpdates())
                .promotions(p.getPromotions())
                .weeklyDigest(p.getWeeklyDigest())
                .followedCompanies(p.getFollowedCompanies())
                .emailEnabled(p.getEmailEnabled())
                .pushEnabled(p.getPushEnabled())
                .smsEnabled(p.getSmsEnabled())
                .soundEnabled(p.getSoundEnabled())
                .quietHoursEnabled(p.getQuietHoursEnabled())
                .quietHoursFrom(p.getQuietHoursFrom())
                .quietHoursTo(p.getQuietHoursTo())
                .build();
    }
}
