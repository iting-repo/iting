package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.request.*;
import com.iting.jobportal.admin.dto.response.CompanyAuditLogResponse;
import com.iting.jobportal.admin.dto.response.KybNoteResponse;
import com.iting.jobportal.admin.service.AdminCompanyService;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.enums.CompanyAuditAction;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompanyAdminControllerTest {

    @Mock private AdminCompanyService adminCompanyService;
    @InjectMocks private CompanyAdminController controller;

    // ── lists ────────────────────────────────────────────────────────────

    @Test
    void getCompanies_passesAllFilters() {
        Page<CompanyResponse> page = new PageImpl<>(List.of());
        when(adminCompanyService.filterCompanies(CompanyReviewStatus.PENDING_REVIEW,
                VerificationLevel.UNVERIFIED, true, "ACME", 0, 10)).thenReturn(page);

        ResponseEntity<Page<CompanyResponse>> resp = controller.getCompanies(
                CompanyReviewStatus.PENDING_REVIEW, VerificationLevel.UNVERIFIED, true, "ACME", 0, 10);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertSame(page, resp.getBody());
    }

    @Test
    void getCompanies_nullFilters_allowed() {
        when(adminCompanyService.filterCompanies(null, null, null, null, 0, 10))
                .thenReturn(new PageImpl<>(List.of()));

        controller.getCompanies(null, null, null, null, 0, 10);

        verify(adminCompanyService).filterCompanies(null, null, null, null, 0, 10);
    }

    @Test
    void getPendingReviewCompanies_delegatesToService() {
        Page<CompanyResponse> page = new PageImpl<>(List.of());
        when(adminCompanyService.getPendingReviewCompanies(0, 10)).thenReturn(page);

        assertSame(page, controller.getPendingReviewCompanies(0, 10).getBody());
    }

    @Test
    void getCompanyDetail_delegatesToService() {
        CompanyResponse expected = new CompanyResponse();
        when(adminCompanyService.getCompanyDetail(5L)).thenReturn(expected);

        assertSame(expected, controller.getCompanyDetail(5L).getBody());
    }

    @Test
    void filterCompanies_endpoint_delegatesToService() {
        Page<CompanyResponse> page = new PageImpl<>(List.of());
        when(adminCompanyService.filterCompanies(any(), any(), any(), any(), org.mockito.ArgumentMatchers.eq(0),
                org.mockito.ArgumentMatchers.eq(10))).thenReturn(page);

        assertSame(page, controller.filterCompanies(null, null, null, null, 0, 10).getBody());
    }

    // ── KYB notes ────────────────────────────────────────────────────────

    @Test
    void getCompanyKybNotes_delegatesToService() {
        List<KybNoteResponse> notes = List.of();
        when(adminCompanyService.getCompanyKybNotes(5L)).thenReturn(notes);

        assertSame(notes, controller.getCompanyKybNotes(5L).getBody());
    }

    @Test
    void addCompanyKybNote_passesAdminId() {
        CreateKybNoteRequest req = new CreateKybNoteRequest();
        KybNoteResponse expected = KybNoteResponse.builder().build();
        when(adminCompanyService.addCompanyKybNote(1L, 5L, req)).thenReturn(expected);

        assertSame(expected, controller.addCompanyKybNote(5L, req).getBody());
    }

    // ── approve / reject (3 layers each) ────────────────────────────────

    @Test
    void approveCompany_callsService() {
        CompanyApprovalRequest req = new CompanyApprovalRequest();

        ResponseEntity<?> resp = controller.approveCompany(5L, req);

        verify(adminCompanyService).approveCompany(1L, 5L, req);
        assertEquals("Company approved successfully", ((Map<?, ?>) resp.getBody()).get("message"));
    }

    @Test
    void approveCompanyInfo_callsService() {
        CompanyApprovalRequest req = new CompanyApprovalRequest();
        controller.approveCompanyInfo(5L, req);
        verify(adminCompanyService).approveCompanyInfo(1L, 5L, req);
    }

    @Test
    void approveCompanyDocuments_callsService() {
        CompanyApprovalRequest req = new CompanyApprovalRequest();
        controller.approveCompanyDocuments(5L, req);
        verify(adminCompanyService).approveCompanyDocuments(1L, 5L, req);
    }

    @Test
    void rejectCompany_callsService() {
        ReviewRejectRequest req = new ReviewRejectRequest();
        controller.rejectCompany(5L, req);
        verify(adminCompanyService).rejectCompany(1L, 5L, req);
    }

    @Test
    void rejectCompanyInfo_callsService() {
        ReviewRejectRequest req = new ReviewRejectRequest();
        controller.rejectCompanyInfo(5L, req);
        verify(adminCompanyService).rejectCompanyInfo(1L, 5L, req);
    }

    @Test
    void rejectCompanyDocuments_callsService() {
        ReviewRejectRequest req = new ReviewRejectRequest();
        controller.rejectCompanyDocuments(5L, req);
        verify(adminCompanyService).rejectCompanyDocuments(1L, 5L, req);
    }

    @Test
    void requestResubmission_callsService() {
        ReviewRejectRequest req = new ReviewRejectRequest();
        controller.requestResubmission(5L, req);
        verify(adminCompanyService).requestCompanyResubmission(1L, 5L, req);
    }

    // ── suspend / unsuspend / delete ────────────────────────────────────

    @Test
    void suspendCompany_callsService() {
        ReviewRejectRequest req = new ReviewRejectRequest();
        controller.suspendCompany(5L, req);
        verify(adminCompanyService).suspendCompany(1L, 5L, req);
    }

    @Test
    void unsuspendCompany_callsService() {
        controller.unsuspendCompany(5L);
        verify(adminCompanyService).unsuspendCompany(1L, 5L);
    }

    @Test
    void deleteCompany_callsService() {
        controller.deleteCompany(5L);
        verify(adminCompanyService).deleteCompany(1L, 5L);
    }

    // ── presigned URL views ─────────────────────────────────────────────

    @Test
    void viewCompanyBusinessLicense_returnsPresignedUrl() {
        when(adminCompanyService.getCompanyBusinessLicenseViewUrl(1L, 5L, 15))
                .thenReturn("https://s3/license");

        assertEquals("https://s3/license", controller.viewCompanyBusinessLicense(5L).getBody().get("url"));
    }

    @Test
    void viewCompanyConsentDocument_returnsPresignedUrl() {
        when(adminCompanyService.getCompanyConsentDocumentViewUrl(5L, 15))
                .thenReturn("https://s3/consent");

        assertEquals("https://s3/consent", controller.viewCompanyConsentDocument(5L).getBody().get("url"));
    }

    // ── bulk operations ─────────────────────────────────────────────────

    @Test
    void bulkApproveCompanies_buildsSingleReqFromBulk() {
        BulkCompanyApprovalRequest req = new BulkCompanyApprovalRequest();
        req.setIds(List.of(1L, 2L));
        req.setVerificationLevel(VerificationLevel.ADVANCED);
        req.setNote("Approved bulk");

        controller.bulkApproveCompanies(req);

        ArgumentCaptor<CompanyApprovalRequest> cap = ArgumentCaptor.forClass(CompanyApprovalRequest.class);
        verify(adminCompanyService).bulkApproveCompanies(org.mockito.ArgumentMatchers.eq(1L),
                org.mockito.ArgumentMatchers.eq(List.of(1L, 2L)), cap.capture());
        assertEquals(VerificationLevel.ADVANCED, cap.getValue().getVerificationLevel());
        assertEquals("Approved bulk", cap.getValue().getNote());
    }

    @Test
    void bulkRejectCompanies_buildsSingleReqFromBulk() {
        BulkReviewRejectRequest req = new BulkReviewRejectRequest();
        req.setIds(List.of(1L));
        req.setReason("Bad documents");

        controller.bulkRejectCompanies(req);

        ArgumentCaptor<ReviewRejectRequest> cap = ArgumentCaptor.forClass(ReviewRejectRequest.class);
        verify(adminCompanyService).bulkRejectCompanies(org.mockito.ArgumentMatchers.eq(1L),
                org.mockito.ArgumentMatchers.eq(List.of(1L)), cap.capture());
        assertEquals("Bad documents", cap.getValue().getReason());
    }

    @Test
    void bulkSuspendCompanies_buildsSingleReqFromBulk() {
        BulkReviewRejectRequest req = new BulkReviewRejectRequest();
        req.setIds(List.of(1L, 2L));
        req.setReason("Audit");

        controller.bulkSuspendCompanies(req);

        ArgumentCaptor<ReviewRejectRequest> cap = ArgumentCaptor.forClass(ReviewRejectRequest.class);
        verify(adminCompanyService).bulkSuspendCompanies(org.mockito.ArgumentMatchers.eq(1L),
                org.mockito.ArgumentMatchers.eq(List.of(1L, 2L)), cap.capture());
        assertEquals("Audit", cap.getValue().getReason());
    }

    @Test
    void bulkDeleteCompanies_passesIds() {
        BulkActionRequest req = new BulkActionRequest();
        req.setIds(List.of(1L, 2L));

        controller.bulkDeleteCompanies(req);

        verify(adminCompanyService).bulkDeleteCompanies(1L, List.of(1L, 2L));
    }

    // ── audit logs ──────────────────────────────────────────────────────

    @Test
    void getCompanyAuditLogs_delegatesToService() {
        List<CompanyAuditLogResponse> logs = List.of();
        when(adminCompanyService.getCompanyAuditLogs(5L)).thenReturn(logs);

        assertSame(logs, controller.getCompanyAuditLogs(5L).getBody());
    }

    @Test
    void getAllCompanyAuditLogs_passesAllFilters() {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 5, 1);
        List<CompanyAuditLogResponse> logs = List.of();
        when(adminCompanyService.getAllCompanyAuditLogs(CompanyAuditAction.APPROVE, 5L, from, to))
                .thenReturn(logs);

        assertSame(logs, controller.getAllCompanyAuditLogs(
                CompanyAuditAction.APPROVE, 5L, from, to).getBody());
    }

    // ── export / import / template ──────────────────────────────────────

    @Test
    void exportCompanies_returnsExcel() {
        when(adminCompanyService.exportCompaniesToExcel())
                .thenReturn(new ByteArrayInputStream(new byte[]{1, 2, 3}));

        ResponseEntity<Resource> resp = controller.exportCompanies();

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertTrue(resp.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION).contains("companies.xlsx"));
    }

    @Test
    void importCompanies_passesFile() {
        MockMultipartFile file = new MockMultipartFile("file", "c.xlsx", null, new byte[1024]);

        controller.importCompanies(file);

        verify(adminCompanyService).importCompaniesFromExcel(any(MultipartFile.class));
    }

    @Test
    void getTemplate_returnsTemplateExcel() {
        when(adminCompanyService.getImportTemplate())
                .thenReturn(new ByteArrayInputStream(new byte[]{1, 2, 3}));

        ResponseEntity<Resource> resp = controller.getTemplate();

        assertTrue(resp.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION)
                .contains("companies_template.xlsx"));
    }
}
