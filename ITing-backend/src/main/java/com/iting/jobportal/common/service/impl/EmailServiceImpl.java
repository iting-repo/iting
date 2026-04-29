package com.iting.jobportal.common.service.impl;

import com.iting.jobportal.common.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendBanNotification(String toEmail, String reason, Integer durationDays) {
        String subject = "[ITing Job Portal] Thông báo khóa tài khoản";
        String durationStr = (durationDays == null) ? "vĩnh viễn" : durationDays + " ngày";
        
        String body = String.format(
            "Chào bạn,\n\n" +
            "Tài khoản của bạn trên hệ thống ITing Job Portal đã bị khóa.\n" +
            "Lý do: %s\n" +
            "Thời hạn: %s\n\n" +
            "Nếu bạn cho rằng đây là một sai sót, bạn có thể phản hồi lại email này để thực hiện kháng cáo.\n\n" +
            "Trân trọng,\n" +
            "Đội ngũ ITing.",
            reason, durationStr
        );

        sendEmail(toEmail, subject, body);
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ITing Job Portal <no-reply@iting.com>");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("ITing Job Portal <no-reply@iting.com>");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true indicates HTML
            
            mailSender.send(message);
            log.info("HTML Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
        }
    }
}
