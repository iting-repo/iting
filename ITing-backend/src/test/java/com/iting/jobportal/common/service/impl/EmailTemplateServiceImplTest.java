package com.iting.jobportal.common.service.impl;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

/**
 * Pure HTML template builder — không có DB/HTTP deps. Test branch coverage: purpose=RESET_PASSWORD
 * vs default, reason null/blank/non-blank.
 */
class EmailTemplateServiceImplTest {

  private final EmailTemplateServiceImpl service = new EmailTemplateServiceImpl();

  // ── getOtpTemplate ──────────────────────────────────────────────────

  @Test
  void getOtpTemplate_defaultPurpose_usesVerifyText() {
    String html = service.getOtpTemplate("Alice", "123456", "VERIFY");

    assertTrue(html.contains("Alice"));
    assertTrue(html.contains("123456"));
    assertTrue(html.contains("để xác thực tài khoản của bạn"));
    assertFalse(html.contains("để đặt lại mật khẩu"));
  }

  @Test
  void getOtpTemplate_resetPassword_usesResetText() {
    String html = service.getOtpTemplate("Bob", "999000", "RESET_PASSWORD");

    assertTrue(html.contains("Bob"));
    assertTrue(html.contains("999000"));
    assertTrue(html.contains("để đặt lại mật khẩu cho tài khoản ITing của bạn"));
    assertFalse(html.contains("để xác thực tài khoản của bạn"));
  }

  @Test
  void getOtpTemplate_nullPurpose_fallsBackToVerify() {
    String html = service.getOtpTemplate("Charlie", "111222", null);

    assertTrue(html.contains("để xác thực tài khoản của bạn"));
  }

  @Test
  void getOtpTemplate_includesBranding() {
    String html = service.getOtpTemplate("X", "0", "VERIFY");

    // ITing branding header + footer
    assertTrue(html.contains("ITing"));
    assertTrue(html.contains("&copy; 2026 ITing Job Portal"));
    assertTrue(html.contains("<!DOCTYPE html>"));
    assertTrue(html.contains("Mã xác thực của bạn"));
    // OTP expiry note
    assertTrue(html.contains("hết hạn sau 5 phút"));
  }

  // ── getApplicationAcceptedTemplate ─────────────────────────────────

  @Test
  void getApplicationAcceptedTemplate_includesAllParams() {
    String html =
        service.getApplicationAcceptedTemplate(
            "Alice", "Backend Dev", "ACME Corp", "https://iting.vn/applications/42");

    assertTrue(html.contains("Alice"));
    assertTrue(html.contains("Backend Dev"));
    assertTrue(html.contains("ACME Corp"));
    assertTrue(html.contains("https://iting.vn/applications/42"));
    assertTrue(html.contains("Chúc mừng"));
    assertTrue(html.contains("Xem chi tiết ứng tuyển"));
  }

  @Test
  void getApplicationAcceptedTemplate_actionUrlIsLinked() {
    String html = service.getApplicationAcceptedTemplate("A", "Dev", "Co", "/my-url");

    // anchor tag points at the actionUrl
    assertTrue(html.contains("href='/my-url'"));
  }

  @Test
  void getApplicationAcceptedTemplate_includesBranding() {
    String html = service.getApplicationAcceptedTemplate("A", "B", "C", "/u");

    assertTrue(html.contains("ITing"));
    assertTrue(html.contains("&copy; 2026 ITing Job Portal"));
  }

  // ── getApplicationRejectedTemplate ─────────────────────────────────

  @Test
  void getApplicationRejectedTemplate_withReason_includesReasonBlock() {
    String html =
        service.getApplicationRejectedTemplate(
            "Alice", "Backend Dev", "ACME", "Thiếu kinh nghiệm Spring Boot");

    assertTrue(html.contains("Alice"));
    assertTrue(html.contains("Backend Dev"));
    assertTrue(html.contains("ACME"));
    assertTrue(html.contains("Thiếu kinh nghiệm Spring Boot"));
    // Reason block styling marker (left-border italic)
    assertTrue(html.contains("border-left: 4px solid"));
  }

  @Test
  void getApplicationRejectedTemplate_nullReason_omitsReasonBlock() {
    String html = service.getApplicationRejectedTemplate("Alice", "Backend Dev", "ACME", null);

    // Reason block not rendered → no left-border styling
    assertFalse(html.contains("border-left: 4px solid #d1d5db"));
    // But main content still present
    assertTrue(html.contains("Alice"));
    assertTrue(html.contains("Backend Dev"));
  }

  @Test
  void getApplicationRejectedTemplate_blankReason_omitsReasonBlock() {
    String html = service.getApplicationRejectedTemplate("Alice", "Backend Dev", "ACME", "   ");

    // isBlank() check should drop reason block
    assertFalse(html.contains("border-left: 4px solid #d1d5db"));
  }

  @Test
  void getApplicationRejectedTemplate_emptyReason_omitsReasonBlock() {
    String html = service.getApplicationRejectedTemplate("Alice", "Backend Dev", "ACME", "");

    assertFalse(html.contains("border-left: 4px solid #d1d5db"));
  }

  @Test
  void getApplicationRejectedTemplate_includesEncouragementMessage() {
    String html = service.getApplicationRejectedTemplate("A", "B", "C", null);

    assertTrue(html.contains("Đừng nản lòng"));
    assertTrue(html.contains("hàng ngàn cơ hội"));
  }

  @Test
  void getApplicationRejectedTemplate_includesBranding() {
    String html = service.getApplicationRejectedTemplate("A", "B", "C", "r");

    assertTrue(html.contains("ITing"));
    assertTrue(html.contains("&copy; 2026 ITing Job Portal"));
  }

  // ── Wrapper smoke test ──────────────────────────────────────────────

  @Test
  void allTemplates_validHtmlStructure() {
    String otp = service.getOtpTemplate("A", "1", "VERIFY");
    String accepted = service.getApplicationAcceptedTemplate("A", "B", "C", "/u");
    String rejected = service.getApplicationRejectedTemplate("A", "B", "C", "r");

    for (String html : new String[] {otp, accepted, rejected}) {
      assertTrue(html.startsWith("<!DOCTYPE html>"));
      assertTrue(html.contains("<html>"));
      assertTrue(html.contains("</html>"));
      assertTrue(html.contains("<body>"));
      assertTrue(html.contains("</body>"));
      // Footer địa chỉ
      assertTrue(html.contains("Đại học Bách Khoa TP.HCM"));
    }
  }
}
