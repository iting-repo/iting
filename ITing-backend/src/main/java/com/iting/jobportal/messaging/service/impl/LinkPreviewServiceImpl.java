package com.iting.jobportal.messaging.service.impl;

import com.iting.jobportal.messaging.dto.LinkPreviewDto;
import com.iting.jobportal.messaging.service.LinkPreviewService;
import java.net.InetAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Lấy Open Graph metadata bằng cách tải HTML của trang và bóc tách thẻ meta. Best-effort: lỗi gì
 * cũng trả về null để frontend bỏ qua preview. Có guard SSRF cơ bản: chỉ http/https và chặn host
 * nội bộ.
 */
@Service
@Slf4j
public class LinkPreviewServiceImpl implements LinkPreviewService {

  private static final int MAX_BODY_BYTES = 512 * 1024; // chỉ đọc 512KB đầu (đủ cho <head>)
  private static final String UA =
      "Mozilla/5.0 (compatible; ITingBot/1.0; +https://iting.vn)";

  private final HttpClient httpClient =
      HttpClient.newBuilder()
          .connectTimeout(Duration.ofSeconds(5))
          .followRedirects(HttpClient.Redirect.NORMAL)
          .build();

  @Override
  public LinkPreviewDto fetch(String rawUrl) {
    if (rawUrl == null || rawUrl.isBlank()) return null;
    final URI uri;
    try {
      uri = URI.create(rawUrl.trim());
    } catch (Exception e) {
      return null;
    }
    String scheme = uri.getScheme();
    if (scheme == null || !(scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https"))) {
      return null;
    }
    if (isBlockedHost(uri.getHost())) {
      log.warn("[LinkPreview] Blocked host: {}", uri.getHost());
      return null;
    }

    try {
      HttpRequest req =
          HttpRequest.newBuilder(uri)
              .timeout(Duration.ofSeconds(6))
              .header("User-Agent", UA)
              .header("Accept", "text/html,application/xhtml+xml")
              .GET()
              .build();
      HttpResponse<String> resp =
          httpClient.send(req, HttpResponse.BodyHandlers.ofString());
      if (resp.statusCode() / 100 != 2) return null;

      String contentType = resp.headers().firstValue("content-type").orElse("");
      if (!contentType.isBlank() && !contentType.toLowerCase().contains("html")) return null;

      String html = resp.body();
      if (html == null || html.isBlank()) return null;
      if (html.length() > MAX_BODY_BYTES) html = html.substring(0, MAX_BODY_BYTES);

      String title = firstNonBlank(meta(html, "og:title"), titleTag(html));
      String image = meta(html, "og:image");
      String description = firstNonBlank(meta(html, "og:description"), meta(html, "description"));
      String siteName = meta(html, "og:site_name");

      if (title == null && image == null && description == null) return null;

      return LinkPreviewDto.builder()
          .url(rawUrl.trim())
          .title(clean(title))
          .description(clean(description))
          .image(absolutize(uri, image))
          .siteName(clean(siteName))
          .build();
    } catch (Exception e) {
      log.warn("[LinkPreview] fetch failed for {}: {}", rawUrl, e.getMessage());
      return null;
    }
  }

  /** Bóc giá trị của <meta property="og:x" content="..."> hoặc name="x" (cả 2 thứ tự attribute). */
  private String meta(String html, String key) {
    // property/name="key" ... content="value"
    String[] patterns = {
      "<meta[^>]+(?:property|name)\\s*=\\s*[\"']"
          + Pattern.quote(key)
          + "[\"'][^>]*?content\\s*=\\s*[\"']([^\"']*)[\"']",
      "<meta[^>]+content\\s*=\\s*[\"']([^\"']*)[\"'][^>]*?(?:property|name)\\s*=\\s*[\"']"
          + Pattern.quote(key)
          + "[\"']"
    };
    for (String p : patterns) {
      Matcher m = Pattern.compile(p, Pattern.CASE_INSENSITIVE | Pattern.DOTALL).matcher(html);
      if (m.find()) {
        String v = m.group(1);
        if (v != null && !v.isBlank()) return v.trim();
      }
    }
    return null;
  }

  private String titleTag(String html) {
    Matcher m =
        Pattern.compile("<title[^>]*>(.*?)</title>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL)
            .matcher(html);
    return m.find() ? m.group(1).trim() : null;
  }

  private String clean(String s) {
    if (s == null) return null;
    String v = unescapeHtml(s).trim();
    if (v.length() > 500) v = v.substring(0, 500);
    return v.isBlank() ? null : v;
  }

  /** Giải mã các HTML entity phổ biến (đủ cho title/description Open Graph). */
  private String unescapeHtml(String s) {
    String v =
        s.replace("&amp;", "&")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&quot;", "\"")
            .replace("&#39;", "'")
            .replace("&apos;", "'")
            .replace("&nbsp;", " ");
    // Numeric entities: &#1234; và &#x1F600;
    Matcher m = Pattern.compile("&#(x?)([0-9a-fA-F]+);").matcher(v);
    StringBuilder sb = new StringBuilder();
    while (m.find()) {
      try {
        int cp = Integer.parseInt(m.group(2), m.group(1).isEmpty() ? 10 : 16);
        m.appendReplacement(sb, Matcher.quoteReplacement(new String(Character.toChars(cp))));
      } catch (Exception e) {
        m.appendReplacement(sb, Matcher.quoteReplacement(m.group(0)));
      }
    }
    m.appendTail(sb);
    return sb.toString();
  }

  /** Chuyển image URL tương đối thành tuyệt đối theo trang gốc. */
  private String absolutize(URI base, String image) {
    if (image == null || image.isBlank()) return null;
    try {
      return base.resolve(image.trim()).toString();
    } catch (Exception e) {
      return image.trim();
    }
  }

  private String firstNonBlank(String a, String b) {
    if (a != null && !a.isBlank()) return a;
    return (b != null && !b.isBlank()) ? b : null;
  }

  /** Chặn localhost / dải IP nội bộ để giảm rủi ro SSRF. */
  private boolean isBlockedHost(String host) {
    if (host == null || host.isBlank()) return true;
    String h = host.toLowerCase();
    if (h.equals("localhost") || h.endsWith(".local") || h.endsWith(".internal")) return true;
    try {
      for (InetAddress addr : InetAddress.getAllByName(host)) {
        if (addr.isLoopbackAddress()
            || addr.isAnyLocalAddress()
            || addr.isLinkLocalAddress()
            || addr.isSiteLocalAddress()) {
          return true;
        }
      }
    } catch (Exception e) {
      return true; // không resolve được → chặn cho an toàn
    }
    return false;
  }
}
