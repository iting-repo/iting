package com.iting.jobportal.payment.controller;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.file.FileUploadService;
import com.iting.jobportal.payment.entity.Invoice;
import com.iting.jobportal.payment.repository.InvoiceRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Cover toàn bộ branch của InvoiceController:
 *  - myInvoices: list + DTO mapping
 *  - download: auth gate, ownership, missing PDF, S3 presign success/fallback
 *  - updateBillTo: ownership, partial update (chỉ field có trong body)
 *  - unauth handling cho mọi endpoint
 */
@ExtendWith(MockitoExtension.class)
class InvoiceControllerTest {

    @Mock private InvoiceRepository invoiceRepository;
    @Mock private FileUploadService fileUploadService;
    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private HttpServletRequest request;

    @InjectMocks private InvoiceController controller;

    private Account owner;
    private Account stranger;
    private Invoice inv;

    @BeforeEach
    void setup() {
        owner = new Account();
        owner.setId(10L);
        stranger = new Account();
        stranger.setId(99L);

        inv = new Invoice();
        inv.setId(500L);
        inv.setAccount(owner);
        inv.setInvoiceNumber("INV-2026-0001");
        inv.setIssuedAt(LocalDateTime.of(2026, 5, 1, 10, 0));
        inv.setItemDescription("Subscription Pro");
        inv.setAmountExclVat(100000L);
        inv.setVatRate(10);
        inv.setVatAmount(10000L);
        inv.setTotalAmount(110000L);
        inv.setBillToName("ACME Co.");
        inv.setBillToTaxCode("0123456789");
        inv.setPdfS3Url("invoices/INV-2026-0001.pdf");
    }

    // ── myInvoices ───────────────────────────────────────────────────────

    @Test
    void myInvoices_mapsAllFields_andHasPdfFlag() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
        when(invoiceRepository.findByAccount_IdOrderByIssuedAtDesc(10L)).thenReturn(List.of(inv));

        ResponseEntity<List<Map<String, Object>>> resp = controller.myInvoices(request);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        List<Map<String, Object>> body = resp.getBody();
        assertNotNull(body);
        assertEquals(1, body.size());
        Map<String, Object> m = body.get(0);
        assertEquals(500L, m.get("id"));
        assertEquals("INV-2026-0001", m.get("invoiceNumber"));
        assertEquals("Subscription Pro", m.get("itemDescription"));
        assertEquals(100000L, m.get("amountExclVat"));
        assertEquals(110000L, m.get("totalAmount"));
        assertEquals("ACME Co.", m.get("billToName"));
        assertEquals(true, m.get("hasPdf"));
    }

    @Test
    void myInvoices_pdfNull_hasPdfFlagFalse() {
        inv.setPdfS3Url(null);
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
        when(invoiceRepository.findByAccount_IdOrderByIssuedAtDesc(10L)).thenReturn(List.of(inv));

        Map<String, Object> m = controller.myInvoices(request).getBody().get(0);
        assertEquals(false, m.get("hasPdf"));
    }

    @Test
    void myInvoices_unauthenticated_throws401() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.myInvoices(request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }

    // ── download ─────────────────────────────────────────────────────────

    @Test
    void download_owner_returnsPresignedUrl() throws Exception {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
        when(invoiceRepository.findById(500L)).thenReturn(Optional.of(inv));
        when(fileUploadService.generatePresignedUrl("invoices/INV-2026-0001.pdf", 60))
                .thenReturn("https://s3.example/signed-url");

        ResponseEntity<Map<String, Object>> resp = controller.download(500L, request);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("INV-2026-0001", resp.getBody().get("invoiceNumber"));
        assertEquals("https://s3.example/signed-url", resp.getBody().get("downloadUrl"));
        assertEquals(60, resp.getBody().get("expiresInMinutes"));
    }

    @Test
    void download_presignFails_fallbacksToRawUrl() throws Exception {
        // Local dev không có S3 — fallback trả raw URL để không crash
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
        when(invoiceRepository.findById(500L)).thenReturn(Optional.of(inv));
        when(fileUploadService.generatePresignedUrl(org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyInt()))
                .thenThrow(new RuntimeException("S3 not configured"));

        ResponseEntity<Map<String, Object>> resp = controller.download(500L, request);

        assertEquals("invoices/INV-2026-0001.pdf", resp.getBody().get("downloadUrl"));
    }

    @Test
    void download_byStranger_throws403() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(99L);
        when(invoiceRepository.findById(500L)).thenReturn(Optional.of(inv));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.download(500L, request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void download_orphanInvoice_noAccount_throws403() {
        inv.setAccount(null);
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
        when(invoiceRepository.findById(500L)).thenReturn(Optional.of(inv));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.download(500L, request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void download_pdfNotYetGenerated_throws404() {
        inv.setPdfS3Url(null);
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
        when(invoiceRepository.findById(500L)).thenReturn(Optional.of(inv));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.download(500L, request));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertTrue(ex.getReason().contains("chưa được generate"));
    }

    @Test
    void download_invoiceNotFound_throws404() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
        when(invoiceRepository.findById(500L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.download(500L, request));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void download_unauthenticated_throws401() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.download(500L, request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }

    // ── updateBillTo ─────────────────────────────────────────────────────

    @Test
    void updateBillTo_owner_partialUpdate_savesNewFieldsOnly() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
        when(invoiceRepository.findById(500L)).thenReturn(Optional.of(inv));
        when(invoiceRepository.save(inv)).thenReturn(inv);

        // Chỉ update name + tax, address không có trong body → giữ nguyên
        Map<String, String> body = Map.of(
                "billToName", "NEW NAME",
                "billToTaxCode", "9999999999");

        controller.updateBillTo(500L, body, request);

        assertEquals("NEW NAME", inv.getBillToName());
        assertEquals("9999999999", inv.getBillToTaxCode());
        // billToAddress không truyền → KHÔNG bị clear (giữ giá trị cũ là null trong setup)
        verify(invoiceRepository).save(inv);
    }

    @Test
    void updateBillTo_owner_allFields() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
        when(invoiceRepository.findById(500L)).thenReturn(Optional.of(inv));
        when(invoiceRepository.save(inv)).thenReturn(inv);

        Map<String, String> body = Map.of(
                "billToName", "N",
                "billToTaxCode", "T",
                "billToAddress", "A",
                "billToEmail", "e@x.y");

        controller.updateBillTo(500L, body, request);

        assertEquals("N", inv.getBillToName());
        assertEquals("T", inv.getBillToTaxCode());
        assertEquals("A", inv.getBillToAddress());
        assertEquals("e@x.y", inv.getBillToEmail());
    }

    @Test
    void updateBillTo_stranger_throws403_andDoesNotSave() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(99L);
        when(invoiceRepository.findById(500L)).thenReturn(Optional.of(inv));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.updateBillTo(500L, Map.of("billToName", "Hacker"), request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(invoiceRepository, never()).save(org.mockito.ArgumentMatchers.any(Invoice.class));
    }

    @Test
    void updateBillTo_invoiceNotFound_throws404() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
        when(invoiceRepository.findById(500L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.updateBillTo(500L, Map.of(), request));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void updateBillTo_unauthenticated_throws401() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.updateBillTo(500L, Map.of(), request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }
}
