package com.iting.jobportal.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Mật khẩu hợp lệ: ≥ 8 ký tự, có chữ HOA, chữ thường và số. Không bắt buộc ký tự đặc biệt — NIST
 * 800-63B khuyến nghị không ép special char vì user tendency là viết ra giấy. Tách thành annotation
 * chung để Register / ChangePassword / ResetPassword dùng cùng 1 rule + 1 message.
 *
 * <p>Không validate null/blank — để @NotBlank handle riêng (single concern).
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = StrongPasswordValidator.class)
public @interface StrongPassword {
  String message() default "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ HOA, chữ thường và số";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}
