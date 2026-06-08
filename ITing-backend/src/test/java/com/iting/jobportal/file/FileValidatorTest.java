package com.iting.jobportal.file;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.iting.jobportal.file.FileValidator.Category;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/**
 * Test FileValidator: rỗng / dung lượng / đuôi (extension) / magic-byte (chữ ký thật) + chống giả
 * đuôi/MIME (spoofing). Validate ném {@link ResponseStatusException} 400 khi không hợp lệ.
 */
class FileValidatorTest {

  private final FileValidator validator = new FileValidator();

  // ── Magic-byte fixtures (16 byte, đủ cho detect đọc) ─────────────────
  private static final byte[] JPEG = sig(0xFF, 0xD8, 0xFF, 0xE0);
  private static final byte[] PNG = sig(0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A);
  private static final byte[] GIF = sig('G', 'I', 'F', '8', '9', 'a');
  private static final byte[] PDF = sig('%', 'P', 'D', 'F', '-', '1', '.', '4');
  private static final byte[] ZIP = sig('P', 'K', 0x03, 0x04); // docx/xlsx (OOXML)
  private static final byte[] OLE2 = sig(0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1); // doc/xls
  private static final byte[] WEBP =
      sig('R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P'); // cần >= 12 byte
  private static final byte[] GARBAGE = sig(0x00, 0x01, 0x02, 0x03, 0x04, 0x05);

  /** Tạo header 16 byte từ chữ ký (phần còn lại = 0). */
  private static byte[] sig(int... bytes) {
    byte[] b = new byte[16];
    for (int i = 0; i < bytes.length && i < 16; i++) b[i] = (byte) bytes[i];
    return b;
  }

  private static MultipartFile file(String name, byte[] content) {
    return new MockMultipartFile("file", name, null, content);
  }

  private static int status(Executable run) {
    ResponseStatusException ex = assertThrows(ResponseStatusException.class, run::run);
    return ex.getStatusCode().value();
  }

  @FunctionalInterface
  private interface Executable {
    void run();
  }

  // ── 1) File rỗng / null ──────────────────────────────────────────────

  @Test
  void nullFile_throws400() {
    assertEquals(400, status(() -> validator.validate(null, Category.BLOG_IMAGE)));
  }

  @Test
  void emptyFile_throws400() {
    MultipartFile empty = new MockMultipartFile("file", "a.jpg", null, new byte[0]);
    assertEquals(400, status(() -> validator.validate(empty, Category.BLOG_IMAGE)));
  }

  // ── 2) Dung lượng ────────────────────────────────────────────────────

  @Test
  void oversizeFile_throws400() {
    // BLOG_IMAGE giới hạn 5MB → tạo 5MB + 1 byte (size check chạy trước magic-byte)
    byte[] big = new byte[(int) (5 * FileValidator.MB + 1)];
    big[0] = (byte) 0xFF; // dù có magic JPEG, vẫn bị chặn vì quá size
    assertEquals(400, status(() -> validator.validate(file("big.jpg", big), Category.BLOG_IMAGE)));
  }

  @Test
  void atSizeLimit_ok() {
    byte[] exactly = new byte[(int) (5 * FileValidator.MB)];
    System.arraycopy(JPEG, 0, exactly, 0, JPEG.length); // magic JPEG hợp lệ
    assertDoesNotThrow(() -> validator.validate(file("a.jpg", exactly), Category.BLOG_IMAGE));
  }

  // ── 3) Đuôi file (extension whitelist) ───────────────────────────────

  @Test
  void disallowedExtension_throws400() {
    // .exe không nằm trong whitelist của BLOG_IMAGE
    assertEquals(400, status(() -> validator.validate(file("evil.exe", JPEG), Category.BLOG_IMAGE)));
  }

  @Test
  void noExtension_throws400() {
    assertEquals(400, status(() -> validator.validate(file("noext", JPEG), Category.BLOG_IMAGE)));
  }

  @Test
  void pdfExtension_notAllowedForImageCategory_throws400() {
    assertEquals(400, status(() -> validator.validate(file("a.pdf", PDF), Category.AVATAR)));
  }

  // ── 4) Magic byte mismatch / không nhận diện ─────────────────────────

  @Test
  void unknownMagicBytes_throws400() {
    // đuôi hợp lệ (.png) nhưng nội dung rác → không nhận diện được → 400
    assertEquals(
        400, status(() -> validator.validate(file("a.png", GARBAGE), Category.BLOG_IMAGE)));
  }

  @Test
  void spoofedExtension_pdfContentAsJpg_throws400() {
    // đổi đuôi: nội dung là PDF nhưng đặt tên .jpg → magic = PDF, Kind PDF không thuộc IMAGE → 400
    assertEquals(400, status(() -> validator.validate(file("fake.jpg", PDF), Category.BLOG_IMAGE)));
  }

  @Test
  void spoofedExtension_jpegContentAsPdf_throws400() {
    // nội dung JPEG nhưng đặt .pdf cho category CV → magic IMAGE không thuộc {PDF,OFFICE_DOC} → 400
    assertEquals(400, status(() -> validator.validate(file("fake.pdf", JPEG), Category.CV)));
  }

  // ── 5) File hợp lệ (đuôi + magic byte khớp) ──────────────────────────

  @Test
  void validJpeg_blogImage_ok() {
    assertDoesNotThrow(() -> validator.validate(file("a.jpg", JPEG), Category.BLOG_IMAGE));
  }

  @Test
  void validPng_avatar_ok() {
    assertDoesNotThrow(() -> validator.validate(file("a.png", PNG), Category.AVATAR));
  }

  @Test
  void validGif_blogImageOnly_ok() {
    assertDoesNotThrow(() -> validator.validate(file("a.gif", GIF), Category.BLOG_IMAGE));
  }

  @Test
  void validWebp_avatar_ok() {
    assertDoesNotThrow(() -> validator.validate(file("a.webp", WEBP), Category.AVATAR));
  }

  @Test
  void validPdf_cv_ok() {
    assertDoesNotThrow(() -> validator.validate(file("cv.pdf", PDF), Category.CV));
  }

  @Test
  void validDocx_cv_ok() {
    // OOXML (ZIP) + đuôi .docx → OFFICE_DOC thuộc CV.kinds
    assertDoesNotThrow(() -> validator.validate(file("cv.docx", ZIP), Category.CV));
  }

  @Test
  void validDoc_ole2_cv_ok() {
    assertDoesNotThrow(() -> validator.validate(file("cv.doc", OLE2), Category.CV));
  }

  // ── 6) Phân biệt ZIP: xlsx (SPREADSHEET) vs docx (OFFICE_DOC) ─────────

  @Test
  void validXlsx_excelImport_ok() {
    // cùng magic ZIP nhưng đuôi .xlsx → SPREADSHEET thuộc EXCEL_IMPORT.kinds
    assertDoesNotThrow(() -> validator.validate(file("data.xlsx", ZIP), Category.EXCEL_IMPORT));
  }

  @Test
  void zipWithDocxExt_notAllowedForExcelImport_throws400() {
    // .docx → OFFICE_DOC, không thuộc EXCEL_IMPORT (chỉ SPREADSHEET) → 400
    assertEquals(
        400, status(() -> validator.validate(file("x.docx", ZIP), Category.EXCEL_IMPORT)));
  }

  // ── 7) Trạng thái lỗi đúng là 400 ────────────────────────────────────

  @Test
  void errorStatusIsBadRequest() {
    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> validator.validate(file("a.png", GARBAGE), Category.BLOG_IMAGE));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
  }
}
