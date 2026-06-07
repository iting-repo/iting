package com.iting.jobportal.common.audit;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Kênh phụ (ThreadLocal) để service "đóng góp" chi tiết changeset cho audit log mà KHÔNG cần tự ghi
 * row (tránh trùng với {@link AdminAuditAspect}). Service gọi {@link #change(String, Object, Object)}
 * trong lúc xử lý; aspect đọc lại khi build row rồi clear.
 *
 * <p>Aspect luôn clear ở advice {@code @After} nên thread pool không bị rò rỉ giữa các request.
 */
public final class AuditContext {

  private static final ThreadLocal<List<Map<String, Object>>> CHANGES = new ThreadLocal<>();

  private AuditContext() {}

  /** Ghi một trường thay đổi. Bỏ qua nếu giá trị không đổi. */
  public static void change(String field, Object from, Object to) {
    if (Objects.equals(from, to)) return;
    List<Map<String, Object>> list = CHANGES.get();
    if (list == null) {
      list = new ArrayList<>();
      CHANGES.set(list);
    }
    Map<String, Object> entry = new LinkedHashMap<>();
    entry.put("field", field);
    entry.put("from", from);
    entry.put("to", to);
    list.add(entry);
  }

  public static List<Map<String, Object>> getChanges() {
    return CHANGES.get();
  }

  public static void clear() {
    CHANGES.remove();
  }
}
