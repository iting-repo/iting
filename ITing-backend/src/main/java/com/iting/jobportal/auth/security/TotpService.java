package com.iting.jobportal.auth.security;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;

/**
 * TOTP (RFC 6238) tương thích Google Authenticator — tự cài, không cần thư viện ngoài.
 *
 * <ul>
 *   <li>Thuật toán HMAC-SHA1, 6 chữ số, chu kỳ 30 giây (mặc định của Google Authenticator).
 *   <li>Secret mã hoá Base32 (RFC 4648) để nhập vào app.
 *   <li>Xác minh chấp nhận cửa sổ ±1 bước để bù lệch đồng hồ.
 * </ul>
 */
@Service
public class TotpService {

  private static final int DIGITS = 6;
  private static final int PERIOD_SECONDS = 30;
  private static final int WINDOW = 1; // chấp nhận bước trước/sau để bù lệch giờ
  private static final String BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  private static final SecureRandom RANDOM = new SecureRandom();

  /** Sinh secret ngẫu nhiên (20 bytes) → chuỗi Base32 để nhập vào authenticator. */
  public String generateSecret() {
    byte[] bytes = new byte[20];
    RANDOM.nextBytes(bytes);
    return base32Encode(bytes);
  }

  /** otpauth:// URI để tạo QR / nhập vào app (issuer + tên tài khoản). */
  public String buildOtpAuthUrl(String issuer, String accountName, String secret) {
    String label = enc(issuer + ":" + accountName);
    String iss = enc(issuer);
    return "otpauth://totp/"
        + label
        + "?secret="
        + secret
        + "&issuer="
        + iss
        + "&algorithm=SHA1&digits="
        + DIGITS
        + "&period="
        + PERIOD_SECONDS;
  }

  /** Kiểm tra mã 6 số người dùng nhập có khớp secret không (cửa sổ ±1 bước). */
  public boolean verifyCode(String secret, String code) {
    if (secret == null || code == null) return false;
    String normalized = code.trim().replaceAll("\\s", "");
    if (!normalized.matches("\\d{" + DIGITS + "}")) return false;

    byte[] key;
    try {
      key = base32Decode(secret);
    } catch (Exception e) {
      return false;
    }
    long currentStep = System.currentTimeMillis() / 1000L / PERIOD_SECONDS;
    for (int offset = -WINDOW; offset <= WINDOW; offset++) {
      if (normalized.equals(generateCode(key, currentStep + offset))) {
        return true;
      }
    }
    return false;
  }

  // ─── Internal ─────────────────────────────────────────────────────

  private String generateCode(byte[] key, long step) {
    byte[] data = new byte[8];
    long value = step;
    for (int i = 7; i >= 0; i--) {
      data[i] = (byte) (value & 0xFF);
      value >>>= 8;
    }
    try {
      Mac mac = Mac.getInstance("HmacSHA1");
      mac.init(new SecretKeySpec(key, "HmacSHA1"));
      byte[] hash = mac.doFinal(data);
      int offset = hash[hash.length - 1] & 0x0F;
      int binary =
          ((hash[offset] & 0x7F) << 24)
              | ((hash[offset + 1] & 0xFF) << 16)
              | ((hash[offset + 2] & 0xFF) << 8)
              | (hash[offset + 3] & 0xFF);
      int otp = binary % (int) Math.pow(10, DIGITS);
      return String.format("%0" + DIGITS + "d", otp);
    } catch (Exception e) {
      throw new IllegalStateException("Không tạo được mã TOTP", e);
    }
  }

  private String enc(String s) {
    return URLEncoder.encode(s, StandardCharsets.UTF_8).replace("+", "%20");
  }

  private String base32Encode(byte[] data) {
    StringBuilder sb = new StringBuilder();
    int buffer = 0;
    int bitsLeft = 0;
    for (byte b : data) {
      buffer = (buffer << 8) | (b & 0xFF);
      bitsLeft += 8;
      while (bitsLeft >= 5) {
        int index = (buffer >> (bitsLeft - 5)) & 0x1F;
        bitsLeft -= 5;
        sb.append(BASE32_ALPHABET.charAt(index));
      }
    }
    if (bitsLeft > 0) {
      int index = (buffer << (5 - bitsLeft)) & 0x1F;
      sb.append(BASE32_ALPHABET.charAt(index));
    }
    return sb.toString();
  }

  private byte[] base32Decode(String s) {
    String clean = s.trim().replaceAll("[=\\s]", "").toUpperCase();
    int outLen = clean.length() * 5 / 8;
    byte[] result = new byte[outLen];
    int buffer = 0;
    int bitsLeft = 0;
    int index = 0;
    for (int i = 0; i < clean.length(); i++) {
      int val = BASE32_ALPHABET.indexOf(clean.charAt(i));
      if (val < 0) throw new IllegalArgumentException("Ký tự Base32 không hợp lệ");
      buffer = (buffer << 5) | val;
      bitsLeft += 5;
      if (bitsLeft >= 8) {
        result[index++] = (byte) ((buffer >> (bitsLeft - 8)) & 0xFF);
        bitsLeft -= 8;
      }
    }
    return result;
  }
}
