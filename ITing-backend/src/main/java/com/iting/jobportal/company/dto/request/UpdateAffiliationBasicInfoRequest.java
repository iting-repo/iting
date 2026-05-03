package com.iting.jobportal.company.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/**
 * Cập nhật snapshot fields ở affiliation của HR đang login.
 * KHÔNG ghi vào Company entity — Company chỉ thay đổi qua admin (auto-apply lần đầu
 * hoặc /apply-to-company sau hotline call).
 */
@Data
public class UpdateAffiliationBasicInfoRequest {

    @Size(max = 255)
    private String name;

    private String logoUrl;       // URL — set sau khi upload qua /logo/upload

    private String description;

    private String website;

    @Size(max = 500)
    private String address;

    private List<String> industries;

    @Size(max = 50)
    private String companySize;

    @Size(max = 20)
    private String phone;

    @Size(max = 255)
    private String companyEmail;
}
