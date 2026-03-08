package com.iting.jobportal.company.dto;

import jakarta.validation.constraints.Size;

public class CompanyRepresentativeRequest {

    @Size(max = 255, message = "Representative name must be at most 255 characters")
    private String representativeName;

    @Size(max = 20, message = "Gender must be at most 20 characters")
    private String representativeGender;

    @Size(max = 20, message = "Phone number must be at most 20 characters")
    private String representativePhone;

    @Size(max = 255, message = "Email must be at most 255 characters")
    private String accountEmail;

    public CompanyRepresentativeRequest() {
    }

    public String getRepresentativeName() {
        return representativeName;
    }

    public void setRepresentativeName(String representativeName) {
        this.representativeName = representativeName;
    }

    public String getRepresentativeGender() {
        return representativeGender;
    }

    public void setRepresentativeGender(String representativeGender) {
        this.representativeGender = representativeGender;
    }

    public String getRepresentativePhone() {
        return representativePhone;
    }

    public void setRepresentativePhone(String representativePhone) {
        this.representativePhone = representativePhone;
    }

    public String getAccountEmail() {
        return accountEmail;
    }

    public void setAccountEmail(String accountEmail) {
        this.accountEmail = accountEmail;
    }
}
