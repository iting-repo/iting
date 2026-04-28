package com.iting.jobportal.admin.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CategoryReorderRequest {

    @NotEmpty(message = "Danh sách ID không được rỗng")
    private List<Long> orderedIds;
}
