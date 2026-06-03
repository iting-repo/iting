package com.iting.jobportal.company.dto.request;

import com.iting.jobportal.company.entity.enums.Industry;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public class CompanyBasicInfoRequest {

  // ===== Thông tin bắt buộc theo UI =====

  @NotBlank(message = "Business name must not be blank")
  private String name; // Tên hộ kinh doanh / doanh nghiệp

  @Size(max = 1000, message = "Logo URL must be at most 1000 characters")
  private String logoUrl;

  @NotBlank(message = "Tax code cannot be empty")
  @Size(max = 100, message = "Tax code must be at most 100 characters")
  private String taxCode;

  // Website
  @Size(max = 255, message = "Website must be at most 255 characters")
  private String website;

  // Quy mô công ty
  @NotBlank(message = "Company size cannot be empty")
  @Size(max = 50, message = "Company size must be at most 50 characters")
  private String companySize;

  @NotBlank(message = "Company email cannot be empty")
  @Email(message = "Email is not valid")
  private String companyEmail;

  @NotEmpty(message = "Industry cannot be empty")
  private List<Industry> industries;

  @NotBlank(message = "Address cannot be empty")
  @Size(max = 500, message = "Address must be at most 500 characters")
  private String address;

  @NotBlank(message = "Phone number cannot be empty")
  @Size(max = 20, message = "Phone number must be at most 20 characters")
  private String phone;

  @Size(max = 2000, message = "Description must be at most 2000 characters")
  private String description;

  public CompanyBasicInfoRequest() {}

  // ===== GETTERS & SETTERS =====

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getLogoUrl() {
    return logoUrl;
  }

  public void setLogoUrl(String logoUrl) {
    this.logoUrl = logoUrl;
  }

  public String getTaxCode() {
    return taxCode;
  }

  public void setTaxCode(String taxCode) {
    this.taxCode = taxCode;
  }

  public String getWebsite() {
    return website;
  }

  public void setWebsite(String website) {
    this.website = website;
  }

  public String getCompanySize() {
    return companySize;
  }

  public void setCompanySize(String companySize) {
    this.companySize = companySize;
  }

  public String getCompanyEmail() {
    return companyEmail;
  }

  public void setCompanyEmail(String companyEmail) {
    this.companyEmail = companyEmail;
  }

  public List<Industry> getIndustries() {
    return industries;
  }

  public void setIndustries(List<Industry> industries) {
    this.industries = industries;
  }

  public String getAddress() {
    return address;
  }

  public void setAddress(String address) {
    this.address = address;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }
}
