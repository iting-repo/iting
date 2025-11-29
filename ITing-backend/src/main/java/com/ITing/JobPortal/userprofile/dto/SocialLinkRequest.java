package com.iting.jobportal.userprofile.dto;

import lombok.Data;

@Data
public class SocialLinkRequest {
    private String platform;
    private String url;
}
