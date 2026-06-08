package com.iting.jobportal.userprofile.service.embedding;

import java.util.Locale;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * Embedding cục bộ, offline, deterministic — KHÔNG gọi dịch vụ AI ngoài.
 *
 * <p>Dùng "feature hashing" (hashing trick): băm mỗi token (và bigram) vào một chiều cố định rồi
 * cộng dồn tần suất, cuối cùng chuẩn hóa L2. Cosine giữa hai vector phản ánh độ trùng từ khóa (kỹ
 * năng, vị trí, công nghệ...) giữa CV và mô tả công việc — đủ để demo AI matching khi HuggingFace/
 * OpenAI không kết nối được.
 *
 * <p>Kích hoạt bằng {@code ai.provider=local}. Vì cùng một client nhúng cả job lẫn ứng viên nên hai
 * vector luôn cùng không gian & cùng số chiều ⇒ cosine có ý nghĩa.
 */
@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "local")
@Slf4j
public class LocalEmbeddingClient implements EmbeddingClient {

  /** Số chiều vector (giữ 768 cho đồng nhất với cấu hình gemma trước đây). */
  private static final int DIM = 768;

  @Override
  public Optional<double[]> embed(String input) {
    if (input == null || input.isBlank()) return Optional.empty();

    double[] vec = new double[DIM];
    String[] tokens = tokenize(input);
    String prev = null;
    for (String t : tokens) {
      if (t.isEmpty()) continue;
      add(vec, t, 1.0);
      if (prev != null) add(vec, prev + "_" + t, 0.5); // bigram giữ ngữ cảnh cụm từ
      prev = t;
    }

    double norm = 0.0;
    for (double v : vec) norm += v * v;
    norm = Math.sqrt(norm);
    if (norm == 0.0) return Optional.empty();
    for (int i = 0; i < DIM; i++) vec[i] /= norm;
    return Optional.of(vec);
  }

  private static void add(double[] vec, String feature, double weight) {
    int idx = Math.floorMod(feature.hashCode(), DIM);
    vec[idx] += weight;
  }

  /** Tách token: hạ chữ thường, giữ chữ-số (kể cả tiếng Việt), còn lại coi như dấu cách. */
  private static String[] tokenize(String input) {
    String lower = input.toLowerCase(Locale.ROOT);
    StringBuilder sb = new StringBuilder(lower.length());
    for (int i = 0; i < lower.length(); i++) {
      char c = lower.charAt(i);
      sb.append(Character.isLetterOrDigit(c) ? c : ' ');
    }
    return sb.toString().trim().split("\\s+");
  }
}
