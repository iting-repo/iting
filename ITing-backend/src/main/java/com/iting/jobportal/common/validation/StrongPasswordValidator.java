package com.iting.jobportal.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

  private static final int MIN_LEN = 8;
  private static final int MAX_LEN = 100;

  @Override
  public boolean isValid(String value, ConstraintValidatorContext ctx) {
    if (value == null || value.isBlank()) return true; // @NotBlank handle riêng

    if (value.length() < MIN_LEN || value.length() > MAX_LEN) return false;

    boolean hasUpper = false;
    boolean hasLower = false;
    boolean hasDigit = false;
    for (int i = 0; i < value.length(); i++) {
      char c = value.charAt(i);
      if (Character.isUpperCase(c)) hasUpper = true;
      else if (Character.isLowerCase(c)) hasLower = true;
      else if (Character.isDigit(c)) hasDigit = true;
      if (hasUpper && hasLower && hasDigit) return true;
    }
    return hasUpper && hasLower && hasDigit;
  }
}
