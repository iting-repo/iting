package com.iting.jobportal.company.service;

import com.iting.jobportal.company.dto.request.BusinessLicenseUploadRequest;
import com.iting.jobportal.company.dto.request.ConsentDocumentUploadRequest;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.BusinessDocumentType;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.service.impl.CompanyServiceImpl;
import com.iting.jobportal.file.FileUploadService;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.company.dto.mapper.CompanyMapper;
import com.iting.jobportal.company.repository.CompanyReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompanyServiceImplTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private CompanyFollowService companyFollowService;

    @Mock
    private FileUploadService fileUploadService;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private CompanyMapper companyMapper;

    @Mock
    private CompanyReviewRepository companyReviewRepository;

    @InjectMocks
    private CompanyServiceImpl companyService;

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
        company.setConsentDocumentFileUrl("https://consent.pdf");
        company.setConsentDocumentConfirmed(true);
        company.setConsentDocumentVersion("v2.0");
        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.DRAFT);
    }

    @Test
    void updateBusinessLicenseByAccountId_withNonPdfContentType_shouldThrow() {
        BusinessLicenseUploadRequest request = new BusinessLicenseUploadRequest();
        request.setFile(new MockMultipartFile("file", "license.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "data".getBytes()));

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> companyService.updateBusinessLicenseByAccountId(1L, request)
        );

        assertTrue(exception.getMessage().contains("PDF"));
        verify(fileUploadService, never()).uploadBusinessLicense(any());
        verify(companyRepository, never()).save(any());
    }

    @Test
    void updateConsentDocumentByAccountId_withoutVersion_shouldUseDefaultVersion() {
        ConsentDocumentUploadRequest request = new ConsentDocumentUploadRequest();
        request.setConfirmed(true);
        request.setFile(new MockMultipartFile("file", "consent.pdf", "application/pdf", "pdf".getBytes()));

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(fileUploadService.uploadConsentDocument(request.getFile())).thenReturn("https://new-consent.pdf");
        when(companyRepository.save(any(Company.class))).thenAnswer(invocation -> invocation.getArgument(0));
        CompanyResponse responseMock = new CompanyResponse();
        responseMock.setConsentDocumentFileUrl("https://new-consent.pdf");
        when(companyMapper.toResponse(any(Company.class))).thenReturn(responseMock);

        CompanyResponse response = companyService.updateConsentDocumentByAccountId(1L, request);

        assertNotNull(response);
        assertEquals("https://new-consent.pdf", response.getConsentDocumentFileUrl());
        assertEquals("v1.0", company.getConsentDocumentVersion());
        verify(fileUploadService).deleteByUrl("https://consent.pdf");
        verify(companyRepository).save(company);
    }

    @Test
    void submitForReviewByAccountId_withMissingConsentVersion_shouldThrow() {
        company.setConsentDocumentVersion(" ");
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(companyRepository.save(any(Company.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> companyService.submitInfoReviewByAccountId(1L)
        );

        assertTrue(exception.getMessage().contains("Phi"));
        verify(companyRepository, never()).save(any());
    }

    @Test
    void submitForReviewByAccountId_withCompleteProfile_shouldUpdateStatus() {
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(companyRepository.save(any(Company.class))).thenAnswer(invocation -> invocation.getArgument(0));
        CompanyResponse responseMock = new CompanyResponse();
        responseMock.setCompanyInfoUpdateStatus(CompanyReviewStatus.PENDING_REVIEW);
        when(companyMapper.toResponse(any(Company.class))).thenReturn(responseMock);

        CompanyResponse response = companyService.submitInfoReviewByAccountId(1L);

        assertNotNull(response);
        assertEquals(CompanyReviewStatus.PENDING_REVIEW, response.getCompanyInfoUpdateStatus());
        assertEquals(CompanyReviewStatus.PENDING_REVIEW, company.getCompanyInfoUpdateStatus());
        verify(companyRepository).save(company);
    }

    @Test
    void updateBusinessLicenseByAccountId_withValidPdf_shouldReplaceOldFileAndSetDocumentType() {
        BusinessLicenseUploadRequest request = new BusinessLicenseUploadRequest();
        request.setFile(new MockMultipartFile("file", "license.pdf", "application/pdf", "pdf".getBytes()));

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(fileUploadService.uploadBusinessLicense(request.getFile())).thenReturn("https://new-license.pdf");
        when(companyRepository.save(any(Company.class))).thenAnswer(invocation -> invocation.getArgument(0));
        CompanyResponse responseMock = new CompanyResponse();
        responseMock.setBusinessLicenseFileUrl("https://new-license.pdf");
        responseMock.setBusinessLicenseDocumentType(BusinessDocumentType.BUSINESS_LICENSE);
        when(companyMapper.toResponse(any(Company.class))).thenReturn(responseMock);

        CompanyResponse response = companyService.updateBusinessLicenseByAccountId(1L, request);

        assertEquals("https://new-license.pdf", response.getBusinessLicenseFileUrl());
        assertEquals(BusinessDocumentType.BUSINESS_LICENSE, company.getBusinessLicenseDocumentType());
        verify(fileUploadService).deleteByUrl("https://old-license.pdf");
        verify(fileUploadService).uploadBusinessLicense(request.getFile());
        verify(companyRepository).save(company);
    }
}
