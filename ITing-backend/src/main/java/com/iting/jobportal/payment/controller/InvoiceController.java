package com.iting.jobportal.payment.controller;

import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.file.FileUploadService;
import com.iting.jobportal.payment.entity.Invoice;
import com.iting.jobportal.payment.repository.InvoiceRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/me/invoices")
@RequiredArgsConstructor
public class InvoiceController {

  private final InvoiceRepository invoiceRepository;
  private final FileUploadService fileUploadService;
  private final JwtTokenUtil jwtTokenUtil;

  /** List my invoices (most recent first). */
  @GetMapping
  public ResponseEntity<List<Map<String, Object>>> myInvoices(HttpServletRequest request) {
    Long userId = requireUser(request);
    return ResponseEntity.ok(
        invoiceRepository.findByAccount_IdOrderByIssuedAtDesc(userId).stream()
            .map(this::toDto)
            .collect(Collectors.toList()));
  }

  /** Get a signed download URL for the invoice PDF (valid 1 hour). */
  @GetMapping("/{id}/download")
  public ResponseEntity<Map<String, Object>> download(
      @PathVariable Long id, HttpServletRequest request) {
    Long userId = requireUser(request);
    Invoice inv =
        invoiceRepository
            .findById(id)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice không tồn tại"));
    if (inv.getAccount() == null || !userId.equals(inv.getAccount().getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền tải invoice này");
    }
    if (inv.getPdfS3Url() == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice PDF chưa được generate");
    }
    String signedUrl;
    try {
      signedUrl = fileUploadService.generatePresignedUrl(inv.getPdfS3Url(), 60);
    } catch (Exception e) {
      signedUrl = inv.getPdfS3Url(); // fallback for local dev
    }
    return ResponseEntity.ok(
        Map.of(
            "invoiceNumber",
            inv.getInvoiceNumber(),
            "downloadUrl",
            signedUrl,
            "expiresInMinutes",
            60));
  }

  /** Update billing party (name, tax code, address) — required for company invoice. */
  @PostMapping("/{id}/bill-to")
  public ResponseEntity<Map<String, String>> updateBillTo(
      @PathVariable Long id, @RequestBody Map<String, String> body, HttpServletRequest request) {
    Long userId = requireUser(request);
    Invoice inv =
        invoiceRepository
            .findById(id)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice không tồn tại"));
    if (inv.getAccount() == null || !userId.equals(inv.getAccount().getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền sửa invoice này");
    }
    if (body.containsKey("billToName")) inv.setBillToName(body.get("billToName"));
    if (body.containsKey("billToTaxCode")) inv.setBillToTaxCode(body.get("billToTaxCode"));
    if (body.containsKey("billToAddress")) inv.setBillToAddress(body.get("billToAddress"));
    if (body.containsKey("billToEmail")) inv.setBillToEmail(body.get("billToEmail"));
    invoiceRepository.save(inv);
    return ResponseEntity.ok(
        Map.of(
            "message",
            "Đã cập nhật thông tin. Tải lại PDF để xem invoice với thông tin mới (gọi /regen)."));
  }

  private Map<String, Object> toDto(Invoice inv) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", inv.getId());
    m.put("invoiceNumber", inv.getInvoiceNumber());
    m.put("issuedAt", inv.getIssuedAt());
    m.put("itemDescription", inv.getItemDescription());
    m.put("amountExclVat", inv.getAmountExclVat());
    m.put("vatRate", inv.getVatRate());
    m.put("vatAmount", inv.getVatAmount());
    m.put("totalAmount", inv.getTotalAmount());
    m.put("billToName", inv.getBillToName());
    m.put("billToTaxCode", inv.getBillToTaxCode());
    m.put("hasPdf", inv.getPdfS3Url() != null);
    return m;
  }

  private Long requireUser(HttpServletRequest request) {
    Long id = jwtTokenUtil.getUserIdFromHeader(request);
    if (id == null)
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
    return id;
  }
}
