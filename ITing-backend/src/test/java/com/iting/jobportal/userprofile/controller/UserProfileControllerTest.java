package com.iting.jobportal.userprofile.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.userprofile.dto.request.*;
import com.iting.jobportal.userprofile.entity.*;
import com.iting.jobportal.userprofile.service.UserProfileService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class UserProfileControllerTest {

  @Mock private UserProfileService profileService;
  @InjectMocks private UserProfileController controller;

  // ── Profile root ────────────────────────────────────────────────────

  @Test
  void getProfile_delegatesToService() {
    UserProfile expected = new UserProfile();
    when(profileService.getProfile(1L)).thenReturn(expected);

    assertSame(expected, controller.getProfile(1L).getBody());
  }

  @Test
  void updateProfile_callsService_returnsMessage() {
    UserProfileUpdateDto dto = new UserProfileUpdateDto();

    ResponseEntity<?> resp = controller.updateProfile(1L, dto);

    verify(profileService).updateProfile(1L, dto);
    assertEquals("Professional profile updated", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  // ── Education CRUD ──────────────────────────────────────────────────

  @Test
  void getEducations_delegatesToService() {
    List<Education> list = List.of();
    when(profileService.getEducations(1L)).thenReturn(list);
    assertSame(list, controller.getEducations(1L));
  }

  @Test
  void addEducation_delegatesToService() {
    EducationRequest req = new EducationRequest();
    Education created = new Education();
    when(profileService.addEducation(1L, req)).thenReturn(created);

    assertSame(created, controller.addEducation(1L, req));
  }

  @Test
  void updateEducation_callsService_returnsMessage() {
    EducationRequest req = new EducationRequest();
    ResponseEntity<?> resp = controller.updateEducation(5L, req);

    verify(profileService).updateEducation(5L, req);
    assertEquals("Education updated", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  @Test
  void deleteEducation_callsService_returnsMessage() {
    ResponseEntity<?> resp = controller.deleteEducation(5L);

    verify(profileService).deleteEducation(5L);
    assertEquals("Education deleted", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  // ── Skills CRUD ─────────────────────────────────────────────────────

  @Test
  void getSkills_delegatesToService() {
    List<Skill> list = List.of();
    when(profileService.getSkills(1L)).thenReturn(list);
    assertSame(list, controller.getSkills(1L));
  }

  @Test
  void addSkill_delegatesToService() {
    SkillRequest req = new SkillRequest();
    Skill created = new Skill();
    when(profileService.addSkill(1L, req)).thenReturn(created);

    assertSame(created, controller.addSkill(1L, req));
  }

  @Test
  void updateSkill_callsService() {
    SkillRequest req = new SkillRequest();
    controller.updateSkill(5L, req);
    verify(profileService).updateSkill(5L, req);
  }

  @Test
  void deleteSkill_callsService() {
    controller.deleteSkill(5L);
    verify(profileService).deleteSkill(5L);
  }

  // ── Certificate CRUD ────────────────────────────────────────────────

  @Test
  void getCertificates_delegatesToService() {
    List<Certificate> list = List.of();
    when(profileService.getCertificates(1L)).thenReturn(list);
    assertSame(list, controller.getCertificates(1L));
  }

  @Test
  void addCertificate_delegatesToService() {
    CertificateRequest req = new CertificateRequest();
    Certificate created = new Certificate();
    when(profileService.addCertificate(1L, req)).thenReturn(created);

    assertSame(created, controller.addCertificate(1L, req));
  }

  @Test
  void updateCertificate_callsService() {
    CertificateRequest req = new CertificateRequest();
    controller.updateCertificate(5L, req);
    verify(profileService).updateCertificate(5L, req);
  }

  @Test
  void deleteCertificate_callsService() {
    controller.deleteCertificate(5L);
    verify(profileService).deleteCertificate(5L);
  }

  // ── Experience CRUD ─────────────────────────────────────────────────

  @Test
  void getExperiences_delegatesToService() {
    List<Experience> list = List.of();
    when(profileService.getExperiences(1L)).thenReturn(list);
    assertSame(list, controller.getExperiences(1L));
  }

  @Test
  void addExperience_delegatesToService() {
    ExperienceRequest req = new ExperienceRequest();
    Experience created = new Experience();
    when(profileService.addExperience(1L, req)).thenReturn(created);

    assertSame(created, controller.addExperience(1L, req));
  }

  @Test
  void updateExperience_callsService() {
    ExperienceRequest req = new ExperienceRequest();
    controller.updateExperience(5L, req);
    verify(profileService).updateExperience(5L, req);
  }

  @Test
  void deleteExperience_callsService() {
    controller.deleteExperience(5L);
    verify(profileService).deleteExperience(5L);
  }

  // ── Portfolio CRUD ──────────────────────────────────────────────────

  @Test
  void getPortfolios_delegatesToService() {
    List<Portfolio> list = List.of();
    when(profileService.getPortfolios(1L)).thenReturn(list);
    assertSame(list, controller.getPortfolios(1L));
  }

  @Test
  void addPortfolio_delegatesToService() {
    PortfolioRequest req = new PortfolioRequest();
    Portfolio created = new Portfolio();
    when(profileService.addPortfolio(1L, req)).thenReturn(created);

    assertSame(created, controller.addPortfolio(1L, req));
  }

  @Test
  void updatePortfolio_callsService() {
    PortfolioRequest req = new PortfolioRequest();
    controller.updatePortfolio(5L, req);
    verify(profileService).updatePortfolio(5L, req);
  }

  @Test
  void deletePortfolio_callsService() {
    controller.deletePortfolio(5L);
    verify(profileService).deletePortfolio(5L);
  }

  // ── CV CRUD + title + setDefault ────────────────────────────────────

  @Test
  void getCVs_delegatesToService() {
    List<CV> list = List.of();
    when(profileService.getCVs(1L)).thenReturn(list);
    assertSame(list, controller.getCVs(1L));
  }

  @Test
  void addCV_delegatesToService() {
    CVRequest req = new CVRequest();
    CV created = new CV();
    when(profileService.addCV(1L, req)).thenReturn(created);

    assertSame(created, controller.addCV(1L, req));
  }

  @Test
  void updateCVTitle_passesTitle() {
    controller.updateCVTitle(5L, Map.of("title", "Senior Dev CV"));

    verify(profileService).updateCVTitle(5L, "Senior Dev CV");
  }

  @Test
  void setDefaultCV_passesUserAndCvId() {
    controller.setDefaultCV(1L, 5L);
    verify(profileService).setDefaultCV(1L, 5L);
  }

  @Test
  void deleteCV_callsService() {
    controller.deleteCV(5L);
    verify(profileService).deleteCV(5L);
  }

  // ── Social Links ────────────────────────────────────────────────────

  @Test
  void getSocialLinks_delegatesToService() {
    List<SocialLink> list = List.of();
    when(profileService.getSocialLinks(1L)).thenReturn(list);
    assertSame(list, controller.getSocialLinks(1L));
  }

  @Test
  void addSocialLink_delegatesToService() {
    SocialLinkRequest req = new SocialLinkRequest();
    SocialLink created = new SocialLink();
    when(profileService.addSocialLink(1L, req)).thenReturn(created);

    assertSame(created, controller.addSocialLink(1L, req));
  }

  @Test
  void deleteSocialLink_callsService() {
    ResponseEntity<?> resp = controller.deleteSocialLink(5L);
    verify(profileService).deleteSocialLink(5L);
    assertEquals(HttpStatus.OK, resp.getStatusCode());
  }
}
