package com.iting.jobportal.userprofile.controller;

import com.iting.jobportal.userprofile.dto.*;
import com.iting.jobportal.userprofile.entity.*;
import com.iting.jobportal.userprofile.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService profileService;

    // TODO: Replace with JWT extraction
    private Long getUserId() {
        return 5L;
    }

    private ResponseEntity<?> ok(String msg) {
        return ResponseEntity.ok(Map.of("message", msg));
    }

    // ==========================================================
    // CONTACT INFO
    // ==========================================================
    @PutMapping("/contact")
    public ResponseEntity<?> updateContact(@RequestBody ContactInfoRequest req) {
        profileService.updateContact(getUserId(), req);
        return ok("Contact updated");
    }

    // ==========================================================
    // SOCIAL LINKS
    // ==========================================================
    @GetMapping("/social")
    public List<SocialLink> getSocialLinks() {
        return profileService.getSocialLinks(getUserId());
    }

    @PostMapping("/social")
    public SocialLink addSocial(@RequestBody SocialLinkRequest req) {
        return profileService.addSocialLink(getUserId(), req);
    }

    @PutMapping("/social/{id}")
    public ResponseEntity<?> updateSocial(@PathVariable Long id, @RequestBody SocialLinkRequest req) {
        profileService.updateSocialLink(id, req);
        return ok("Social link updated");
    }

    @DeleteMapping("/social/{id}")
    public ResponseEntity<?> deleteSocial(@PathVariable Long id) {
        profileService.deleteSocialLink(id);
        return ok("Social link deleted");
    }

    // ==========================================================
    // EDUCATION
    // ==========================================================
    @GetMapping("/educations")
    public List<Education> getEducations() {
        return profileService.getEducations(getUserId());
    }

    @PostMapping("/education")
    public Education addEducation(@RequestBody EducationRequest req) {
        return profileService.addEducation(getUserId(), req);
    }

    @PutMapping("/education/{id}")
    public ResponseEntity<?> updateEducation(@PathVariable Long id, @RequestBody EducationRequest req) {
        profileService.updateEducation(id, req);
        return ok("Education updated");
    }

    @DeleteMapping("/education/{id}")
    public ResponseEntity<?> deleteEducation(@PathVariable Long id) {
        profileService.deleteEducation(id);
        return ok("Education deleted");
    }

    // ==========================================================
    // SKILLS
    // ==========================================================
    @GetMapping("/skills")
    public List<Skill> getSkills() {
        return profileService.getSkills(getUserId());
    }

    @PostMapping("/skills")
    public Skill addSkill(@RequestBody SkillRequest req) {
        return profileService.addSkill(getUserId(), req);
    }

    @PutMapping("/skills/{id}")
    public ResponseEntity<?> updateSkill(@PathVariable Long id, @RequestBody SkillRequest req) {
        profileService.updateSkill(id, req);
        return ok("Skill updated");
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<?> deleteSkill(@PathVariable Long id) {
        profileService.deleteSkill(id);
        return ok("Skill deleted");
    }

    // ==========================================================
    // CERTIFICATES
    // ==========================================================
    @PostMapping("/certificates")
    public Certificate addCertificate(@RequestBody CertificateRequest req) {
        return profileService.addCertificate(getUserId(), req);
    }

    @PutMapping("/certificates/{id}")
    public ResponseEntity<?> updateCertificate(@PathVariable Long id, @RequestBody CertificateRequest req) {
        profileService.updateCertificate(id, req);
        return ok("Certificate updated");
    }

    @DeleteMapping("/certificates/{id}")
    public ResponseEntity<?> deleteCertificate(@PathVariable Long id) {
        profileService.deleteCertificate(id);
        return ok("Certificate deleted");
    }

    // ==========================================================
    // EXPERIENCE
    // ==========================================================
    @PostMapping("/experience")
    public Experience addExperience(@RequestBody ExperienceRequest req) {
        return profileService.addExperience(getUserId(), req);
    }

    @PutMapping("/experience/{id}")
    public ResponseEntity<?> updateExperience(@PathVariable Long id, @RequestBody ExperienceRequest req) {
        profileService.updateExperience(id, req);
        return ok("Experience updated");
    }

    @DeleteMapping("/experience/{id}")
    public ResponseEntity<?> deleteExperience(@PathVariable Long id) {
        profileService.deleteExperience(id);
        return ok("Experience deleted");
    }

    // ==========================================================
    // PORTFOLIO
    // ==========================================================
    @GetMapping("/portfolio")
    public List<Portfolio> getPortfolio() {
        return profileService.getPortfolio(getUserId());
    }

    @PostMapping("/portfolio/link")
    public Portfolio addPortfolioLink(@RequestBody PortfolioLinkRequest req) {
        return profileService.addPortfolioLink(getUserId(), req);
    }

    @PostMapping("/portfolio/file")
    public Portfolio uploadPortfolioFile(@RequestParam MultipartFile file) {
        return profileService.uploadPortfolioFile(getUserId(), file);
    }

    @DeleteMapping("/portfolio/{id}")
    public ResponseEntity<?> deletePortfolio(@PathVariable Long id) {
        profileService.deletePortfolio(id);
        return ok("Portfolio item deleted");
    }

    // ==========================================================
    // CV
    // ==========================================================
    @GetMapping("/cv")
    public List<CV> getCVs() {
        return profileService.getCVs(getUserId());
    }

    @PostMapping("/cv")
    public CV uploadCV(@RequestParam MultipartFile file) {
        return profileService.uploadCV(getUserId(), file);
    }

    @PutMapping("/cv/{id}")
    public CV replaceCV(@PathVariable Long id, @RequestParam MultipartFile file) {
        return profileService.replaceCV(id, file);
    }

    @DeleteMapping("/cv/{id}")
    public ResponseEntity<?> deleteCV(@PathVariable Long id) {
        profileService.deleteCV(id);
        return ok("CV deleted");
    }

    @PostMapping("/cv/{id}/analyze")
    public ResponseEntity<?> analyzeCV(@PathVariable Long id) {
        profileService.analyzeCV(id);
        return ok("AI analyzing CV");
    }

    // ==========================================================
    // CAREER OBJECTIVE
    // ==========================================================
    @PutMapping("/career")
    public ResponseEntity<?> updateCareerObjective(@RequestBody CareerObjectiveRequest req) {
        profileService.updateCareerObjective(getUserId(), req);
        return ok("Career objective updated");
    }
}
