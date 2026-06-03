package com.iting.jobportal.company.dto.mapper;

import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.Company;
import java.util.ArrayList;
import org.springframework.stereotype.Component;

@Component
@lombok.RequiredArgsConstructor
public class CompanyMapper {

  private final com.iting.jobportal.file.FileUploadService fileUploadService;

  public CompanyResponse toResponse(Company company) {

    if (company == null) {
      return null;
    }

    CompanyResponse res = new CompanyResponse();

    res.setId(company.getId());
    res.setName(company.getName());
    res.setWebsite(company.getWebsite());
    res.setAddress(company.getAddress());

    // Presign Logo URL if exists
    String logoUrl = company.getLogoUrl();
    if (logoUrl != null && !logoUrl.isBlank()) {
      try {
        res.setLogoUrl(fileUploadService.generatePresignedUrl(logoUrl, 120));
      } catch (Exception e) {
        res.setLogoUrl(logoUrl);
      }
    }

    res.setDescription(company.getDescription());

    res.setCompanyEmail(company.getCompanyEmail());
    // Copy to plain ArrayList — entity returns Hibernate's PersistentBag which
    // is not safely (de)serializable by Jackson's default typing in Redis cache.
    res.setIndustries(
        company.getIndustries() == null ? null : new ArrayList<>(company.getIndustries()));
    res.setCompanySize(company.getCompanySize());
    res.setPhone(company.getPhone());
    res.setRepresentativeName(company.getRepresentativeName());
    res.setRepresentativeGender(company.getRepresentativeGender());
    res.setRepresentativePhone(company.getRepresentativePhone());

    res.setTaxCode(company.getTaxCode());

    res.setBusinessLicenseFileUrl(company.getBusinessLicenseFileUrl());
    res.setBusinessLicenseDocumentType(company.getBusinessLicenseDocumentType());

    // Presign Business License Preview if exists
    String licenseUrl = company.getBusinessLicenseFileUrl();
    if (licenseUrl != null && !licenseUrl.isBlank()) {
      try {
        res.setBusinessLicensePreviewUrl(fileUploadService.generatePresignedUrl(licenseUrl, 60));
      } catch (Exception e) {
        res.setBusinessLicensePreviewUrl(company.getBusinessLicensePreviewUrl());
      }
    }

    res.setConsentDocumentFileUrl(company.getConsentDocumentFileUrl());

    res.setVerificationLevel(company.getVerificationLevel());
    res.setCompanyReviewStatus(company.getCompanyReviewStatus());
    res.setDocumentReviewStatus(company.getDocumentReviewStatus());
    res.setLastUpdateRequestDate(company.getLastUpdateRequestDate());
    res.setLastUpdate(company.getLastUpdate());
    res.setStatusReason(company.getStatusReason());
    res.setActive(company.getActive());
    res.setProfileSetup(company.getProfileSetup());

    return res;
  }
}
