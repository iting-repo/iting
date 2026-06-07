package com.iting.jobportal.common.service.impl;

import com.iting.jobportal.admin.entity.SystemConfig;
import com.iting.jobportal.admin.service.AdminConfigService;
import com.iting.jobportal.common.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

  private static final String DEFAULT_FROM = "ITing Job Portal <no-reply@iting.com>";
  /** Giá trị placeholder trong SystemConfig mặc định — KHÔNG dùng để gửi email thật. */
  private static final String PLACEHOLDER_PASSWORD = "password";

  /** mailSender mặc định cấu hình qua application.properties (spring.mail.*). */
  private final JavaMailSender mailSender;

  // Optional: dùng cấu hình SMTP trong DB nếu admin đã nhập thật. Test (@InjectMocks không mock) → null.
  @Autowired(required = false)
  private AdminConfigService adminConfigService;

  /**
   * Chọn JavaMailSender: nếu SystemConfig có SMTP cấu hình THẬT (host + port + password khác
   * placeholder) → build sender động từ DB; ngược lại fallback về mailSender mặc định.
   */
  private JavaMailSender resolveSender() {
    SystemConfig cfg = currentConfig();
    if (cfg == null) return mailSender;

    String host = cfg.getSmtpHost();
    String portStr = cfg.getSmtpPort();
    String user = cfg.getSmtpUser();
    String pass = cfg.getSmtpPassword();

    if (host == null || host.isBlank() || portStr == null || portStr.isBlank()) return mailSender;
    if (pass == null || pass.isBlank() || PLACEHOLDER_PASSWORD.equals(pass)) {
      return mailSender; // chưa cấu hình thật → tránh làm hỏng email
    }

    int port;
    try {
      port = Integer.parseInt(portStr.trim());
    } catch (NumberFormatException e) {
      return mailSender;
    }

    JavaMailSenderImpl s = new JavaMailSenderImpl();
    s.setHost(host.trim());
    s.setPort(port);
    if (user != null && !user.isBlank()) s.setUsername(user.trim());
    s.setPassword(pass);
    Properties props = s.getJavaMailProperties();
    props.put("mail.transport.protocol", "smtp");
    props.put("mail.smtp.auth", "true");
    props.put("mail.smtp.starttls.enable", "true");
    return s;
  }

  /** Header "From": ưu tiên emailFromName + smtpUser trong DB, fallback mặc định. */
  private String resolveFrom() {
    SystemConfig cfg = currentConfig();
    if (cfg != null
        && cfg.getSmtpUser() != null
        && !cfg.getSmtpUser().isBlank()
        && cfg.getSmtpPassword() != null
        && !PLACEHOLDER_PASSWORD.equals(cfg.getSmtpPassword())) {
      String name =
          (cfg.getEmailFromName() != null && !cfg.getEmailFromName().isBlank())
              ? cfg.getEmailFromName()
              : "ITing";
      return name + " <" + cfg.getSmtpUser().trim() + ">";
    }
    return DEFAULT_FROM;
  }

  private SystemConfig currentConfig() {
    if (adminConfigService == null) return null;
    try {
      return adminConfigService.getConfig();
    } catch (RuntimeException e) {
      return null;
    }
  }

  @Override
  public void sendBanNotification(String toEmail, String reason, Integer durationDays) {
    String subject = "[ITing Job Portal] Thông báo khóa tài khoản";
    String durationStr = (durationDays == null) ? "vĩnh viễn" : durationDays + " ngày";

    String body =
        String.format(
            "Chào bạn,\n\n"
                + "Tài khoản của bạn trên hệ thống ITing Job Portal đã bị khóa.\n"
                + "Lý do: %s\n"
                + "Thời hạn: %s\n\n"
                + "Nếu bạn cho rằng đây là một sai sót, bạn có thể phản hồi lại email này để thực"
                + " hiện kháng cáo.\n\n"
                + "Trân trọng,\n"
                + "Đội ngũ ITing.",
            reason, durationStr);

    sendEmail(toEmail, subject, body);
  }

  @Override
  public void sendEmail(String to, String subject, String body) {
    try {
      SimpleMailMessage message = new SimpleMailMessage();
      message.setFrom(resolveFrom());
      message.setTo(to);
      message.setSubject(subject);
      message.setText(body);
      resolveSender().send(message);
      log.info("Email sent successfully to {}", to);
    } catch (Exception e) {
      log.error("Failed to send email to {}: {}", to, e.getMessage());
    }
  }

  @Override
  public void sendHtmlEmail(String to, String subject, String htmlBody) {
    try {
      JavaMailSender sender = resolveSender();
      MimeMessage message = sender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom(resolveFrom());
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(htmlBody, true); // true indicates HTML

      sender.send(message);
      log.info("HTML Email sent successfully to {}", to);
    } catch (Exception e) {
      log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
    }
  }
}
