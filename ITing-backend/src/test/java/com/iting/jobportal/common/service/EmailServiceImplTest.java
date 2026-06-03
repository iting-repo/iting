package com.iting.jobportal.common.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

import com.iting.jobportal.common.service.impl.EmailServiceImpl;
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

  @InjectMocks private EmailServiceImpl emailService;

  @Test
  void sendBanNotification_shouldBuildAndSendExpectedEmail() {
    emailService.sendBanNotification("user@test.com", "spam", 3);

    ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());
    assertEquals("user@test.com", captor.getValue().getTo()[0]);
    assertTrue(captor.getValue().getText().contains("spam"));
    assertTrue(captor.getValue().getText().contains("3"));
  }

  @Test
  void sendEmail_whenMailSenderFails_shouldNotThrow() {
    doThrow(new RuntimeException("smtp error"))
        .when(mailSender)
        .send(org.mockito.ArgumentMatchers.any(SimpleMailMessage.class));

    assertDoesNotThrow(() -> emailService.sendEmail("user@test.com", "Subject", "Body"));
  }
}
