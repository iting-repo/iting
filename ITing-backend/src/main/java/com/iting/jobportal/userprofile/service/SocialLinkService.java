package com.iting.jobportal.userprofile.service;

import com.iting.jobportal.userprofile.dto.request.SocialLinksBulkRequest;
import com.iting.jobportal.userprofile.dto.response.SocialLinkResponse;

public interface SocialLinkService {
  SocialLinkResponse getSocialLinks(String userId);

  void saveSocialLinks(String userId, SocialLinksBulkRequest req);
}
