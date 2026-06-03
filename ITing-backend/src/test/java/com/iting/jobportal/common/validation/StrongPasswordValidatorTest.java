package com.iting.jobportal.common.validation;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

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
}
