package com.iting.jobportal.admin.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String module;
    private String action;
    private Boolean active;
}

