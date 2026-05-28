package com.iting.jobportal.company.dto.response;

import com.iting.jobportal.company.entity.enums.BusinessDocumentType;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.DocumentReviewStatus;
import com.iting.jobportal.company.entity.enums.Industry;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyResponse {

  private Long id;
  private String name;
  private String logoUrl;
  private String address;
  private String description;
  private String website;
  private String companyEmail;
  private List<Industry> industries;
  private String companySize;
  private String phone;
  private String representativeName;
  private String representativeGender;
  private String representativePhone;

  private Integer foundedYear;

  private String taxCode;
  private String businessLicenseFileUrl;
  private BusinessDocumentType businessLicenseDocumentType;
  private String businessLicensePreviewUrl;
  private String consentDocumentFileUrl;

  private VerificationLevel verificationLevel;
  private CompanyReviewStatus companyReviewStatus;
  private DocumentReviewStatus documentReviewStatus;
  private LocalDateTime lastUpdateRequestDate;

  private LocalDateTime lastUpdate;
  private Long followerCount;
  private Integer activeJobCount;
  private Double averageRating;
  private Long reviewCount;
  private String statusReason;
  private Boolean active;
  private Boolean profileSetup;

  public static CompanyResponse fromEntity(com.iting.jobportal.company.entity.Company company) {
    return new CompanyResponse(
        company.getId(),
        company.getName(),
        company.getLogoUrl(),
        company.getAddress(),
        company.getDescription(),
        company.getWebsite(),
        company.getCompanyEmail(),
        company.getIndustries(),
        company.getCompanySize(),
        company.getPhone(),
        company.getRepresentativeName(),
        company.getRepresentativeGender(),
        company.getRepresentativePhone(),
        company.getFoundedYear(),
        company.getTaxCode(),
        company.getBusinessLicenseFileUrl(),
        company.getBusinessLicenseDocumentType(),
        company.getBusinessLicensePreviewUrl(),
        company.getConsentDocumentFileUrl(),
        company.getVerificationLevel(),
        company.getCompanyReviewStatus(),
        company.getDocumentReviewStatus(),
        company.getLastUpdateRequestDate(),
        company.getLastUpdate(),
        company.getFollowerCount(),
        0, // activeJobCount - set later
        null, // averageRating - set later
        0L, // reviewCount - set later
        company.getStatusReason(),
        company.getActive(),
        company.getProfileSetup());
  }
}
