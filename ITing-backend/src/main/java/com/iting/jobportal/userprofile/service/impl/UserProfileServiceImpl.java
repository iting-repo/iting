package com.iting.jobportal.userprofile.service.impl;

import com.iting.jobportal.auth.exception.ResourceNotFoundException;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.userprofile.dto.request.*;
import com.iting.jobportal.userprofile.entity.*;
import com.iting.jobportal.userprofile.entity.enums.*;
import com.iting.jobportal.userprofile.repository.*;

import com.iting.jobportal.userprofile.service.UserProfileService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository userProfileRepo;
    private final UserRepository userRepository;
    private final EducationRepository educationRepo;
    private final SkillRepository skillRepo;
    private final CertificateRepository certificateRepo;
    private final ExperienceRepository experienceRepo;
    private final PortfolioRepository portfolioRepo;
    private final CVRepository cvRepo;
    private final SocialLinkRepository socialRepo;

    private UserProfile getProfileOrThrow(Long userId) {
        return userProfileRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile not found with id: " + userId));
    }

    private UserProfile getOrCreateProfile(Long userId) {
        return userProfileRepo.findById(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                    UserProfile profile = new UserProfile();
                    profile.setId(userId);
                    profile.setUser(user);
                    return userProfileRepo.save(profile);
                });
    }

    @Override
    public UserProfile getProfile(Long userId) {
        return getProfileOrThrow(userId);
    }

    @Override
    public void updateProfile(Long userId, UserProfileUpdateDto dto) {
        UserProfile profile = getOrCreateProfile(userId);
        profile.setHeadline(dto.getHeadline());
        profile.setLocation(dto.getLocation());
        profile.setTotalExperienceYears(dto.getTotalExperienceYears());
        profile.setEducationSummary(dto.getEducationSummary());
        profile.setShortBio(dto.getShortBio());
        profile.setEmploymentStatus(dto.getEmploymentStatus());
        profile.setOpenToWork(dto.getOpenToWork());
        profile.setUpdatedAt(LocalDateTime.now());
        userProfileRepo.save(profile);
    }

    // Education
    @Override
    public List<Education> getEducations(Long profileId) {
        return educationRepo.findByProfileId(profileId);
    }

    @Override
    public Education addEducation(Long profileId, EducationRequest req) {
        UserProfile profile = getOrCreateProfile(profileId);
        Education edu = new Education();
        edu.setProfile(profile);
        edu.setSchoolName(req.getSchoolName());
        edu.setMajor(req.getMajor());
        edu.setAreaOfStudy(req.getAreaOfStudy());
        edu.setDegree(req.getDegree());
        edu.setStartDate(req.getStartDate());
        edu.setEndDate(req.getEndDate());
        edu.setDescription(req.getDescription());
        return educationRepo.save(edu);
    }

    @Override
    public void updateEducation(Long id, EducationRequest req) {
        Education edu = educationRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Education not found"));
        edu.setSchoolName(req.getSchoolName());
        edu.setMajor(req.getMajor());
        edu.setAreaOfStudy(req.getAreaOfStudy());
        edu.setDegree(req.getDegree());
        edu.setStartDate(req.getStartDate());
        edu.setEndDate(req.getEndDate());
        edu.setDescription(req.getDescription());
        educationRepo.save(edu);
    }

    @Override
    public void deleteEducation(Long id) {
        educationRepo.deleteById(id);
    }

    // Skills
    @Override
    public List<Skill> getSkills(Long profileId) {
        return skillRepo.findByProfileId(profileId);
    }

    @Override
    public Skill addSkill(Long profileId, SkillRequest req) {
        UserProfile profile = getOrCreateProfile(profileId);
        Skill skill = new Skill();
        skill.setProfile(profile);
        skill.setName(req.getName());
        skill.setLevel(req.getLevel());
        return skillRepo.save(skill);
    }

    @Override
    public void updateSkill(Long id, SkillRequest req) {
        Skill skill = skillRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
        skill.setName(req.getName());
        skill.setLevel(req.getLevel());
        skillRepo.save(skill);
    }

    @Override
    public void deleteSkill(Long id) {
        skillRepo.deleteById(id);
    }

    // Certificate
    @Override
    public List<Certificate> getCertificates(Long profileId) {
        return certificateRepo.findByProfileId(profileId);
    }

    @Override
    public Certificate addCertificate(Long profileId, CertificateRequest req) {
        UserProfile profile = getOrCreateProfile(profileId);
        Certificate c = new Certificate();
        c.setProfile(profile);
        c.setTitle(req.getTitle());
        c.setIssuingOrganization(req.getIssuingOrganization());
        c.setIssueDate(req.getIssueDate());
        c.setExpirationDate(req.getExpirationDate());
        c.setCredentialId(req.getCredentialId());
        c.setCredentialUrl(req.getCredentialUrl());
        c.setDoesNotExpire(req.getDoesNotExpire());
        return certificateRepo.save(c);
    }

    @Override
    public void updateCertificate(Long id, CertificateRequest req) {
        Certificate c = certificateRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
        c.setTitle(req.getTitle());
        c.setIssuingOrganization(req.getIssuingOrganization());
        c.setIssueDate(req.getIssueDate());
        c.setExpirationDate(req.getExpirationDate());
        c.setCredentialId(req.getCredentialId());
        c.setCredentialUrl(req.getCredentialUrl());
        c.setDoesNotExpire(req.getDoesNotExpire());
        certificateRepo.save(c);
    }

    @Override
    public void deleteCertificate(Long id) {
        certificateRepo.deleteById(id);
    }

    // Experience
    @Override
    public List<Experience> getExperiences(Long profileId) {
        return experienceRepo.findByProfileId(profileId);
    }

    @Override
    public Experience addExperience(Long profileId, ExperienceRequest req) {
        UserProfile profile = getOrCreateProfile(profileId);
        Experience exp = new Experience();
        exp.setProfile(profile);
        exp.setCompanyName(req.getCompanyName());
        exp.setPosition(req.getPosition());
        exp.setStartDate(req.getStartDate());
        exp.setEndDate(req.getEndDate());
        exp.setIsCurrent(req.getIsCurrent());
        exp.setDescription(req.getDescription());
        return experienceRepo.save(exp);
    }

    @Override
    public void updateExperience(Long id, ExperienceRequest req) {
        Experience exp = experienceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found"));
        exp.setCompanyName(req.getCompanyName());
        exp.setPosition(req.getPosition());
        exp.setStartDate(req.getStartDate());
        exp.setEndDate(req.getEndDate());
        exp.setIsCurrent(req.getIsCurrent());
        exp.setDescription(req.getDescription());
        experienceRepo.save(exp);
    }

    @Override
    public void deleteExperience(Long id) {
        experienceRepo.deleteById(id);
    }

    // Portfolio
    @Override
    public List<Portfolio> getPortfolios(Long profileId) {
        return portfolioRepo.findByProfileId(profileId);
    }

    @Override
    public Portfolio addPortfolio(Long profileId, PortfolioRequest req) {
        UserProfile profile = getOrCreateProfile(profileId);
        Portfolio p = new Portfolio();
        p.setProfile(profile);
        p.setTitle(req.getTitle());
        p.setUrl(req.getUrl());
        p.setDescription(req.getDescription());
        return portfolioRepo.save(p);
    }

    @Override
    public void updatePortfolio(Long id, PortfolioRequest req) {
        Portfolio p = portfolioRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));
        p.setTitle(req.getTitle());
        p.setUrl(req.getUrl());
        p.setDescription(req.getDescription());
        portfolioRepo.save(p);
    }

    @Override
    public void deletePortfolio(Long id) {
        portfolioRepo.deleteById(id);
    }

    // CV
    @Override
    public List<CV> getCVs(Long profileId) {
        return cvRepo.findByProfileId(profileId);
    }

    @Override
    public CV addCV(Long profileId, CVRequest req) {
        UserProfile profile = getOrCreateProfile(profileId);
        if (Boolean.TRUE.equals(req.getIsDefault())) {
            resetDefaultCV(profileId);
        }
        CV cv = new CV();
        cv.setProfile(profile);
        cv.setTitle(req.getTitle());
        cv.setFileUrl(req.getFileUrl());
        cv.setIsDefault(req.getIsDefault());
        cv.setUploadedAt(LocalDateTime.now());
        return cvRepo.save(cv);
    }

    @Override
    public void updateCVTitle(Long cvId, String title) {
        CV cv = cvRepo.findById(cvId)
                .orElseThrow(() -> new ResourceNotFoundException("CV not found"));
        cv.setTitle(title);
        cvRepo.save(cv);
    }

    @Override
    public void setDefaultCV(Long profileId, Long cvId) {
        resetDefaultCV(profileId);
        CV cv = cvRepo.findById(cvId)
                .orElseThrow(() -> new ResourceNotFoundException("CV not found"));
        cv.setIsDefault(true);
        cvRepo.save(cv);
    }

    private void resetDefaultCV(Long profileId) {
        List<CV> cvs = cvRepo.findByProfileId(profileId);
        for (CV cv : cvs) {
            if (Boolean.TRUE.equals(cv.getIsDefault())) {
                cv.setIsDefault(false);
                cvRepo.save(cv);
            }
        }
    }

    @Override
    public void deleteCV(Long cvId) {
        cvRepo.deleteById(cvId);
    }

    // Social Links
    @Override
    public List<SocialLink> getSocialLinks(Long profileId) {
        return socialRepo.findByProfileId(profileId);
    }

    @Override
    public SocialLink addSocialLink(Long profileId, SocialLinkRequest req) {
        UserProfile profile = getOrCreateProfile(profileId);
        SocialLink link = new SocialLink();
        link.setProfile(profile);
        link.setPlatform(req.getPlatform());
        link.setUrl(req.getUrl());
        return socialRepo.save(link);
    }

    @Override
    public void deleteSocialLink(Long id) {
        socialRepo.deleteById(id);
    }
}
