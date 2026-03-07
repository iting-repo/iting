package com.iting.jobportal.userprofile.controller;

import com.iting.jobportal.userprofile.dto.*;
import com.iting.jobportal.userprofile.entity.*;
import com.iting.jobportal.userprofile.service.UserProfileService;
import com.iting.jobportal.user.controller.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService profileService;

    private String resolveUserId(String currentUserId, String userId) {
        String resolved = currentUserId != null ? currentUserId : userId;
        if (resolved == null || resolved.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing userId (no authenticated user)");
        }
        return resolved;
    }

    private ResponseEntity<?> ok(String msg) {
        return ResponseEntity.ok(Map.of("message", msg));
    }

    // ==========================================================
    // CONTACT INFO
    // ==========================================================
    @PutMapping("/contact")
    public ResponseEntity<?> updateContact(
            @CurrentUser String currentUserId,
            @RequestParam(required = false) String userId,
            @RequestBody ContactInfoRequest req
    ) {
        profileService.updateContact(resolveUserId(currentUserId, userId), req);
        return ok("Contact updated");
    }

    // ==========================================================
    // SOCIAL LINKS
    // ==========================================================
    @GetMapping("/social")
    public List<SocialLink> getSocialLinks(
            @CurrentUser String currentUserId,
            @RequestParam(required = false) String userId
    ) {
        return profileService.getSocialLinks(resolveUserId(currentUserId, userId));
    }

    @PostMapping("/social")
    public SocialLink addSocial(
            @CurrentUser String currentUserId,
            @RequestParam(required = false) String userId,
            @RequestBody SocialLinkRequest req
    ) {
        return profileService.addSocialLink(resolveUserId(currentUserId, userId), req);
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
    public List<Education> getEducations(
            @CurrentUser String currentUserId,
            @RequestParam(required = false) String userId
    ) {
        return profileService.getEducations(resolveUserId(currentUserId, userId));
    }

    @PostMapping("/education")
    public Education addEducation(
            @CurrentUser String currentUserId,
            @RequestParam(required = false) String userId,
            @RequestBody EducationRequest req
    ) {
        return profileService.addEducation(resolveUserId(currentUserId, userId), req);
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
    public List<Skill> getSkills(
            @CurrentUser String currentUserId,
            @RequestParam(required = false) String userId
    ) {
        return profileService.getSkills(resolveUserId(currentUserId, userId));
    }

    @PostMapping("/skills")
    public Skill addSkill(
            @CurrentUser String currentUserId,
            @RequestParam(required = false) String userId,
            @RequestBody SkillRequest req
    ) {
        return profileService.addSkill(resolveUserId(currentUserId, userId), req);
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
    public Certificate addCertificate(
            @CurrentUser String currentUserId,
            @RequestParam(required = false) String userId,
            @RequestBody CertificateRequest req
    ) {
        return profileService.addCertificate(resolveUserId(currentUserId, userId), req);
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
    public Experience addExperience(
            @CurrentUser String currentUserId,
            @RequestParam(required = false) String userId,
            @RequestBody ExperienceRequest req
    ) {
        return profileService.addExperience(resolveUserId(currentUserId, userId), req);
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
    public List<Portfolio> getPortfolio(
            @CurrentUser String currentUserId,
            @RequestParam(required = false) String userId
    ) {
        return profileService.getPortfolio(resolveUserId(currentUserId, userId));
    }

    @PostMapping("/portfolio/link")
    public Portfolio addPortfolioLink(
            @CurrentUser String currentUserId,
            @RequestParam(required = false) String userId,
            @RequestBody PortfolioLinkRequest req
    ) {
        return profileService.addPortfolioLink(resolveUserId(currentUserId, userId), req);
    }

    @PostMapping("/portfolio/file")
    public Portfolio uploadPortfolioFile(
            @CurrentUser String currentUserId,
            @RequestParam(required = false) String userId,
            @RequestParam MultipartFile file
    ) {
        return profileService.uploadPortfolioFile(resolveUserId(currentUserId, userId), file);
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
    public List<CV> getCVs(
            @CurrentUser String currentUserId,
            @RequestParam(required = false) String userId
    ) {
        return profileService.getCVs(resolveUserId(currentUserId, userId));
    }

    @PostMapping("/cv")
    public CV uploadCV(
            @CurrentUser String currentUserId,
            @RequestParam(required = false) String userId,
            @RequestParam MultipartFile file
    ) {
        return profileService.uploadCV(resolveUserId(currentUserId, userId), file);
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
    public ResponseEntity<?> updateCareerObjective(
            @CurrentUser String currentUserId,
            @RequestParam(required = false) String userId,
            @RequestBody CareerObjectiveRequest req
    ) {
        profileService.updateCareerObjective(resolveUserId(currentUserId, userId), req);
        return ok("Career objective updated");
    }
}
