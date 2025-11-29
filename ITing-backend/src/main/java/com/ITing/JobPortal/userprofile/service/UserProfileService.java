package com.iting.jobportal.userprofile.service;

import com.iting.jobportal.userprofile.dto.*;
import com.iting.jobportal.userprofile.entity.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserProfileService {

    // Contact
    void updateContact(Long userId, ContactInfoRequest req);

    // Social Links
    List<SocialLink> getSocialLinks(Long userId);
    SocialLink addSocialLink(Long userId, SocialLinkRequest req);
    void updateSocialLink(Long id, SocialLinkRequest req);
    void deleteSocialLink(Long id);

    // Education
    List<Education> getEducations(Long userId);
    Education addEducation(Long userId, EducationRequest req);
    void updateEducation(Long id, EducationRequest req);
    void deleteEducation(Long id);

    // Skills
    List<Skill> getSkills(Long userId);
    Skill addSkill(Long userId, SkillRequest req);
    void updateSkill(Long id, SkillRequest req);
    void deleteSkill(Long id);

    // Certificate
    Certificate addCertificate(Long userId, CertificateRequest req);
    void updateCertificate(Long id, CertificateRequest req);
    void deleteCertificate(Long id);

    // Experience
    Experience addExperience(Long userId, ExperienceRequest req);
    void updateExperience(Long id, ExperienceRequest req);
    void deleteExperience(Long id);

    // Portfolio
    List<Portfolio> getPortfolio(Long userId);
    Portfolio addPortfolioLink(Long userId, PortfolioLinkRequest req);
    Portfolio uploadPortfolioFile(Long userId, MultipartFile file);
    void deletePortfolio(Long id);

    // CV
    List<CV> getCVs(Long userId);
    CV uploadCV(Long userId, MultipartFile file);
    CV replaceCV(Long cvId, MultipartFile file);
    void deleteCV(Long cvId);
    void analyzeCV(Long cvId);

    // Career Objective
    void updateCareerObjective(Long userId, CareerObjectiveRequest req);
}
