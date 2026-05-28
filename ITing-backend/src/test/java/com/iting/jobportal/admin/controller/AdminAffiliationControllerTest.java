package com.iting.jobportal.admin.controller;

import com.iting.jobportal.company.dto.request.AffiliationRejectRequest;
import com.iting.jobportal.company.dto.request.ApplyAffiliationToCompanyRequest;
import com.iting.jobportal.company.dto.response.AdminAffiliationResponse;
import com.iting.jobportal.company.entity.enums.AffiliationStatus;
import com.iting.jobportal.company.entity.enums.SubmissionStatus;
import com.iting.jobportal.company.service.AdminAffiliationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminAffiliationControllerTest {

    @Mock private AdminAffiliationService adminAffiliationService;
    @InjectMocks private AdminAffiliationController controller;

    // ── list ─────────────────────────────────────────────────────────────

    @Test
    void list_passesAllFiltersAndPagination() {
        Page<AdminAffiliationResponse> page = new PageImpl<>(List.of());
        when(adminAffiliationService.list(
                eq(AffiliationStatus.APPROVED),
                eq(SubmissionStatus.PENDING_REVIEW),
                eq(10L), eq(20L), eq("hr@x.y"),
                any(Pageable.class))).thenReturn(page);

        ResponseEntity<Page<AdminAffiliationResponse>> resp = controller.list(
                AffiliationStatus.APPROVED, SubmissionStatus.PENDING_REVIEW,
                10L, 20L, "hr@x.y", 0, 20, "id,desc");

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertSame(page, resp.getBody());
    }

    @Test
    void list_sortAsc_parsedCorrectly() {
        when(adminAffiliationService.list(any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        controller.list(null, null, null, null, null, 0, 20, "createdAt,asc");

        ArgumentCaptor<Pageable> cap = ArgumentCaptor.forClass(Pageable.class);
        org.mockito.Mockito.verify(adminAffiliationService).list(any(), any(), any(), any(), any(), cap.capture());
        Sort.Order order = cap.getValue().getSort().getOrderFor("createdAt");
        assertEquals(Sort.Direction.ASC, order.getDirection());
    }

    @Test
    void list_sortDesc_default() {
        when(adminAffiliationService.list(any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        controller.list(null, null, null, null, null, 0, 20, "id,desc");

        ArgumentCaptor<Pageable> cap = ArgumentCaptor.forClass(Pageable.class);
        org.mockito.Mockito.verify(adminAffiliationService).list(any(), any(), any(), any(), any(), cap.capture());
        assertEquals(Sort.Direction.DESC, cap.getValue().getSort().getOrderFor("id").getDirection());
    }

    @Test
    void list_malformedSort_fallsBackToIdDesc() {
        when(adminAffiliationService.list(any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        controller.list(null, null, null, null, null, 0, 20, "");

        ArgumentCaptor<Pageable> cap = ArgumentCaptor.forClass(Pageable.class);
        org.mockito.Mockito.verify(adminAffiliationService).list(any(), any(), any(), any(), any(), cap.capture());
        // empty sort string → split returns [""] → empty field. Try block may throw,
        // catch returns default. Either way, result should sort by id DESC.
        Sort sort = cap.getValue().getSort();
        // Default fallback uses "id" + DESC. Check at least DESC is set somewhere.
        assertEquals(Sort.Direction.DESC, sort.iterator().next().getDirection());
    }

    @Test
    void list_singleSortField_defaultsAscDirection_actually_desc() {
        // Per logic: parts.length > 1 && "asc"... so single-field (no comma) → DESC fallback
        when(adminAffiliationService.list(any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        controller.list(null, null, null, null, null, 0, 20, "name");

        ArgumentCaptor<Pageable> cap = ArgumentCaptor.forClass(Pageable.class);
        org.mockito.Mockito.verify(adminAffiliationService).list(any(), any(), any(), any(), any(), cap.capture());
        Sort.Order order = cap.getValue().getSort().getOrderFor("name");
        assertEquals(Sort.Direction.DESC, order.getDirection());
    }

    // ── getDetail ────────────────────────────────────────────────────────

    @Test
    void getDetail_delegatesToService() {
        AdminAffiliationResponse r = new AdminAffiliationResponse();
        when(adminAffiliationService.getDetail(5L)).thenReturn(r);

        assertSame(r, controller.getDetail(5L).getBody());
    }

    // ── presigned URL views ─────────────────────────────────────────────

    @Test
    void viewLicense_returnsPresignedUrl_with15minTtl() {
        when(adminAffiliationService.getLicensePresignedUrl(5L, 15)).thenReturn("https://s3/license");

        ResponseEntity<Map<String, String>> resp = controller.viewLicense(5L);

        assertEquals("https://s3/license", resp.getBody().get("url"));
    }

    @Test
    void viewLogo_returnsPresignedUrl() {
        when(adminAffiliationService.getLogoPresignedUrl(5L, 15)).thenReturn("https://s3/logo");
        assertEquals("https://s3/logo", controller.viewLogo(5L).getBody().get("url"));
    }

    @Test
    void viewConsent_returnsPresignedUrl() {
        when(adminAffiliationService.getConsentPresignedUrl(5L, 15)).thenReturn("https://s3/consent");
        assertEquals("https://s3/consent", controller.viewConsent(5L).getBody().get("url"));
    }

    // ── approve / reject / apply-to-company / revoke ────────────────────

    @Test
    void approve_passesIdAndAdminId() {
        AdminAffiliationResponse expected = new AdminAffiliationResponse();
        when(adminAffiliationService.approve(5L, 99L)).thenReturn(expected);

        assertSame(expected, controller.approve(5L, 99L).getBody());
    }

    @Test
    void reject_passesReason() {
        AffiliationRejectRequest req = new AffiliationRejectRequest();
        req.setReason("Giấy phép không hợp lệ");
        AdminAffiliationResponse expected = new AdminAffiliationResponse();
        when(adminAffiliationService.reject(5L, 99L, "Giấy phép không hợp lệ")).thenReturn(expected);

        assertSame(expected, controller.reject(5L, 99L, req).getBody());
    }

    @Test
    void applyToCompany_passesEmailAndNote() {
        ApplyAffiliationToCompanyRequest req = new ApplyAffiliationToCompanyRequest();
        req.setVerifiedHrEmail("hr@company.vn");
        req.setContactNote("Đã gọi xác minh");
        AdminAffiliationResponse expected = new AdminAffiliationResponse();
        when(adminAffiliationService.applyToCompany(5L, 99L, "hr@company.vn", "Đã gọi xác minh"))
                .thenReturn(expected);

        assertSame(expected, controller.applyToCompany(5L, 99L, req).getBody());
    }

    @Test
    void revoke_passesReason() {
        AffiliationRejectRequest req = new AffiliationRejectRequest();
        req.setReason("Sai phạm");
        AdminAffiliationResponse expected = new AdminAffiliationResponse();
        when(adminAffiliationService.revoke(5L, 99L, "Sai phạm")).thenReturn(expected);

        assertSame(expected, controller.revoke(5L, 99L, req).getBody());
    }
}
