package com.iting.jobportal.userprofile.dto.request;

import lombok.Data;

@Data
public class SocialLinksBulkRequest {
    private String linkedin;
    private String github;
    private String portfolio;
    private String twitter;
}
