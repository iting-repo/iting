package com.iting.jobportal.company.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.company.dto.mapper.CompanyMapper;
import com.iting.jobportal.company.dto.request.BusinessLicenseUploadRequest;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.BusinessDocumentType;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.repository.CompanyReviewRepository;
import com.iting.jobportal.company.service.impl.CompanyServiceImpl;
import com.iting.jobportal.file.FileUploadService;
import com.iting.jobportal.job.repository.JobRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
class CompanyServiceImplTest {

  @Mock private CompanyRepository companyRepository;

  @Mock private CompanyFollowService companyFollowService;

  @Mock private FileUploadService fileUploadService;

  @Mock private AuthorizationService authz;

  @Mock private CompanyMapper companyMapper;

  @Mock private ApplicationEventPublisher eventPublisher;

  @Mock private JobRepository jobRepository;

  @Mock private CompanyReviewRepository companyReviewRepository;

  @InjectMocks private CompanyServiceImpl companyService;

  private Company company;

  @BeforeEach
  void setUp() {
    company = new Company();
    company.setId(1L);
    company.setName("ITing");
    company.setCompanyEmail("hr@iting.vn");
    company.setPhone("0900000000");
    company.setRepresentativeName("Nguyen Van A");
    company.setTaxCode("TAX-001");
    company.setBusinessLicenseFileUrl("https://old-license.pdf");
    company.setConsentDocumentFileUrl("http://s3/consent.pdf");
    company.setCompanyReviewStatus(CompanyReviewStatus.DRAFT);

    // Sau Phase 2: getCompanyByAccountId() resolve company qua AuthorizationService.
    // Default mock: HR account id 1L thuộc company id 1L (giữ tương thích với data
    // backfill V48 nơi company.id == account.id cũ).
    Mockito.lenient().when(authz.requireCompanyOf(1L)).thenReturn(1L);

    // Mapper: map từ Company entity về CompanyResponse — trả về DTO chứa các field
    // cần thiết để test verify.
    Mockito.lenient()
        .when(companyMapper.toResponse(any(Company.class)))
        .thenAnswer(
            inv -> {
              Company c = inv.getArgument(0);
              CompanyResponse r = new CompanyResponse();
              r.setId(c.getId());
              r.setName(c.getName());
              r.setBusinessLicenseFileUrl(c.getBusinessLicenseFileUrl());
              r.setConsentDocumentFileUrl(c.getConsentDocumentFileUrl());
              r.setCompanyReviewStatus(c.getCompanyReviewStatus());
              return r;
            });

    // mapToResponse() đọc thêm jobCount + followerCount + rating qua các repo này.
    Mockito.lenient().when(jobRepository.countActiveAndNotExpiredByCompanyId(any())).thenReturn(0L);
    Mockito.lenient().when(companyFollowService.getFollowerCount(any())).thenReturn(0L);
  }

  @Test
  void updateBusinessLicenseByAccountId_withNonPdfContentType_shouldThrow() {
    BusinessLicenseUploadRequest request = new BusinessLicenseUploadRequest();
    request.setFile(
        new MockMultipartFile(
            "file",
            "license.docx",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "data".getBytes()));

    when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

    IllegalArgumentException exception =
        assertThrows(
            IllegalArgumentException.class,
            () -> companyService.updateBusinessLicenseByAccountId(1L, request));

    assertTrue(exception.getMessage().contains("PDF"));
    verify(fileUploadService, never()).uploadBusinessLicense(any());
    verify(companyRepository, never()).save(any());
  }

  @Test
  void submitForReviewByAccountId_withMissingRequiredField_shouldThrow() {
    // submitInfoReviewByAccountId now validates: name, companyEmail, phone, representativeName,
    // taxCode.
    // Consent-version is no longer required for info review.
    company.setName(" ");
    when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

    IllegalArgumentException exception =
        assertThrows(
            IllegalArgumentException.class, () -> companyService.submitInfoReviewByAccountId(1L));

    assertTrue(exception.getMessage().contains("Tên công ty"));
    verify(companyRepository, never()).save(any());
  }

  @Test
  void submitForReviewByAccountId_withCompleteProfile_shouldUpdateStatus() {
    when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
    when(companyRepository.save(any(Company.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    CompanyResponse response = companyService.submitInfoReviewByAccountId(1L);

    assertNotNull(response);
    assertEquals(CompanyReviewStatus.PENDING_REVIEW, response.getCompanyReviewStatus());
    assertEquals(CompanyReviewStatus.PENDING_REVIEW, company.getCompanyReviewStatus());
    verify(companyRepository).save(company);
  }

  @Test
  void updateBusinessLicenseByAccountId_withValidPdf_shouldReplaceOldFileAndSetDocumentType() {
    BusinessLicenseUploadRequest request = new BusinessLicenseUploadRequest();
    request.setFile(
        new MockMultipartFile("file", "license.pdf", "application/pdf", "pdf".getBytes()));

    when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
    when(fileUploadService.uploadBusinessLicense(request.getFile()))
        .thenReturn("https://new-license.pdf");
    when(companyRepository.save(any(Company.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    CompanyResponse response = companyService.updateBusinessLicenseByAccountId(1L, request);

    assertEquals("https://new-license.pdf", response.getBusinessLicenseFileUrl());
    assertEquals(BusinessDocumentType.BUSINESS_LICENSE, company.getBusinessLicenseDocumentType());
    verify(fileUploadService).deleteByUrl("https://old-license.pdf");
    verify(fileUploadService).uploadBusinessLicense(request.getFile());
    verify(companyRepository).save(company);
  }
}
