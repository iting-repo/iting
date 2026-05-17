package com.iting.jobportal.admin.dto;

import lombok.*;

/**
 * DTO cho request tạo/cập nhật biến môi trường.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnvConfigRequest {
    private String envKey;
    private String envValue;
    private String envGroup;
    private String description;
    private Boolean sensitive;
    private String valueType;
}
