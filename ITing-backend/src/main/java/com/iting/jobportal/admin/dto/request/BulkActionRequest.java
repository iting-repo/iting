package com.iting.jobportal.admin.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class BulkActionRequest {
    private List<Long> ids;
}
