package com.iting.jobportal.common.validation;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.entity.SystemConfig;
import com.iting.jobportal.admin.service.AdminConfigService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.test.util.ReflectionTestUtils;

class StrongPasswordValidatorTest {

  private final StrongPasswordValidator validator = new StrongPasswordValidator();

  // ─── Blank / null fallthrough to @NotBlank ───────────────────────────

  @ParameterizedTest
  @ValueSource(strings = {"", " ", "\t", "   "})
  void blankOrEmpty_isValid_letNotBlankCatchIt(String input) {
    assertTrue(
        validator.isValid(input, null),
        "Validator phải bỏ qua blank/empty, để @NotBlank xử lý riêng");
  }

  @Test
  void nullValue_isValid_letNotBlankCatchIt() {
    assertTrue(validator.isValid(null, null));
  }

  // ─── Length boundaries ───────────────────────────────────────────────

  @Test
  void tooShort_isInvalid() {
    assertFalse(validator.isValid("Aa1", null), "3 ký tự không đạt min 8");
    assertFalse(validator.isValid("Aa1bcde", null), "7 ký tự vẫn dưới min 8");
  }

  @Test
  void exactlyMinLength_isValid() {
    assertTrue(validator.isValid("Aa1bcdef", null), "Đủ 8 ký tự + đủ 3 nhóm → hợp lệ");
  }

  @Test
  void tooLong_isInvalid() {
    // 101 ký tự = max(100) + 1
    String oneAboveMax = "Aa1" + "x".repeat(98);
    assertFalse(validator.isValid(oneAboveMax, null));
  }

  @Test
  void exactlyMaxLength_isValid() {
    String maxLen = "Aa1" + "x".repeat(97); // tổng = 100
    assertTrue(validator.isValid(maxLen, null));
  }

  // ─── Character-class requirements ────────────────────────────────────

  @Test
  void missingUppercase_isInvalid() {
    assertFalse(validator.isValid("password123", null));
  }

  @Test
  void missingLowercase_isInvalid() {
    assertFalse(validator.isValid("PASSWORD123", null));
  }

  @Test
  void missingDigit_isInvalid() {
    assertFalse(validator.isValid("PasswordOnly", null));
  }

  @Test
  void allClassesPresent_isValid() {
    assertTrue(validator.isValid("Password1", null));
    assertTrue(validator.isValid("aB1xxxxx", null));
  }

  // ─── Common-password representative cases (smoke) ────────────────────

  @ParameterizedTest
  @ValueSource(
      strings = {
        "12345678", // chỉ digit
        "abcdefgh", // chỉ lower
        "ABCDEFGH", // chỉ upper
        "password", // common
        "qwerty", // quá ngắn
        "Password", // thiếu digit
        "PASSWORD1", // thiếu lower
        "password1" // thiếu upper
      })
  void weakPasswords_areInvalid(String pw) {
    assertFalse(validator.isValid(pw, null), "Mật khẩu yếu '" + pw + "' phải bị reject");
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "Password1",
        "MyP@ssw0rd", // có ký tự đặc biệt không sao, vẫn pass
        "Iting2026",
        "Abcdefg1",
        "aB1xxxxx"
      })
  void strongPasswords_areValid(String pw) {
    assertTrue(validator.isValid(pw, null), "Mật khẩu mạnh '" + pw + "' phải được chấp nhận");
  }

  // ─── Unicode short-circuit hint ──────────────────────────────────────

  @Test
  void unicodeNonAscii_doesNotCountAsUpperOrLowerOrDigit() {
    // 8 ký tự Vietnamese tones — không có ASCII upper/lower/digit
    assertFalse(validator.isValid("ăăăăăăăă", null));
  }

  // ─── minPasswordLength lấy từ SystemConfig (động) ────────────────────

  private StrongPasswordValidator validatorWithMinLen(Integer minLen) {
    AdminConfigService cfgService = mock(AdminConfigService.class);
    when(cfgService.getConfig())
        .thenReturn(SystemConfig.builder().minPasswordLength(minLen).build());
    StrongPasswordValidator v = new StrongPasswordValidator();
    ReflectionTestUtils.setField(v, "adminConfigService", cfgService);
    return v;
  }

  @Test
  void configMinLength12_rejectsValidEightCharPassword() {
    StrongPasswordValidator v = validatorWithMinLen(12);
    assertFalse(v.isValid("Aa1bcdef", null), "8 ký tự không đạt min 12 từ config");
    assertTrue(v.isValid("Aa1bcdefghij", null), "12 ký tự + đủ nhóm → hợp lệ");
  }

  @Test
  void configMinLength6_acceptsSixCharPassword() {
    StrongPasswordValidator v = validatorWithMinLen(6);
    assertTrue(v.isValid("Aa1bcd", null), "6 ký tự + đủ nhóm → hợp lệ khi min 6");
  }

  @Test
  void configNullMinLength_fallsBackToDefaultEight() {
    StrongPasswordValidator v = validatorWithMinLen(null);
    assertFalse(v.isValid("Aa1bcd", null), "config null → fallback min 8");
    assertTrue(v.isValid("Aa1bcdef", null));
  }
}
