package com.iting.jobportal.job.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewJobRequest {
    @NotBlank(message = "Lý do không được để trống")
    private String reason;
}