package com.iting.jobportal.company.dto;

import jakarta.validation.constraints.NotBlank;

public class VerifyPhoneRequest {

    @NotBlank(message = "Phone number cannot be empty")
    private String phone;

    @NotBlank(message = "OTP code cannot be empty")
    private String otpCode;

    public VerifyPhoneRequest() {
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getOtpCode() {
        return otpCode;
    }

    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
    }
}
