package com.iting.jobportal.common.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@ExtendWith(MockitoExtension.class)
class EmailServiceImplTest {

  @Mock private JavaMailSender mailSender;

  @InjectMocks private EmailServiceImpl service;

  // ── sendBanNotification ─────────────────────────────────────────────

  @Test
  void sendBanNotification_temporary_includesDurationDays() {
    service.sendBanNotification("user@iting.vn", "Spam", 7);

    ArgumentCaptor<SimpleMailMessage> cap = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(cap.capture());
    SimpleMailMessage msg = cap.getValue();

    assertEquals("[ITing Job Portal] Thông báo khóa tài khoản", msg.getSubject());
    assertNotNull(msg.getTo());
    assertEquals("user@iting.vn", msg.getTo()[0]);
    assertTrue(msg.getText().contains("Spam"));
    assertTrue(msg.getText().contains("7 ngày"));
    assertTrue(msg.getText().contains("ITing"));
  }

  @Test
  void sendBanNotification_permanent_nullDuration_usesVinhVien() {
    service.sendBanNotification("user@iting.vn", "Violations", null);

    ArgumentCaptor<SimpleMailMessage> cap = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(cap.capture());
    SimpleMailMessage msg = cap.getValue();

    assertTrue(msg.getText().contains("vĩnh viễn"));
    assertTrue(msg.getText().contains("Violations"));
  }

  // ── sendEmail ───────────────────────────────────────────────────────

  @Test
  void sendEmail_happyPath_passesAllFields() {
    service.sendEmail("to@iting.vn", "Subject", "Body");

    ArgumentCaptor<SimpleMailMessage> cap = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(cap.capture());
    SimpleMailMessage msg = cap.getValue();

    assertEquals("ITing Job Portal <no-reply@iting.com>", msg.getFrom());
    assertEquals("to@iting.vn", msg.getTo()[0]);
    assertEquals("Subject", msg.getSubject());
    assertEquals("Body", msg.getText());
  }

  @Test
  void sendEmail_mailSenderThrows_isCaughtAndSwallowed() {
    doThrow(new RuntimeException("SMTP down")).when(mailSender).send(any(SimpleMailMessage.class));

    // không exception lan ra caller — best-effort
    service.sendEmail("to@iting.vn", "S", "B");

    verify(mailSender).send(any(SimpleMailMessage.class));
  }

  // ── sendHtmlEmail ───────────────────────────────────────────────────

  @Test
  void sendHtmlEmail_happyPath_usesMimeMessage() {
    MimeMessage mime = new MimeMessage(Session.getInstance(new Properties()));
    when(mailSender.createMimeMessage()).thenReturn(mime);

    service.sendHtmlEmail("to@iting.vn", "Subj", "<h1>Hi</h1>");

    verify(mailSender).send(mime);
  }

  @Test
  void sendHtmlEmail_createMimeMessageThrows_isCaughtAndSwallowed() {
    when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("mail down"));

    // không exception → service nuốt error
    service.sendHtmlEmail("to@iting.vn", "S", "<p/>");

    verify(mailSender, never()).send(any(MimeMessage.class));
  }
}
