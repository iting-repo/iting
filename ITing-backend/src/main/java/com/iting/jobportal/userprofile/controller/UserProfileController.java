package com.iting.jobportal.userprofile.controller;

import com.iting.jobportal.user.controller.CurrentUser;
import com.iting.jobportal.userprofile.dto.request.*;
import com.iting.jobportal.userprofile.entity.*;
import com.iting.jobportal.userprofile.service.UserProfileService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@Tag(name ="05. User Professional Profile")
@RestController
@RequestMapping("/api/user/professional-profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService profileService;

    private ResponseEntity<?> ok(String msg) {
        return ResponseEntity.ok(Map.of("message", msg));
    }

    @GetMapping
    public ResponseEntity<UserProfile> getProfile(@CurrentUser Long userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@CurrentUser Long userId, @Valid @RequestBody UserProfileUpdateDto dto) {
        profileService.updateProfile(userId, dto);
        return ok("Professional profile updated");
    }

    // Education
    @GetMapping("/education")
    public List<Education> getEducations(@CurrentUser Long userId) {
        return profileService.getEducations(userId);
    }

    @PostMapping("/education")
    public Education addEducation(@CurrentUser Long userId, @Valid @RequestBody EducationRequest req) {
        return profileService.addEducation(userId, req);
    }

    @PutMapping("/education/{id}")
    public ResponseEntity<?> updateEducation(@PathVariable Long id, @Valid @RequestBody EducationRequest req) {
        profileService.updateEducation(id, req);
        return ok("Education updated");
    }

    @DeleteMapping("/education/{id}")
    public ResponseEntity<?> deleteEducation(@PathVariable Long id) {
        profileService.deleteEducation(id);
        return ok("Education deleted");
    }

    // Skills
    @GetMapping("/skills")
    public List<Skill> getSkills(@CurrentUser Long userId) {
        return profileService.getSkills(userId);
    }

    @PostMapping("/skills")
    public Skill addSkill(@CurrentUser Long userId, @Valid @RequestBody SkillRequest req) {
        return profileService.addSkill(userId, req);
    }

    @PutMapping("/skills/{id}")
    public ResponseEntity<?> updateSkill(@PathVariable Long id, @Valid @RequestBody SkillRequest req) {
        profileService.updateSkill(id, req);
        return ok("Skill updated");
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<?> deleteSkill(@PathVariable Long id) {
        profileService.deleteSkill(id);
        return ok("Skill deleted");
    }

    // Certificate
    @GetMapping("/certificates")
    public List<Certificate> getCertificates(@CurrentUser Long userId) {
        return profileService.getCertificates(userId);
    }

    @PostMapping("/certificates")
    public Certificate addCertificate(@CurrentUser Long userId, @Valid @RequestBody CertificateRequest req) {
        return profileService.addCertificate(userId, req);
    }

    @PutMapping("/certificates/{id}")
    public ResponseEntity<?> updateCertificate(@PathVariable Long id, @Valid @RequestBody CertificateRequest req) {
        profileService.updateCertificate(id, req);
        return ok("Certificate updated");
    }

    @DeleteMapping("/certificates/{id}")
    public ResponseEntity<?> deleteCertificate(@PathVariable Long id) {
        profileService.deleteCertificate(id);
        return ok("Certificate deleted");
    }

    // Experience
    @GetMapping("/experience")
    public List<Experience> getExperiences(@CurrentUser Long userId) {
        return profileService.getExperiences(userId);
    }

    @PostMapping("/experience")
    public Experience addExperience(@CurrentUser Long userId, @Valid @RequestBody ExperienceRequest req) {
        return profileService.addExperience(userId, req);
    }

    @PutMapping("/experience/{id}")
    public ResponseEntity<?> updateExperience(@PathVariable Long id, @Valid @RequestBody ExperienceRequest req) {
        profileService.updateExperience(id, req);
        return ok("Experience updated");
    }

    @DeleteMapping("/experience/{id}")
    public ResponseEntity<?> deleteExperience(@PathVariable Long id) {
        profileService.deleteExperience(id);
        return ok("Experience deleted");
    }

    // Portfolio
    @GetMapping("/portfolios")
    public List<Portfolio> getPortfolios(@CurrentUser Long userId) {
        return profileService.getPortfolios(userId);
    }

    @PostMapping("/portfolio")
    public Portfolio addPortfolio(@CurrentUser Long userId, @Valid @RequestBody PortfolioRequest req) {
        return profileService.addPortfolio(userId, req);
    }

    @PutMapping("/portfolio/{id}")
    public ResponseEntity<?> updatePortfolio(@PathVariable Long id, @Valid @RequestBody PortfolioRequest req) {
        profileService.updatePortfolio(id, req);
        return ok("Portfolio updated");
    }

    @DeleteMapping("/portfolio/{id}")
    public ResponseEntity<?> deletePortfolio(@PathVariable Long id) {
        profileService.deletePortfolio(id);
        return ok("Portfolio item deleted");
    }

    // CV
    @GetMapping("/cv")
    public List<CV> getCVs(@CurrentUser Long userId) {
        return profileService.getCVs(userId);
    }

    @PostMapping("/cv")
    public CV addCV(@CurrentUser Long userId, @Valid @RequestBody CVRequest req) {
        return profileService.addCV(userId, req);
    }

    @PatchMapping("/cv/{id}/title")
    public ResponseEntity<?> updateCVTitle(@PathVariable Long id, @RequestBody Map<String, String> body) {
        profileService.updateCVTitle(id, body.get("title"));
        return ok("CV title updated");
    }

    @PatchMapping("/cv/{id}/default")
    public ResponseEntity<?> setDefaultCV(@CurrentUser Long userId, @PathVariable Long id) {
        profileService.setDefaultCV(userId, id);
        return ok("Set as default CV");
    }

    @DeleteMapping("/cv/{id}")
    public ResponseEntity<?> deleteCV(@PathVariable Long id) {
        profileService.deleteCV(id);
        return ok("CV deleted");
    }

    // Social Links
    @GetMapping("/social-links")
    public List<SocialLink> getSocialLinks(@CurrentUser Long userId) {
        return profileService.getSocialLinks(userId);
    }

    @PostMapping("/social-link")
    public SocialLink addSocialLink(@CurrentUser Long userId, @Valid @RequestBody SocialLinkRequest req) {
        return profileService.addSocialLink(userId, req);
    }

    @DeleteMapping("/social-link/{id}")
    public ResponseEntity<?> deleteSocialLink(@PathVariable Long id) {
        profileService.deleteSocialLink(id);
        return ok("Social link deleted");
    }
}
