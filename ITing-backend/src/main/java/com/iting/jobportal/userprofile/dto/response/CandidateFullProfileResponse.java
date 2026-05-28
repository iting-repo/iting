package com.iting.jobportal.userprofile.dto.response;

import com.iting.jobportal.userprofile.entity.*;
import java.util.List;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CandidateFullProfileResponse {
  private UserProfile profile;
  private List<Education> educations;
  private List<Experience> experiences;
  private List<Skill> skills;
  private List<Certificate> certificates;
  private List<SocialLink> socialLinks;
  private List<Portfolio> portfolios;
}
