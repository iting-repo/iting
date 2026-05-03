package com.iting.jobportal.company.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Body cho POST /api/admin/affiliations/{id}/apply-to-company.
 * Admin nhập email HR đã xác minh qua điện thoại + ghi chú để giữ audit trail.
 */
@Data
public class ApplyAffiliationToCompanyRequest {

    @NotBlank(message = "Email HR đã verify qua điện thoại không được để trống")
    private String verifiedHrEmail;

    private String contactNote;
}
