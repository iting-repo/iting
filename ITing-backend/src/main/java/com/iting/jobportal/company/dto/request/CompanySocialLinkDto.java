package com.iting.jobportal.company.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanySocialLinkDto {

    /**
     * FACEBOOK | INSTAGRAM | YOUTUBE | TWITTER | LINKEDIN | TIKTOK | OTHER
     * Frontend tự gửi đúng giá trị này (uppercase).
     */
    @NotBlank(message = "Platform không được để trống")
    @Pattern(
            regexp = "^(FACEBOOK|INSTAGRAM|YOUTUBE|TWITTER|LINKEDIN|TIKTOK|OTHER)$",
            message = "Platform không hợp lệ"
    )
    private String platform;

    @NotBlank(message = "URL không được để trống")
    @Size(max = 500, message = "URL không được vượt quá 500 ký tự")
    @Pattern(
            regexp = "^(https?://).+",
            message = "URL phải bắt đầu bằng http:// hoặc https://"
    )
    private String url;
}
