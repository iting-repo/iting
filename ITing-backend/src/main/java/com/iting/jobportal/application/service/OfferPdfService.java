package com.iting.jobportal.application.service;

import com.iting.jobportal.application.entity.OfferLetter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.Normalizer;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

/**
 * Sinh PDF offer letter A4 1 trang đơn giản bằng Apache PDFBox.
 *
 * <p>PDFBox built-in font Helvetica chỉ hỗ trợ Latin-1. Để render tiếng Việt có dấu cần embed font
 * Unicode (Noto Sans / DejaVu) — chưa có trong project, nên tạm strip diacritics khi render. Caller
 * có thể swap sang Unicode font sau bằng cách load từ classpath: {@code PDType0Font.load(doc,
 * stream)}.
 */
@Service
@Slf4j
public class OfferPdfService {

  private static final DateTimeFormatter D_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

  public byte[] generate(
      OfferLetter offer,
      String candidateName,
      String companyName,
      String companyAddress,
      String jobTitle) {
    try (PDDocument doc = new PDDocument();
        ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
      PDPage page = new PDPage(PDRectangle.A4);
      doc.addPage(page);

      try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
        final float margin = 60f;
        final float pageWidth = PDRectangle.A4.getWidth();
        final float pageHeight = PDRectangle.A4.getHeight();
        float y = pageHeight - margin;

        // Header — company name
        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA_BOLD, 16);
        cs.newLineAtOffset(margin, y);
        cs.showText(strip(companyName != null ? companyName.toUpperCase() : "COMPANY"));
        cs.endText();
        y -= 18;

        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA, 10);
        cs.newLineAtOffset(margin, y);
        cs.showText(strip(companyAddress != null ? companyAddress : ""));
        cs.endText();
        y -= 30;

        // Title
        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA_BOLD, 20);
        String title = strip("THU MOI NHAN VIEC (OFFER LETTER)");
        float titleWidth = PDType1Font.HELVETICA_BOLD.getStringWidth(title) / 1000 * 20;
        cs.newLineAtOffset((pageWidth - titleWidth) / 2, y);
        cs.showText(title);
        cs.endText();
        y -= 30;

        // Date + Reference
        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA, 10);
        cs.newLineAtOffset(margin, y);
        cs.showText(
            strip(
                "Ngay: "
                    + offer.getSentAt().toLocalDate().format(D_FMT)
                    + "   |   Ma offer: #"
                    + offer.getId()));
        cs.endText();
        y -= 25;

        // Salutation
        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA, 12);
        cs.newLineAtOffset(margin, y);
        cs.showText(
            strip("Kinh gui Ong/Ba: " + (candidateName != null ? candidateName : "Ung vien")));
        cs.endText();
        y -= 22;

        // Body intro
        y =
            writeWrapped(
                cs,
                PDType1Font.HELVETICA,
                11,
                margin,
                y,
                pageWidth - 2 * margin,
                strip(
                    "Cong ty "
                        + companyName
                        + " tran trong gui den Ong/Ba thu moi nhan viec "
                        + "voi cac dieu khoan duoc trinh bay sau day. Kinh mong Ong/Ba xem xet "
                        + "va phan hoi trong thoi gian hieu luc."));
        y -= 14;

        // Terms list
        y = writeKV(cs, "Vi tri:", offer.getPosition(), margin, y);
        if (jobTitle != null) y = writeKV(cs, "Cong viec ung tuyen:", jobTitle, margin, y);
        if (offer.getSalaryAmount() != null) {
          String salary =
              String.format(
                  "%,.0f %s / %s",
                  offer.getSalaryAmount(),
                  offer.getSalaryCurrency(),
                  "MONTH".equals(offer.getSalaryType()) ? "thang" : "nam");
          y = writeKV(cs, "Muc luong:", salary, margin, y);
        }
        if (offer.getStartDate() != null) {
          y = writeKV(cs, "Ngay bat dau:", offer.getStartDate().format(D_FMT), margin, y);
        }
        y =
            writeKV(
                cs, "Han phan hoi:", offer.getExpiresAt().toLocalDate().format(D_FMT), margin, y);
        y -= 6;

        // Notes (optional)
        if (offer.getNotes() != null && !offer.getNotes().isBlank()) {
          cs.beginText();
          cs.setFont(PDType1Font.HELVETICA_BOLD, 11);
          cs.newLineAtOffset(margin, y);
          cs.showText(strip("Ghi chu:"));
          cs.endText();
          y -= 14;
          y =
              writeWrapped(
                  cs,
                  PDType1Font.HELVETICA,
                  11,
                  margin,
                  y,
                  pageWidth - 2 * margin,
                  strip(offer.getNotes()));
          y -= 10;
        }

        // Closing
        y -= 8;
        y =
            writeWrapped(
                cs,
                PDType1Font.HELVETICA,
                11,
                margin,
                y,
                pageWidth - 2 * margin,
                strip(
                    "Vui long phan hoi (Chap nhan / Tu choi) bang nut thao tac trong he thong ITing"
                        + " truoc "
                        + offer.getExpiresAt().toLocalDate().format(D_FMT)
                        + ". Sau thoi diem nay offer se tu dong het han."));
        y -= 30;

        // Signature placeholder
        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA_BOLD, 11);
        cs.newLineAtOffset(pageWidth - margin - 200, y);
        cs.showText(strip("Dai dien " + companyName));
        cs.endText();
        y -= 14;
        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA_OBLIQUE, 9);
        cs.newLineAtOffset(pageWidth - margin - 200, y);
        cs.showText(strip("(Ky ten - Dong dau)"));
        cs.endText();

        // Footer
        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA, 8);
        cs.newLineAtOffset(margin, margin / 2);
        cs.showText(strip("Tao tu dong boi he thong ITing | offer.id=" + offer.getId()));
        cs.endText();
      }

      doc.save(baos);
      return baos.toByteArray();
    } catch (IOException e) {
      log.error("Failed to generate offer PDF for offer #{}", offer.getId(), e);
      throw new RuntimeException("Không tạo được file PDF offer", e);
    }
  }

  private float writeKV(PDPageContentStream cs, String key, String value, float x, float y)
      throws IOException {
    cs.beginText();
    cs.setFont(PDType1Font.HELVETICA_BOLD, 11);
    cs.newLineAtOffset(x, y);
    cs.showText(strip(key));
    cs.endText();

    cs.beginText();
    cs.setFont(PDType1Font.HELVETICA, 11);
    cs.newLineAtOffset(x + 140, y);
    cs.showText(strip(value != null ? value : "-"));
    cs.endText();
    return y - 16;
  }

  private float writeWrapped(
      PDPageContentStream cs,
      PDType1Font font,
      float fontSize,
      float x,
      float y,
      float maxWidth,
      String text)
      throws IOException {
    if (text == null) return y;
    List<String> lines = wrap(font, fontSize, text, maxWidth);
    for (String line : lines) {
      cs.beginText();
      cs.setFont(font, fontSize);
      cs.newLineAtOffset(x, y);
      cs.showText(line);
      cs.endText();
      y -= fontSize + 4;
    }
    return y;
  }

  private List<String> wrap(PDType1Font font, float fontSize, String text, float maxWidth)
      throws IOException {
    java.util.List<String> out = new java.util.ArrayList<>();
    StringBuilder cur = new StringBuilder();
    for (String word : text.split(" ")) {
      String candidate = cur.length() == 0 ? word : cur + " " + word;
      float w = font.getStringWidth(candidate) / 1000 * fontSize;
      if (w > maxWidth && cur.length() > 0) {
        out.add(cur.toString());
        cur.setLength(0);
        cur.append(word);
      } else {
        if (cur.length() > 0) cur.append(' ');
        cur.append(word);
      }
    }
    if (cur.length() > 0) out.add(cur.toString());
    return out;
  }

  /** Strip diacritics — Helvetica không support Unicode. Khi nào embed Noto/DejaVu thì bỏ. */
  private String strip(String s) {
    if (s == null) return "";
    String n = Normalizer.normalize(s, Normalizer.Form.NFD);
    return n.replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
        .replace('đ', 'd')
        .replace('Đ', 'D');
  }

  @SuppressWarnings("unused")
  private static final List<String> SAFE_NEWLINE = Arrays.asList("\n", "\r\n");
}
