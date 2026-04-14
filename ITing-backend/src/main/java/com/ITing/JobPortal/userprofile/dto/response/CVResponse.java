package com.iting.jobportal.userprofile.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CVResponse {
    private Long id;
    private String title;
    private String fileName;
    private String fileUrl;
    private LocalDateTime uploadedAt;
}
