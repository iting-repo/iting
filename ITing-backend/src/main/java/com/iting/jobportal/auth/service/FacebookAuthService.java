package com.iting.jobportal.auth.service;

import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonObjectParser;
import com.google.api.client.json.gson.GsonFactory;
import java.io.IOException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Verify Facebook access token + lấy thông tin user qua Graph API.
 *
 * <p>Flow: 1. Frontend lấy short-lived access token từ FB SDK 2. Gọi /api/auth/facebook với access
 * token 3. Backend verify token qua /debug_token (cần app_access_token) → đảm bảo token được issue
 * cho app của ta, không bị forge 4. Lấy email + name + picture qua /me?fields=...
 */
@Service
@RequiredArgsConstructor
public class FacebookAuthService {

  @Value("${facebook.app.id:}")
  private String appId;

  @Value("${facebook.app.secret:}")
  private String appSecret;

  /**
   * Verify token đúng app + lấy user info.
   *
   * @return map có "id", "email", "name", "picture"
   */
  public Map<String, Object> getUserInfo(String accessToken) throws IOException {
    if (appId == null || appId.isBlank() || appSecret == null || appSecret.isBlank()) {
      throw new IllegalStateException(
          "Facebook OAuth chưa được cấu hình (FACEBOOK_APP_ID + FACEBOOK_APP_SECRET)");
    }

    NetHttpTransport transport = new NetHttpTransport();
    GsonFactory jsonFactory = new GsonFactory();
    var requestFactory =
        transport.createRequestFactory(
            request -> request.setParser(new JsonObjectParser(jsonFactory)));

    // Step 1: verify token thuộc về app của ta — chống forged token từ app khác.
    String appAccessToken = appId + "|" + appSecret;
    HttpRequest debugRequest =
        requestFactory.buildGetRequest(
            new GenericUrl(
                "https://graph.facebook.com/debug_token?input_token="
                    + accessToken
                    + "&access_token="
                    + appAccessToken));
    Map<String, Object> debugResponse = debugRequest.execute().parseAs(Map.class);
    Object dataObj = debugResponse.get("data");
    if (!(dataObj instanceof Map)) {
      throw new RuntimeException("Facebook debug_token response không hợp lệ");
    }
    @SuppressWarnings("unchecked")
    Map<String, Object> data = (Map<String, Object>) dataObj;
    Boolean isValid = (Boolean) data.get("is_valid");
    String tokenAppId = String.valueOf(data.get("app_id"));
    if (!Boolean.TRUE.equals(isValid)) {
      throw new RuntimeException("Facebook token không hợp lệ hoặc đã hết hạn");
    }
    if (!appId.equals(tokenAppId)) {
      throw new RuntimeException("Facebook token không thuộc về ứng dụng này");
    }

    // Step 2: lấy user info. picture trả về dạng nested → flatten ở consumer.
    HttpRequest userRequest =
        requestFactory.buildGetRequest(
            new GenericUrl(
                "https://graph.facebook.com/me?fields=id,name,email,picture.type(large)"
                    + "&access_token="
                    + accessToken));
    Map<String, Object> user = userRequest.execute().parseAs(Map.class);

    // Flatten picture.data.url → "picture" key, để consumer xử lý đồng nhất với GoogleAuthService.
    Object picture = user.get("picture");
    if (picture instanceof Map) {
      Object pictureData = ((Map<?, ?>) picture).get("data");
      if (pictureData instanceof Map) {
        Object url = ((Map<?, ?>) pictureData).get("url");
        if (url != null) user.put("picture", url);
      }
    }

    return user;
  }
}
