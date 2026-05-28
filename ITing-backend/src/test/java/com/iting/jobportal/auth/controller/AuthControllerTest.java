package com.iting.jobportal.auth.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.auth.dto.request.ChangePasswordRequest;
import com.iting.jobportal.auth.dto.request.ForgotPasswordRequest;
import com.iting.jobportal.auth.dto.request.GoogleLoginRequest;
import com.iting.jobportal.auth.dto.request.LoginRequest;
import com.iting.jobportal.auth.dto.request.RegisterRequest;
import com.iting.jobportal.auth.dto.request.ResetPasswordRequest;
import com.iting.jobportal.auth.dto.response.LoginResponse;
import com.iting.jobportal.auth.dto.response.UserMeResponse;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.service.AuthService;
import com.iting.jobportal.auth.service.PasswordResetService;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * AuthController là pass-through cho AuthService + PasswordResetService. Test: - mỗi endpoint gọi
 * đúng service method với đúng args - response wrap (Map.of message) đúng format - exception từ
 * service propagate (verify-otp đặc biệt re-throw)
 *
 * <p>Note: KHÔNG test rate-limit / @Valid ở đây — đó là cross-cutting do Spring xử lý, không phải
 * code của controller.
 */
@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

  @Mock private AuthService authService;
  @Mock private PasswordResetService passwordResetService;
  @InjectMocks private AuthController controller;

  // ── register ─────────────────────────────────────────────────────────

  @Test
  void register_delegatesToService_returnsAccount() {
    RegisterRequest req =
        RegisterRequest.builder()
            .email("a@b.c")
            .password("Abcdef12")
            .fullName("X")
            .role(Role.CANDIDATE)
            .build();
    Account expected = new Account();
    expected.setId(1L);
    when(authService.register(req)).thenReturn(expected);

    Account result = controller.register(req);

    assertSame(expected, result);
    verify(authService).register(req);
  }

  // ── verifyOtp ────────────────────────────────────────────────────────

  @Test
  void verifyOtp_success_returnsOkWithMessage() {
    ResponseEntity<?> resp = controller.verifyOtp(Map.of("email", "a@b.c", "code", "123456"));

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    verify(authService).verifyOtp("a@b.c", "123456");
    assertTrue(resp.getBody() instanceof Map);
    assertEquals(
        "Xác thực tài khoản thành công! Vui lòng đăng nhập.",
        ((Map<?, ?>) resp.getBody()).get("message"));
  }

  @Test
  void verifyOtp_serviceThrows_rethrows() {
    // Controller có try/catch chỉ để log rồi throw lại — verify behavior này
    doThrow(new RuntimeException("Mã OTP không hợp lệ"))
        .when(authService)
        .verifyOtp("a@b.c", "wrong");

    RuntimeException ex =
        assertThrows(
            RuntimeException.class,
            () -> controller.verifyOtp(Map.of("email", "a@b.c", "code", "wrong")));
    assertEquals("Mã OTP không hợp lệ", ex.getMessage());
  }

  // ── resendOtp ────────────────────────────────────────────────────────

  @Test
  void resendOtp_callsService_andReturnsMessage() {
    ResponseEntity<?> resp = controller.resendOtp(Map.of("email", "a@b.c"));

    verify(authService).resendOtp("a@b.c");
    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertEquals("Mã OTP mới đã được gửi", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  // ── login ────────────────────────────────────────────────────────────

  @Test
  void login_delegatesToService_returnsLoginResponse() {
    LoginRequest req = new LoginRequest();
    LoginResponse expected = new LoginResponse();
    when(authService.login(req)).thenReturn(expected);

    LoginResponse result = controller.login(req);

    assertSame(expected, result);
  }

  // ── googleLogin ──────────────────────────────────────────────────────

  @Test
  void googleLogin_extractsTokenId_callsService() {
    GoogleLoginRequest req = new GoogleLoginRequest();
    req.setTokenId("google-token-xyz");
    LoginResponse expected = new LoginResponse();
    when(authService.loginWithGoogle("google-token-xyz")).thenReturn(expected);

    LoginResponse result = controller.googleLogin(req);

    assertSame(expected, result);
    verify(authService).loginWithGoogle("google-token-xyz");
  }

  // ── changePassword ───────────────────────────────────────────────────

  @Test
  void changePassword_passesAccountIdAndRequest() {
    ChangePasswordRequest req = new ChangePasswordRequest();
    req.setOldPassword("OldPass1");
    req.setNewPassword("NewPass1");

    controller.changePassword(42L, req);

    verify(authService).changePassword(42L, req);
  }

  // ── forgotPassword ───────────────────────────────────────────────────

  @Test
  void forgotPassword_callsService_returnsGenericMessage_noEmailEnum() {
    // Generic message để KHÔNG leak việc email có tồn tại hay không (security).
    ForgotPasswordRequest req = new ForgotPasswordRequest();
    req.setEmail("a@b.c");

    ResponseEntity<?> resp = controller.forgotPassword(req);

    verify(passwordResetService).createPasswordResetToken("a@b.c");
    assertEquals(HttpStatus.OK, resp.getStatusCode());
    String msg = (String) ((Map<?, ?>) resp.getBody()).get("message");
    assertEquals("Nếu có tài khoản, một email đặt lại mật khẩu đã được gửi", msg);
  }

  @Test
  void forgotPassword_serviceThrows_propagates_butStillNoEmailEnum() {
    // Kể cả khi service throws (ví dụ email không tồn tại), exception phải
    // propagate cho global handler chứ KHÔNG được swallow thành 200 ngẫu nhiên.
    ForgotPasswordRequest req = new ForgotPasswordRequest();
    req.setEmail("missing@x.y");
    doThrow(new RuntimeException("Account not found"))
        .when(passwordResetService)
        .createPasswordResetToken("missing@x.y");

    assertThrows(RuntimeException.class, () -> controller.forgotPassword(req));
  }

  // ── resetPassword ────────────────────────────────────────────────────

  @Test
  void resetPassword_unpacksRequest_callsService() {
    ResetPasswordRequest req = new ResetPasswordRequest();
    req.setEmail("a@b.c");
    req.setOtpCode("999111");
    req.setNewPassword("StrongPass1");

    ResponseEntity<?> resp = controller.resetPassword(req);

    verify(passwordResetService).resetPassword("a@b.c", "999111", "StrongPass1");
    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertEquals(
        "Mật khẩu đã được đặt lại thành công", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  // ── getMe ────────────────────────────────────────────────────────────

  @Test
  void getMe_delegatesToService() {
    UserMeResponse expected = new UserMeResponse();
    when(authService.getMeResponse(5L)).thenReturn(expected);

    ResponseEntity<?> resp = controller.getMe(5L);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(expected, resp.getBody());
  }
}
