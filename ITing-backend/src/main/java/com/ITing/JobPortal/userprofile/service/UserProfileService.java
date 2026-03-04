package com.iting.jobportal.userprofile.service;

import com.iting.jobportal.userprofile.dto.*;
import com.iting.jobportal.userprofile.entity.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserProfileService {

    // Contact
    void updateContact(String userId, ContactInfoRequest req);

    // Social Links
    List<SocialLink> getSocialLinks(String userId);
    SocialLink addSocialLink(String userId, SocialLinkRequest req);
    void updateSocialLink(Long id, SocialLinkRequest req);
    void deleteSocialLink(Long id);

    // Education
    List<Education> getEducations(String userId);
    Education addEducation(String userId, EducationRequest req);
    void updateEducation(Long id, EducationRequest req);
    void deleteEducation(Long id);

    // Skills
    List<Skill> getSkills(String userId);
    Skill addSkill(String userId, SkillRequest req);
    void updateSkill(Long id, SkillRequest req);
    void deleteSkill(Long id);

    // Certificate
    Certificate addCertificate(String userId, CertificateRequest req);
    void updateCertificate(Long id, CertificateRequest req);
    void deleteCertificate(Long id);

    // Experience
    Experience addExperience(String userId, ExperienceRequest req);
    void updateExperience(Long id, ExperienceRequest req);
    void deleteExperience(Long id);

    // Portfolio
    List<Portfolio> getPortfolio(String userId);
    Portfolio addPortfolioLink(String userId, PortfolioLinkRequest req);
    Portfolio uploadPortfolioFile(String userId, MultipartFile file);
    void deletePortfolio(Long id);

    // CV
    List<CV> getCVs(String userId);
    CV uploadCV(String userId, MultipartFile file);
    CV replaceCV(Long cvId, MultipartFile file);
    void deleteCV(Long cvId);
    void analyzeCV(Long cvId);

    // Career Objective
    void updateCareerObjective(String userId, CareerObjectiveRequest req);
}
