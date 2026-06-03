package com.iting.jobportal.payment.service;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.file.FileUploadService;
import com.iting.jobportal.payment.entity.Invoice;
import com.iting.jobportal.payment.entity.InvoiceSequence;
import com.iting.jobportal.payment.entity.PaymentOrder;
import com.iting.jobportal.payment.repository.InvoiceRepository;
import com.iting.jobportal.payment.repository.InvoiceSequenceRepository;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.color.PDColor;
import org.apache.pdfbox.pdmodel.graphics.color.PDDeviceRGB;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * VAT-compliant invoice PDF generator.
 *
 * <p>Number format: <code>ITI-{YYYY}-{NNNNNN}</code> (e.g. <code>ITI-2026-000123</code>).
 *
 * <p>Sequence stored in {@code invoice_sequence} table — pessimistic lock for concurrency.
 *
 * <p>Output uploaded to S3 at <code>invoices/{invoice_number}.pdf</code>.
 *
 * <p>Note: same font limitation as SalaryReportPdfService — Helvetica strips Vietnamese diacritics.
 * Embed a TTF font for production.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InvoicePdfService {

  private final InvoiceRepository invoiceRepository;
  private final InvoiceSequenceRepository sequenceRepository;
  private final FileUploadService fileUploadService;

  private static final PDFont FONT_REGULAR = PDType1Font.HELVETICA;
  private static final PDFont FONT_BOLD = PDType1Font.HELVETICA_BOLD;
  private static final Color NAVY = new Color(30, 41, 59);
  private static final Color BRAND = new Color(37, 99, 235);
  private static final Color LIGHT = new Color(241, 245, 249);

  private static final int VAT_RATE_PERCENT = 10;

  /**
   * Auto-generate an invoice for a paid order if not already invoiced. Called from
   * SepayPaymentService.activatePurchase().
   */
  @Transactional
  public Invoice autoGenerateForPaidOrder(PaymentOrder order) {
    if (order == null || order.getAccount() == null) return null;

    var existing = invoiceRepository.findByPaymentOrder_Id(order.getId());
    if (existing.isPresent()) return existing.get();

    Account acc = order.getAccount();
    long total = order.getPaidAmount() != null ? order.getPaidAmount() : order.getAmount();
    // VAT inclusive math: total = excl + (excl * vat_rate / 100)
    long excl = Math.round(total * 100.0 / (100.0 + VAT_RATE_PERCENT));
    long vat = total - excl;

    Invoice invoice =
        Invoice.builder()
            .paymentOrder(order)
            .invoiceNumber(nextInvoiceNumber())
            .account(acc)
            .billToName(acc.getFullName() != null ? acc.getFullName() : acc.getEmail())
            .billToEmail(acc.getEmail())
            .amountExclVat(excl)
            .vatRate(VAT_RATE_PERCENT)
            .vatAmount(vat)
            .totalAmount(total)
            .itemDescription(
                order.getDescription() != null ? order.getDescription() : order.getItemType())
            .build();

    // Render PDF + upload S3
    byte[] pdfBytes = renderPdf(invoice);
    String s3Url =
        fileUploadService.uploadBytes(
            pdfBytes, "invoices/" + invoice.getInvoiceNumber() + ".pdf", "application/pdf");
    invoice.setPdfS3Url(s3Url);

    invoiceRepository.save(invoice);
    log.info(
        "[Invoice] Generated {} for order {} (account {})",
        invoice.getInvoiceNumber(),
        order.getOrderCode(),
        acc.getId());
    return invoice;
  }

  /** Generate next invoice number atomically (ITI-2026-000001). */
  @Transactional
  public String nextInvoiceNumber() {
    int year = LocalDate.now().getYear();
    InvoiceSequence seq =
        sequenceRepository
            .findByYearForUpdate(year)
            .orElseGet(
                () -> {
                  InvoiceSequence ns = InvoiceSequence.builder().year(year).lastNumber(0).build();
                  return sequenceRepository.save(ns);
                });
    seq.setLastNumber(seq.getLastNumber() + 1);
    sequenceRepository.save(seq);
    return String.format("ITI-%d-%06d", year, seq.getLastNumber());
  }

  // ─── PDF rendering ────────────────────────────────────────────

  private byte[] renderPdf(Invoice inv) {
    try (PDDocument doc = new PDDocument();
        ByteArrayOutputStream out = new ByteArrayOutputStream()) {
      PDPage page = new PDPage(PDRectangle.A4);
      doc.addPage(page);

      try (PDPageContentStream c = new PDPageContentStream(doc, page)) {
        // Header band
        fillRect(c, 0, 760, 595, 82, BRAND);
        drawText(c, "ITING JSC", 40, 810, FONT_BOLD, 24, Color.WHITE);
        drawText(c, "iting.vn  |  support@iting.vn", 40, 785, FONT_REGULAR, 10, Color.WHITE);
        drawText(c, "VAT INVOICE", 420, 810, FONT_BOLD, 18, Color.WHITE);
        drawText(c, "Hoa don GTGT", 420, 785, FONT_REGULAR, 10, Color.WHITE);

        // Invoice meta
        drawText(c, "Invoice No.", 40, 720, FONT_BOLD, 10, NAVY);
        drawText(c, inv.getInvoiceNumber(), 40, 705, FONT_REGULAR, 12, NAVY);

        drawText(c, "Issued Date", 220, 720, FONT_BOLD, 10, NAVY);
        drawText(
            c,
            inv.getIssuedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy")),
            220,
            705,
            FONT_REGULAR,
            12,
            NAVY);

        drawText(c, "Order Code", 400, 720, FONT_BOLD, 10, NAVY);
        drawText(
            c,
            inv.getPaymentOrder() != null ? inv.getPaymentOrder().getOrderCode() : "-",
            400,
            705,
            FONT_REGULAR,
            12,
            NAVY);

        // Bill To
        drawText(c, "BILL TO", 40, 660, FONT_BOLD, 12, NAVY);
        fillRect(c, 40, 580, 515, 70, LIGHT);
        drawText(c, "Name: " + nullSafe(inv.getBillToName()), 50, 630, FONT_REGULAR, 11, NAVY);
        drawText(
            c,
            "Tax code (MST): " + nullSafe(inv.getBillToTaxCode()),
            50,
            612,
            FONT_REGULAR,
            11,
            NAVY);
        drawText(
            c, "Address: " + nullSafe(inv.getBillToAddress()), 50, 596, FONT_REGULAR, 11, NAVY);

        // Item table header
        fillRect(c, 40, 540, 515, 22, NAVY);
        drawText(c, "Description", 50, 545, FONT_BOLD, 11, Color.WHITE);
        drawText(c, "Excl. VAT", 320, 545, FONT_BOLD, 11, Color.WHITE);
        drawText(c, "VAT 10%", 410, 545, FONT_BOLD, 11, Color.WHITE);
        drawText(c, "Total", 490, 545, FONT_BOLD, 11, Color.WHITE);

        // Item row
        drawText(c, ascii(inv.getItemDescription()), 50, 518, FONT_REGULAR, 11, NAVY);
        drawText(c, formatVnd(inv.getAmountExclVat()), 320, 518, FONT_REGULAR, 11, NAVY);
        drawText(c, formatVnd(inv.getVatAmount()), 410, 518, FONT_REGULAR, 11, NAVY);
        drawText(c, formatVnd(inv.getTotalAmount()), 490, 518, FONT_BOLD, 11, NAVY);

        // Total band
        fillRect(c, 40, 460, 515, 40, LIGHT);
        drawText(c, "GRAND TOTAL", 50, 478, FONT_BOLD, 13, NAVY);
        drawText(c, formatVnd(inv.getTotalAmount()) + " VND", 380, 478, FONT_BOLD, 16, BRAND);

        // Payment info
        drawText(c, "Payment status: PAID", 40, 420, FONT_BOLD, 11, new Color(34, 139, 34));
        drawText(c, "Payment method: SEPAY (bank transfer)", 40, 405, FONT_REGULAR, 10, NAVY);
        drawText(
            c,
            "Transaction ID: "
                + (inv.getPaymentOrder() != null
                        && inv.getPaymentOrder().getSepayTransactionId() != null
                    ? inv.getPaymentOrder().getSepayTransactionId()
                    : "-"),
            40,
            390,
            FONT_REGULAR,
            10,
            NAVY);

        // Footer
        drawText(
            c,
            "This is an electronic invoice — no signature required.",
            40,
            80,
            FONT_REGULAR,
            9,
            new Color(120, 120, 120));
        drawText(
            c,
            "ITING JSC  |  https://iting.vn  |  support@iting.vn",
            40,
            65,
            FONT_REGULAR,
            9,
            new Color(120, 120, 120));
        fillRect(c, 0, 0, 595, 30, NAVY);
        drawText(
            c,
            "Generated by ITing — " + LocalDate.now().format(DateTimeFormatter.ISO_DATE),
            40,
            12,
            FONT_REGULAR,
            9,
            Color.WHITE);
      }
      doc.save(out);
      return out.toByteArray();
    } catch (Exception e) {
      throw new RuntimeException("Failed to render invoice PDF", e);
    }
  }

  private void fillRect(PDPageContentStream c, float x, float y, float w, float h, Color color)
      throws Exception {
    c.setNonStrokingColor(toPDColor(color));
    c.addRect(x, y, w, h);
    c.fill();
  }

  private void drawText(
      PDPageContentStream c, String text, float x, float y, PDFont font, float size, Color color)
      throws Exception {
    c.beginText();
    c.setFont(font, size);
    c.setNonStrokingColor(toPDColor(color));
    c.newLineAtOffset(x, y);
    c.showText(ascii(text));
    c.endText();
  }

  private PDColor toPDColor(Color color) {
    return new PDColor(
        new float[] {color.getRed() / 255f, color.getGreen() / 255f, color.getBlue() / 255f},
        PDDeviceRGB.INSTANCE);
  }

  /** Strip non-ASCII so Helvetica Type 1 can render (Vietnamese diacritics fall back to ASCII). */
  private String ascii(String s) {
    if (s == null) return "";
    return java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD)
        .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
        .replace("đ", "d")
        .replace("Đ", "D")
        .replaceAll("[^\\x20-\\x7E]", "");
  }

  private String nullSafe(String s) {
    return s == null ? "-" : s;
  }

  private String formatVnd(long amount) {
    return NumberFormat.getNumberInstance(Locale.US).format(amount);
  }
}
