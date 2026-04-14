package com.iting.jobportal.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateKybNoteRequest {

    @NotBlank(message = "Nội dung ghi chú không được để trống")
    private String content;

}
