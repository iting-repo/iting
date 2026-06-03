package com.iting.jobportal.userprofile.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private Boolean isDefault;
    private Integer overallScore;   // NULL = not yet scored
    private LocalDateTime scoredAt;
}
