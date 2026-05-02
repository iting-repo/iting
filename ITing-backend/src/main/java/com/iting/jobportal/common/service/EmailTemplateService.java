package com.iting.jobportal.common.service;

public interface EmailTemplateService {
    String getOtpTemplate(String name, String otp, String purpose);

    String getApplicationAcceptedTemplate(String candidateName, String jobTitle, String companyName, String actionUrl);

    String getApplicationRejectedTemplate(String candidateName, String jobTitle, String companyName, String reason);
}
