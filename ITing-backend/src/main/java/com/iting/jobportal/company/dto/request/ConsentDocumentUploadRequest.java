package com.iting.jobportal.company.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ConsentDocumentUploadRequest {

    @NotNull(message = "Vui lòng chọn file văn bản thỏa thuận")
    @Schema(description = "File văn bản thỏa thuận dữ liệu cá nhân", type = "string", format = "binary")
    private MultipartFile file;

    @NotNull(message = "Vui lòng xác nhận cam kết")
    private Boolean confirmed;

    private String version;
}