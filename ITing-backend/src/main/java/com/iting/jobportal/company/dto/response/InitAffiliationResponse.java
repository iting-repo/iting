package com.iting.jobportal.company.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InitAffiliationResponse {
    private Long companyId;
    private Long affiliationId;
    /** true nếu đây là HR đầu tiên submit cho Company này (taxCode chưa tồn tại); false nếu join Company existing. */
    private boolean isFirstHr;
    /** Tên Company hiện đang có (Company existing) — null nếu Company mới được tạo trống. */
    private String companyName;
}
