package com.iting.jobportal.userprofile.dto.request;

import lombok.Data;

@Data
public class SocialLinkRequest {
    private String platform;
    private String url;
}
