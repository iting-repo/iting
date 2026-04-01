package com.iting.jobportal.admin.dto;

import lombok.Data;
import java.util.List;

@Data
public class BulkActionRequest {
    private List<Long> ids;
}
