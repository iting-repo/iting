package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.dto.request.CompanyApprovalRequest;
import com.iting.jobportal.admin.dto.request.ReviewRejectRequest;
import com.iting.jobportal.admin.service.impl.AdminCompanyServiceImpl;
import com.iting.jobportal.company.dto.mapper.CompanyMapper;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.CompanyAuditAction;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.repository.CompanyAuditLogRepository;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.service.CompanyAuditService;
import com.iting.jobportal.file.FileUploadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminCompanyServiceImplTest {

    @Mock private CompanyRepository companyRepository;
    @Mock private CompanyMapper companyMapper;
    @Mock private FileUploadService fileUploadService;
    @Mock private CompanyAuditService companyAuditService;
    @Mock private CompanyAuditLogRepository companyAuditLogRepository;

    @InjectMocks
    private AdminCompanyServiceImpl service;

    @BeforeEach
    void setUp() {
        // Optional<...> fields are left null by @InjectMocks; default to empty.
        ReflectionTestUtils.setField(service, "lockService", Optional.empty());
        ReflectionTestUtils.setField(service, "outboxAppender", Optional.empty());
    }

    @Test
    void approveCompany_shouldApprovePersistAndWriteAuditWithOldAndNewStatus() {
        Company company = new Company();
        company.setId(1L);
        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.PENDING_REVIEW);

        CompanyApprovalRequest request = new CompanyApprovalRequest();
        request.setNote("ok");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

        service.approveCompany(99L, 1L, request);

        assertEquals(CompanyReviewStatus.APPROVED, company.getCompanyInfoUpdateStatus());
        verify(companyRepository).save(company);
        verify(companyAuditService).log(
                eq(company),
                eq(CompanyAuditAction.APPROVE),
                eq(CompanyReviewStatus.PENDING_REVIEW.name()),
                eq(CompanyReviewStatus.APPROVED.name()),
                eq("ok"),
                eq("Công ty được duyệt"),
                eq("admin#99"),
                eq(99L)
        );
    }

    @Test
    void approveCompany_whenRequestIsNull_shouldStillApproveAndLogNullNote() {
        Company company = new Company();
        company.setId(1L);
        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.PENDING_REVIEW);

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

        service.approveCompany(99L, 1L, null);

        assertEquals(CompanyReviewStatus.APPROVED, company.getCompanyInfoUpdateStatus());
        verify(companyRepository).save(company);
        verify(companyAuditService).log(
                eq(company),
                eq(CompanyAuditAction.APPROVE),
                eq(CompanyReviewStatus.PENDING_REVIEW.name()),
                eq(CompanyReviewStatus.APPROVED.name()),
                eq(null),
                eq("Công ty được duyệt"),
                eq("admin#99"),
                eq(99L)
        );
    }

    @Test
    void approveCompany_whenCurrentStatusIsNull_shouldLogOldStatusAsNull() {
        Company company = new Company();
        company.setId(1L);
        company.setCompanyInfoUpdateStatus(null);

        CompanyApprovalRequest request = new CompanyApprovalRequest();
        request.setNote("ok");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

        service.approveCompany(99L, 1L, request);

        assertEquals(CompanyReviewStatus.APPROVED, company.getCompanyInfoUpdateStatus());
        verify(companyAuditService).log(
                eq(company),
                eq(CompanyAuditAction.APPROVE),
                eq(null),
                eq(CompanyReviewStatus.APPROVED.name()),
                eq("ok"),
                eq("Công ty được duyệt"),
                eq("admin#99"),
                eq(99L)
        );
    }

    @Test
    void approveCompany_whenCompanyNotFound_shouldThrowAndNotSaveOrLog() {
        when(companyRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.approveCompany(99L, 1L, new CompanyApprovalRequest()));

        assertEquals("Company not found", ex.getMessage());
        verify(companyRepository, never()).save(any());
        verifyNoInteractions(companyAuditService);
    }

    @Test
    void rejectCompany_shouldRejectPersistAndWriteAuditReason() {
        Company company = new Company();
        company.setId(1L);
        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.PENDING_REVIEW);

        ReviewRejectRequest request = new ReviewRejectRequest();
        request.setReason("invalid docs");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

        service.rejectCompany(7L, 1L, request);

        assertEquals(CompanyReviewStatus.REJECTED, company.getCompanyInfoUpdateStatus());
        verify(companyRepository).save(company);
        verify(companyAuditService).log(
                eq(company),
                eq(CompanyAuditAction.REJECT),
                eq(CompanyReviewStatus.PENDING_REVIEW.name()),
                eq(CompanyReviewStatus.REJECTED.name()),
                eq("invalid docs"),
                eq("Từ chối công ty"),
                eq("admin#7"),
                eq(7L)
        );
    }

    @Test
    void requestCompanyResubmission_shouldSetNeedsResubmissionAndWriteAudit() {
        Company company = new Company();
        company.setId(1L);
        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.PENDING_REVIEW);

        ReviewRejectRequest request = new ReviewRejectRequest();
        request.setReason("missing file");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

        service.requestCompanyResubmission(8L, 1L, request);

        assertEquals(CompanyReviewStatus.NEEDS_RESUBMISSION, company.getCompanyInfoUpdateStatus());
        verify(companyRepository).save(company);
        verify(companyAuditService).log(
                eq(company),
                eq(CompanyAuditAction.REQUEST_RESUBMISSION),
                eq(CompanyReviewStatus.PENDING_REVIEW.name()),
                eq(CompanyReviewStatus.NEEDS_RESUBMISSION.name()),
                eq("missing file"),
                eq("Yêu cầu công ty bổ sung hồ sơ"),
                eq("admin#8"),
                eq(8L)
        );
    }

    @Test
    void suspendCompany_shouldSetSuspendedInactivePersistAndWriteAudit() {
        Company company = new Company();
        company.setId(1L);
        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.APPROVED);
        company.setActive(true);

        ReviewRejectRequest request = new ReviewRejectRequest();
        request.setReason("policy");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

        service.suspendCompany(7L, 1L, request);

        assertEquals(CompanyReviewStatus.SUSPENDED, company.getCompanyInfoUpdateStatus());
        assertEquals(false, company.getActive());

        verify(companyRepository).save(company);
        verify(companyAuditService).log(
                eq(company),
                eq(CompanyAuditAction.SUSPEND),
                eq(CompanyReviewStatus.APPROVED.name()),
                eq(CompanyReviewStatus.SUSPENDED.name()),
                eq("policy"),
                eq("Đình chỉ công ty"),
                eq("admin#7"),
                eq(7L)
        );
    }

    @Test
    void unsuspendCompany_shouldSetApprovedActivePersistAndWriteAudit() {
        Company company = new Company();
        company.setId(1L);
        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.SUSPENDED);
        company.setActive(false);

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

        service.unsuspendCompany(10L, 1L);

        assertEquals(CompanyReviewStatus.APPROVED, company.getCompanyInfoUpdateStatus());
        assertEquals(true, company.getActive());

        verify(companyRepository).save(company);
        verify(companyAuditService).log(
                eq(company),
                eq(CompanyAuditAction.UNSUSPEND),
                eq(CompanyReviewStatus.SUSPENDED.name()),
                eq(CompanyReviewStatus.APPROVED.name()),
                eq(null),
                eq("Kích hoạt lại công ty"),
                eq("admin#10"),
                eq(10L)
        );
    }

    @Test
    void getCompanyBusinessLicenseViewUrl_withFile_shouldReturnPresignedUrl() {
        Company company = new Company();
        company.setId(1L);
        company.setBusinessLicenseFileUrl("s3://license.pdf");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(fileUploadService.generatePresignedUrl("s3://license.pdf", 5))
                .thenReturn("https://signed-url");

        String result = service.getCompanyBusinessLicenseViewUrl(9L, 1L, 5);

        assertEquals("https://signed-url", result);
        verify(fileUploadService).generatePresignedUrl("s3://license.pdf", 5);
    }

    @Test
    void getCompanyBusinessLicenseViewUrl_withoutFile_shouldThrowAndNotGenerateUrl() {
        Company company = new Company();
        company.setId(1L);
        company.setBusinessLicenseFileUrl("   ");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.getCompanyBusinessLicenseViewUrl(9L, 1L, 5));

        assertEquals("Company has not uploaded business license", ex.getMessage());
        verifyNoInteractions(fileUploadService);
    }

    @Test
    void deleteCompany_shouldLogBeforeDelete() {
        Company company = new Company();
        company.setId(1L);
        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.SUSPENDED);

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

        service.deleteCompany(11L, 1L);

        InOrder inOrder = inOrder(companyAuditService, companyRepository);
        inOrder.verify(companyAuditService).log(
                eq(company),
                eq(CompanyAuditAction.DELETE),
                eq(CompanyReviewStatus.SUSPENDED.name()),
                eq("DELETED"),
                eq(null),
                eq("Xóa công ty"),
                eq("admin#11"),
                eq(11L)
        );
        inOrder.verify(companyRepository).delete(company);
    }

    @Test
    void bulkApproveCompanies_shouldProcessEachCompanyId() {
        Company c1 = new Company();
        c1.setId(1L);
        c1.setCompanyInfoUpdateStatus(CompanyReviewStatus.PENDING_REVIEW);

        Company c2 = new Company();
        c2.setId(2L);
        c2.setCompanyInfoUpdateStatus(CompanyReviewStatus.PENDING_REVIEW);

        CompanyApprovalRequest request = new CompanyApprovalRequest();
        request.setNote("bulk ok");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(c1));
        when(companyRepository.findById(2L)).thenReturn(Optional.of(c2));

        service.bulkApproveCompanies(20L, List.of(1L, 2L), request);

        assertEquals(CompanyReviewStatus.APPROVED, c1.getCompanyInfoUpdateStatus());
        assertEquals(CompanyReviewStatus.APPROVED, c2.getCompanyInfoUpdateStatus());
        verify(companyRepository).save(c1);
        verify(companyRepository).save(c2);
        verify(companyAuditService).log(
                eq(c1), eq(CompanyAuditAction.APPROVE),
                eq(CompanyReviewStatus.PENDING_REVIEW.name()),
                eq(CompanyReviewStatus.APPROVED.name()),
                eq("bulk ok"),
                eq("Công ty được duyệt"),
                eq("admin#20"),
                eq(20L)
        );
        verify(companyAuditService).log(
                eq(c2), eq(CompanyAuditAction.APPROVE),
                eq(CompanyReviewStatus.PENDING_REVIEW.name()),
                eq(CompanyReviewStatus.APPROVED.name()),
                eq("bulk ok"),
                eq("Công ty được duyệt"),
                eq("admin#20"),
                eq(20L)
        );
    }

    @Test
    void bulkApproveCompanies_whenIdsNull_shouldDoNothing() {
        CompanyApprovalRequest request = new CompanyApprovalRequest();
        request.setNote("bulk ok");

        service.bulkApproveCompanies(20L, null, request);

        verifyNoInteractions(companyRepository, companyAuditService);
    }

    @Test
    void bulkDeleteCompanies_shouldDeleteEachCompany() {
        Company c1 = new Company();
        c1.setId(1L);
        c1.setCompanyInfoUpdateStatus(CompanyReviewStatus.APPROVED);

        Company c2 = new Company();
        c2.setId(2L);
        c2.setCompanyInfoUpdateStatus(CompanyReviewStatus.SUSPENDED);

        when(companyRepository.findById(1L)).thenReturn(Optional.of(c1));
        when(companyRepository.findById(2L)).thenReturn(Optional.of(c2));

        service.bulkDeleteCompanies(30L, List.of(1L, 2L));

        verify(companyRepository).delete(c1);
        verify(companyRepository).delete(c2);
    }
}