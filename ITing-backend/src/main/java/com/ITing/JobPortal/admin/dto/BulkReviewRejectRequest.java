package com.iting.jobportal.admin.dto;

import lombok.Data;
import java.util.List;

@Data
public class BulkReviewRejectRequest {
    private List<Long> ids;
    private String reason;
}
