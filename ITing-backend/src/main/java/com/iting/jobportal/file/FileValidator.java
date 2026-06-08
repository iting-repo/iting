package com.iting.jobportal.file;

import java.io.IOException;
import java.io.InputStream;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/**
 * Validate file upload TẬP TRUNG: non-empty + size + extension whitelist + MIME (loose) + MAGIC
 * BYTES (chữ ký thật của file). Magic bytes là nguồn tin cậy chính — chống đổi đuôi/giả MIME.
 *
 * <p>Không phụ thuộc Apache Tika: tự đọc 16 byte đầu để nhận diện JPEG/PNG/WEBP/GIF/BMP/PDF/ZIP
 * (docx,xlsx)/OLE2 (doc,xls). Ném {@link ResponseStatusException} 400 khi không hợp lệ.
 */
@Slf4j
@Component
public class FileValidator {

  public static final long MB = 1024L * 1024L;

  /** Loại file theo nghiệp vụ — mỗi loại có whitelist riêng + giới hạn dung lượng. */
  public enum Category {
    AVATAR(5 * MB, Set.of("jpg", "jpeg", "png", "webp"), Kind.IMAGE),
    LOGO(5 * MB, Set.of("jpg", "jpeg", "png", "webp"), Kind.IMAGE),
    BLOG_IMAGE(5 * MB, Set.of("jpg", "jpeg", "png", "webp", "gif"), Kind.IMAGE),
    CV(10 * MB, Set.of("pdf", "doc", "docx"), Kind.PDF, Kind.OFFICE_DOC),
    LICENSE(10 * MB, Set.of("pdf", "jpg", "jpeg", "png", "webp"), Kind.PDF, Kind.IMAGE),
    CONSENT(10 * MB, Set.of("pdf", "doc", "docx"), Kind.PDF, Kind.OFFICE_DOC),
    OFFER_LETTER(10 * MB, Set.of("pdf"), Kind.PDF),
    EXCEL_IMPORT(10 * MB, Set.of("xlsx"), Kind.SPREADSHEET);

    final long maxBytes;
    final Set<String> exts;
    final Set<Kind> kinds;

    Category(long maxBytes, Set<String> exts, Kind... kinds) {
      this.maxBytes = maxBytes;
      this.exts = exts;
      this.kinds = Set.of(kinds);
    }
  }

  /** Nhóm magic-byte sau khi nhận diện. */
  private enum Kind {
    IMAGE,
    PDF,
    OFFICE_DOC, // doc (OLE2) / docx (ZIP)
    SPREADSHEET // xlsx (ZIP)
  }

  /**
   * Validate file theo category. Ném 400 nếu: rỗng / quá dung lượng / sai đuôi / magic bytes không
   * khớp loại cho phép.
   */
  public void validate(MultipartFile file, Category category) {
    if (file == null || file.isEmpty() || file.getSize() <= 0) {
      throw bad("File không được để trống");
    }
    if (file.getSize() > category.maxBytes) {
      throw bad("File vượt quá dung lượng tối đa " + (category.maxBytes / MB) + "MB");
    }

    String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
    String ext = extensionOf(name);
    if (!category.exts.contains(ext)) {
      throw bad("Định dạng không hợp lệ. Chỉ chấp nhận: " + String.join(", ", category.exts));
    }

    // Magic bytes — nguồn tin cậy chính (chống đổi đuôi/giả MIME)
    Detected detected = detect(file);
    if (detected == Detected.UNKNOWN) {
      throw bad("Không nhận diện được định dạng thật của file (chữ ký file không hợp lệ)");
    }

    // File ZIP (OOXML) có thể là docx HOẶC xlsx — phân biệt bằng đuôi đã whitelist ở trên.
    Kind kind = detected.kind;
    if (detected == Detected.ZIP) {
      kind = "xlsx".equals(ext) ? Kind.SPREADSHEET : Kind.OFFICE_DOC;
    }

    if (!category.kinds.contains(kind)) {
      throw bad("Nội dung file không khớp định dạng cho phép (phát hiện: " + detected.label + ")");
    }
  }

  /** Đuôi file (lowercase, không dấu chấm). */
  private static String extensionOf(String filename) {
    int i = filename.lastIndexOf('.');
    return i >= 0 ? filename.substring(i + 1).toLowerCase() : "";
  }

  private enum Detected {
    JPEG(Kind.IMAGE, "JPEG"),
    PNG(Kind.IMAGE, "PNG"),
    GIF(Kind.IMAGE, "GIF"),
    WEBP(Kind.IMAGE, "WEBP"),
    BMP(Kind.IMAGE, "BMP"),
    PDF(Kind.PDF, "PDF"),
    ZIP(Kind.OFFICE_DOC, "ZIP/OOXML"), // docx hoặc xlsx — phân biệt bằng đuôi
    OLE2(Kind.OFFICE_DOC, "DOC/XLS (OLE2)"),
    UNKNOWN(null, "unknown");

    final Kind kind;
    final String label;

    Detected(Kind kind, String label) {
      this.kind = kind;
      this.label = label;
    }
  }

  /** Đọc 16 byte đầu, nhận diện theo magic bytes. ZIP được map sang SPREADSHEET ở tầng category. */
  private Detected detect(MultipartFile file) {
    byte[] h = new byte[16];
    int n;
    try (InputStream is = file.getInputStream()) {
      n = is.readNBytes(h, 0, 16);
    } catch (IOException e) {
      log.warn("Không đọc được header file để validate", e);
      throw bad("Không đọc được file");
    }
    if (n < 4) return Detected.UNKNOWN;

    if (u(h[0]) == 0xFF && u(h[1]) == 0xD8 && u(h[2]) == 0xFF) return Detected.JPEG;
    if (u(h[0]) == 0x89 && h[1] == 'P' && h[2] == 'N' && h[3] == 'G') return Detected.PNG;
    if (h[0] == 'G' && h[1] == 'I' && h[2] == 'F' && h[3] == '8') return Detected.GIF;
    if (h[0] == 'B' && h[1] == 'M') return Detected.BMP;
    if (h[0] == '%' && h[1] == 'P' && h[2] == 'D' && h[3] == 'F') return Detected.PDF;
    if (n >= 12 && h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F'
        && h[8] == 'W' && h[9] == 'E' && h[10] == 'B' && h[11] == 'P') return Detected.WEBP;
    if (h[0] == 'P' && h[1] == 'K' && (h[2] == 0x03 || h[2] == 0x05 || h[2] == 0x07)) {
      return Detected.ZIP;
    }
    if (n >= 8 && u(h[0]) == 0xD0 && u(h[1]) == 0xCF && u(h[2]) == 0x11 && u(h[3]) == 0xE0) {
      return Detected.OLE2;
    }
    return Detected.UNKNOWN;
  }

  /** Unsigned byte (0-255). */
  private static int u(byte b) {
    return b & 0xFF;
  }

  private static ResponseStatusException bad(String msg) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
  }
}
