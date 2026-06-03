package com.iting.jobportal.userprofile.service;

import com.iting.jobportal.userprofile.dto.request.*;
import com.iting.jobportal.userprofile.entity.*;
import java.util.List;

public interface UserProfileService {

  UserProfile getProfile(Long userId);

  void updateProfile(Long userId, UserProfileUpdateDto dto);

  void updateOpenToWork(Long userId, boolean status);

  // Education
  List<Education> getEducations(Long profileId);

  Education addEducation(Long profileId, EducationRequest req);

  void updateEducation(Long id, EducationRequest req);

  void deleteEducation(Long id);

  // Skills
  List<Skill> getSkills(Long profileId);

  Skill addSkill(Long profileId, SkillRequest req);

  void updateSkill(Long id, SkillRequest req);

  void deleteSkill(Long id);

  // Certificate
  List<Certificate> getCertificates(Long profileId);

  Certificate addCertificate(Long profileId, CertificateRequest req);

  void updateCertificate(Long id, CertificateRequest req);

  void deleteCertificate(Long id);

  // Experience
  List<Experience> getExperiences(Long profileId);

  Experience addExperience(Long profileId, ExperienceRequest req);

  void updateExperience(Long id, ExperienceRequest req);

  void deleteExperience(Long id);

  // Portfolio
  List<Portfolio> getPortfolios(Long profileId);

  Portfolio addPortfolio(Long profileId, PortfolioRequest req);

  void updatePortfolio(Long id, PortfolioRequest req);

  void deletePortfolio(Long id);

  // CV
  List<CV> getCVs(Long profileId);

  CV addCV(Long profileId, CVRequest req);

  void updateCVTitle(Long cvId, String title);

  void setDefaultCV(Long profileId, Long cvId);

  void deleteCV(Long cvId);

  // Social Links
  List<SocialLink> getSocialLinks(Long profileId);

  SocialLink addSocialLink(Long profileId, SocialLinkRequest req);

  void deleteSocialLink(Long id);
}
