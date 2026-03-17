package com.iting.jobportal.common.service;

public interface EmailService {
    void sendBanNotification(String toEmail, String reason, Integer durationDays);
    void sendEmail(String to, String subject, String body);
}
