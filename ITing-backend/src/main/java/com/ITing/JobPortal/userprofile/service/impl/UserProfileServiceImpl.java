package com.iting.jobportal.userprofile.service.impl;

import com.iting.jobportal.userprofile.dto.*;
import com.iting.jobportal.userprofile.entity.*;
import com.iting.jobportal.userprofile.repository.*;
import com.iting.jobportal.userprofile.service.UserProfileService;
import com.iting.jobportal.file.FileUploadService;  // <-- IMPORT ĐÚNG LOCAL UPLOAD

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final ContactInfoRepository contactInfoRepo;
    private final SocialLinkRepository socialRepo;
    private final EducationRepository educationRepo;
    private final SkillRepository skillRepo;
    private final CertificateRepository certificateRepo;
    private final ExperienceRepository experienceRepo;
    private final PortfolioRepository portfolioRepo;
    private final CVRepository cvRepo;

    // 🔥 Dùng local FileUploadService (KHÔNG CLOUDINARY)
    private final FileUploadService fileUploadService;

    /* ============================================================
                         CONTACT (Phone + Email)
       ============================================================ */

    @Override
    public void updateContact(Long userId, ContactInfoRequest req) {
        ContactInfo info = contactInfoRepo.findById(userId)
                .orElse(new ContactInfo(userId, null, null));

        info.setPhone(req.getPhone());
        info.setEmail(req.getEmail());

        contactInfoRepo.save(info);
    }

    /* ============================================================
                         SOCIAL LINKS
       ============================================================ */

    @Override
    public List<SocialLink> getSocialLinks(Long userId) {
        return socialRepo.findByUserId(userId);
    }

    @Override
    public SocialLink addSocialLink(Long userId, SocialLinkRequest req) {
        SocialLink link = new SocialLink();
        link.setUserId(userId);
        link.setPlatform(req.getPlatform());
        link.setUrl(req.getUrl());
        return socialRepo.save(link);
    }

    @Override
    public void updateSocialLink(Long id, SocialLinkRequest req) {
        SocialLink link = socialRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Social link not found"));

        link.setPlatform(req.getPlatform());
        link.setUrl(req.getUrl());
        socialRepo.save(link);
    }

    @Override
    public void deleteSocialLink(Long id) {
        if (!socialRepo.existsById(id)) {
            throw new RuntimeException("Social link not found");
        }
        socialRepo.deleteById(id);
    }

    /* ============================================================
                         EDUCATION
       ============================================================ */

    @Override
    public List<Education> getEducations(Long userId) {
        return educationRepo.findByUserId(userId);
    }

    @Override
    public Education addEducation(Long userId, EducationRequest req) {
        Education edu = new Education();
        edu.setUserId(userId);
        edu.setSchool(req.getSchool());
        edu.setDegree(req.getDegree());
        edu.setStartDate(req.getStartDate());
        edu.setEndDate(req.getEndDate());
        edu.setDescription(req.getDescription());
        return educationRepo.save(edu);
    }

    @Override
    public void updateEducation(Long id, EducationRequest req) {
        Education edu = educationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Education record not found"));

        edu.setSchool(req.getSchool());
        edu.setDegree(req.getDegree());
        edu.setStartDate(req.getStartDate());
        edu.setEndDate(req.getEndDate());
        edu.setDescription(req.getDescription());

        educationRepo.save(edu);
    }

    @Override
    public void deleteEducation(Long id) {
        if (!educationRepo.existsById(id)) {
            throw new RuntimeException("Education record not found");
        }
        educationRepo.deleteById(id);
    }

    /* ============================================================
                         SKILLS
       ============================================================ */

    @Override
    public List<Skill> getSkills(Long userId) {
        return skillRepo.findByUserId(userId);
    }

    @Override
    public Skill addSkill(Long userId, SkillRequest req) {
        Skill skill = new Skill();
        skill.setUserId(userId);
        skill.setSkill(req.getSkill());
        skill.setLevel(req.getLevel());
        return skillRepo.save(skill);
    }

    @Override
    public void updateSkill(Long id, SkillRequest req) {
        Skill skill = skillRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        skill.setSkill(req.getSkill());
        skill.setLevel(req.getLevel());
        skillRepo.save(skill);
    }

    @Override
    public void deleteSkill(Long id) {
        if (!skillRepo.existsById(id)) {
            throw new RuntimeException("Skill not found");
        }
        skillRepo.deleteById(id);
    }

    /* ============================================================
                         CERTIFICATE
       ============================================================ */

    @Override
    public Certificate addCertificate(Long userId, CertificateRequest req) {
        Certificate c = new Certificate();
        c.setUserId(userId);
        c.setName(req.getName());
        c.setOrganization(req.getOrganization());
        c.setDate(req.getDate());
        return certificateRepo.save(c);
    }

    @Override
    public void updateCertificate(Long id, CertificateRequest req) {
        Certificate c = certificateRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));

        c.setName(req.getName());
        c.setOrganization(req.getOrganization());
        c.setDate(req.getDate());
        certificateRepo.save(c);
    }

    @Override
    public void deleteCertificate(Long id) {
        if (!certificateRepo.existsById(id)) {
            throw new RuntimeException("Certificate not found");
        }
        certificateRepo.deleteById(id);
    }

    /* ============================================================
                         EXPERIENCE
       ============================================================ */

    @Override
    public Experience addExperience(Long userId, ExperienceRequest req) {
        Experience exp = new Experience();
        exp.setUserId(userId);
        exp.setCompany(req.getCompany());
        exp.setRole(req.getRole());
        exp.setStartDate(req.getStartDate());
        exp.setEndDate(req.getEndDate());
        exp.setDescription(req.getDescription());
        return experienceRepo.save(exp);
    }

    @Override
    public void updateExperience(Long id, ExperienceRequest req) {
        Experience exp = experienceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Experience not found"));

        exp.setCompany(req.getCompany());
        exp.setRole(req.getRole());
        exp.setStartDate(req.getStartDate());
        exp.setEndDate(req.getEndDate());
        exp.setDescription(req.getDescription());

        experienceRepo.save(exp);
    }

    @Override
    public void deleteExperience(Long id) {
        if (!experienceRepo.existsById(id)) {
            throw new RuntimeException("Experience not found");
        }
        experienceRepo.deleteById(id);
    }

    /* ============================================================
                         PORTFOLIO (Link + File)
       ============================================================ */

    @Override
    public List<Portfolio> getPortfolio(Long userId) {
        return portfolioRepo.findByUserId(userId);
    }

    @Override
    public Portfolio addPortfolioLink(Long userId, PortfolioLinkRequest req) {
        Portfolio p = new Portfolio();
        p.setUserId(userId);
        p.setType("LINK");
        p.setUrl(req.getUrl());
        p.setDescription(req.getDescription());
        return portfolioRepo.save(p);
    }

    @Override
    public Portfolio uploadPortfolioFile(Long userId, MultipartFile file) {
        if (file.isEmpty()) throw new RuntimeException("File cannot be empty");

        String url = fileUploadService.uploadPortfolio(file);

        Portfolio p = new Portfolio();
        p.setUserId(userId);
        p.setType("FILE");
        p.setUrl(url);
        p.setDescription("Uploaded file");
        return portfolioRepo.save(p);
    }

    @Override
    public void deletePortfolio(Long id) {
        if (!portfolioRepo.existsById(id)) {
            throw new RuntimeException("Portfolio not found");
        }
        portfolioRepo.deleteById(id);
    }

    /* ============================================================
                                CV
       ============================================================ */

    @Override
    public List<CV> getCVs(Long userId) {
        return cvRepo.findByUserId(userId);
    }

    @Override
    public CV uploadCV(Long userId, MultipartFile file) {
        if (file.isEmpty()) throw new RuntimeException("CV file is empty");

        String url = fileUploadService.uploadCV(file);

        CV cv = new CV();
        cv.setUserId(userId);
        cv.setFileUrl(url);
        cv.setUploadedAt(LocalDate.now());
        return cvRepo.save(cv);
    }

    @Override
    public CV replaceCV(Long cvId, MultipartFile file) {
        CV cv = cvRepo.findById(cvId)
                .orElseThrow(() -> new RuntimeException("CV not found"));

        if (file.isEmpty()) throw new RuntimeException("File is empty");

        String newUrl = fileUploadService.uploadCV(file);

        cv.setFileUrl(newUrl);
        cv.setUploadedAt(LocalDate.now());
        return cvRepo.save(cv);
    }

    @Override
    public void deleteCV(Long cvId) {
        if (!cvRepo.existsById(cvId)) {
            throw new RuntimeException("CV not found");
        }
        cvRepo.deleteById(cvId);
    }

    /* ============================================================
                              AI ANALYZE
       ============================================================ */

    @Override
    public void analyzeCV(Long cvId) {
        CV cv = cvRepo.findById(cvId)
                .orElseThrow(() -> new RuntimeException("CV not found"));

        System.out.println("AI analyzing CV at: " + cv.getFileUrl());
    }

    /* ============================================================
                           CAREER OBJECTIVE
       ============================================================ */

    @Override
    public void updateCareerObjective(Long userId, CareerObjectiveRequest req) {
        throw new UnsupportedOperationException(
                "Career Objective chưa có entity riêng. Hãy tạo bảng user_career_objective"
        );
    }
}
