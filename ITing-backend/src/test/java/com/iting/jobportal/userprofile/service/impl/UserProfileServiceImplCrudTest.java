package com.iting.jobportal.userprofile.service.impl;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.exception.ResourceNotFoundException;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.file.FileUploadService;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.userprofile.dto.request.*;
import com.iting.jobportal.userprofile.entity.*;
import com.iting.jobportal.userprofile.entity.enums.SocialPlatform;
import com.iting.jobportal.userprofile.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserProfileServiceImplCrudTest {

    @Mock private UserProfileRepository userProfileRepo;
    @Mock private UserRepository userRepository;
    @Mock private EducationRepository educationRepo;
    @Mock private SkillRepository skillRepo;
    @Mock private CertificateRepository certificateRepo;
    @Mock private ExperienceRepository experienceRepo;
    @Mock private PortfolioRepository portfolioRepo;
    @Mock private CVRepository cvRepo;
    @Mock private SocialLinkRepository socialRepo;
    @Mock private FileUploadService fileUploadService;
    @Mock private AccountRepository accountRepository;

    @InjectMocks private UserProfileServiceImpl service;

    private UserProfile profile() {
        UserProfile p = new UserProfile();
        p.setId(1L);
        return p;
    }

    // ── getProfile / getOrCreateProfile ─────────────────────────────────

    @Test
    void getProfile_existing_returns() {
        UserProfile p = profile();
        when(userProfileRepo.findById(1L)).thenReturn(Optional.of(p));

        assertSame(p, service.getProfile(1L));
    }

    @Test
    void getOrCreateProfile_userExists_createsProfile() {
        User user = new User(); user.setId(1L);
        when(userProfileRepo.findById(1L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userProfileRepo.save(any(UserProfile.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        UserProfile p = service.getProfile(1L);

        assertNotNull(p);
        assertEquals(1L, p.getId());
    }

    @Test
    void getOrCreateProfile_userMissing_accountExists_createsBoth() {
        when(userProfileRepo.findById(1L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        Account acc = new Account(); acc.setId(1L);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(acc));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userProfileRepo.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        UserProfile p = service.getProfile(1L);

        assertNotNull(p);
        verify(userRepository).save(any(User.class));
        verify(userProfileRepo).save(any(UserProfile.class));
    }

    @Test
    void getOrCreateProfile_accountMissing_throws() {
        when(userProfileRepo.findById(1L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        when(accountRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getProfile(1L));
    }

    @Test
    void updateOpenToWork_setsAndSaves() {
        when(userProfileRepo.findById(1L)).thenReturn(Optional.of(profile()));

        service.updateOpenToWork(1L, false);

        ArgumentCaptor<UserProfile> cap = ArgumentCaptor.forClass(UserProfile.class);
        verify(userProfileRepo).save(cap.capture());
        assertEquals(false, cap.getValue().getOpenToWork());
    }

    // ── Education CRUD ──────────────────────────────────────────────────

    @Test
    void getEducations_delegatesToRepo() {
        Education e = new Education();
        when(educationRepo.findByProfile_Id(1L)).thenReturn(List.of(e));

        assertEquals(1, service.getEducations(1L).size());
    }

    @Test
    void addEducation_setsFieldsAndSaves() {
        when(userProfileRepo.findById(1L)).thenReturn(Optional.of(profile()));
        when(educationRepo.save(any(Education.class))).thenAnswer(inv -> inv.getArgument(0));

        EducationRequest req = new EducationRequest();
        req.setSchoolName("UIT");
        req.setMajor("CS");
        req.setDegree("Bachelor");
        req.setStartDate(LocalDate.of(2020, 9, 1));
        req.setEndDate(LocalDate.of(2024, 6, 1));
        req.setDescription("desc");

        Education saved = service.addEducation(1L, req);

        assertEquals("UIT", saved.getSchoolName());
        assertEquals("CS", saved.getMajor());
        assertEquals("Bachelor", saved.getDegree());
    }

    @Test
    void updateEducation_existing_overwritesFields() {
        Education e = new Education();
        e.setId(10L);
        when(educationRepo.findById(10L)).thenReturn(Optional.of(e));

        EducationRequest req = new EducationRequest();
        req.setSchoolName("HUST");
        req.setMajor("AI");
        req.setDegree("Master");
        req.setStartDate(LocalDate.of(2024, 9, 1));

        service.updateEducation(10L, req);

        verify(educationRepo).save(e);
        assertEquals("HUST", e.getSchoolName());
    }

    @Test
    void updateEducation_notFound_throws() {
        when(educationRepo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
                () -> service.updateEducation(99L, new EducationRequest()));
    }

    @Test
    void deleteEducation_callsRepo() {
        service.deleteEducation(10L);
        verify(educationRepo).deleteById(10L);
    }

    // ── Skill CRUD ──────────────────────────────────────────────────────

    @Test
    void getSkills_delegates() {
        when(skillRepo.findByProfile_Id(1L)).thenReturn(List.of(new Skill()));
        assertEquals(1, service.getSkills(1L).size());
    }

    @Test
    void addSkill_savesWithName() {
        when(userProfileRepo.findById(1L)).thenReturn(Optional.of(profile()));
        when(skillRepo.save(any(Skill.class))).thenAnswer(inv -> inv.getArgument(0));

        SkillRequest req = new SkillRequest();
        req.setName("Java");

        Skill s = service.addSkill(1L, req);
        assertEquals("Java", s.getName());
    }

    @Test
    void updateSkill_notFound_throws() {
        when(skillRepo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
                () -> service.updateSkill(99L, new SkillRequest()));
    }

    @Test
    void updateSkill_existing_overwrites() {
        Skill s = new Skill(); s.setId(10L); s.setName("old");
        when(skillRepo.findById(10L)).thenReturn(Optional.of(s));

        SkillRequest req = new SkillRequest();
        req.setName("new");
        service.updateSkill(10L, req);

        assertEquals("new", s.getName());
        verify(skillRepo).save(s);
    }

    @Test
    void deleteSkill_callsRepo() {
        service.deleteSkill(10L);
        verify(skillRepo).deleteById(10L);
    }

    // ── Certificate CRUD ────────────────────────────────────────────────

    @Test
    void addCertificate_savesAllFields() {
        when(userProfileRepo.findById(1L)).thenReturn(Optional.of(profile()));
        when(certificateRepo.save(any(Certificate.class))).thenAnswer(inv -> inv.getArgument(0));

        CertificateRequest req = new CertificateRequest();
        req.setTitle("AWS SAA");
        req.setIssuingOrganization("Amazon");
        req.setCredentialId("xyz");
        req.setCredentialUrl("https://verify");
        req.setDoesNotExpire(true);

        Certificate c = service.addCertificate(1L, req);
        assertEquals("AWS SAA", c.getTitle());
        assertEquals(true, c.getDoesNotExpire());
    }

    @Test
    void updateCertificate_notFound_throws() {
        when(certificateRepo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
                () -> service.updateCertificate(99L, new CertificateRequest()));
    }

    @Test
    void updateCertificate_existing_overwrites() {
        Certificate c = new Certificate(); c.setId(10L);
        when(certificateRepo.findById(10L)).thenReturn(Optional.of(c));

        CertificateRequest req = new CertificateRequest();
        req.setTitle("new title");
        service.updateCertificate(10L, req);

        assertEquals("new title", c.getTitle());
        verify(certificateRepo).save(c);
    }

    @Test
    void deleteCertificate_callsRepo() {
        service.deleteCertificate(5L);
        verify(certificateRepo).deleteById(5L);
    }

    // ── Experience CRUD ─────────────────────────────────────────────────

    @Test
    void addExperience_setsFields() {
        when(userProfileRepo.findById(1L)).thenReturn(Optional.of(profile()));
        when(experienceRepo.save(any(Experience.class))).thenAnswer(inv -> inv.getArgument(0));

        ExperienceRequest req = new ExperienceRequest();
        req.setCompanyName("ACME");
        req.setPosition("Dev");
        req.setIsCurrent(true);

        Experience e = service.addExperience(1L, req);
        assertEquals("ACME", e.getCompanyName());
        assertEquals(true, e.getIsCurrent());
    }

    @Test
    void updateExperience_notFound_throws() {
        when(experienceRepo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
                () -> service.updateExperience(99L, new ExperienceRequest()));
    }

    @Test
    void updateExperience_existing_overwrites() {
        Experience e = new Experience();
        when(experienceRepo.findById(10L)).thenReturn(Optional.of(e));

        ExperienceRequest req = new ExperienceRequest();
        req.setCompanyName("New Co");
        service.updateExperience(10L, req);

        assertEquals("New Co", e.getCompanyName());
        verify(experienceRepo).save(e);
    }

    @Test
    void deleteExperience_callsRepo() {
        service.deleteExperience(5L);
        verify(experienceRepo).deleteById(5L);
    }

    // ── Portfolio CRUD ──────────────────────────────────────────────────

    @Test
    void addPortfolio_setsFields() {
        when(userProfileRepo.findById(1L)).thenReturn(Optional.of(profile()));
        when(portfolioRepo.save(any(Portfolio.class))).thenAnswer(inv -> inv.getArgument(0));

        PortfolioRequest req = new PortfolioRequest();
        req.setTitle("My site");
        req.setUrl("https://me.io");

        Portfolio p = service.addPortfolio(1L, req);
        assertEquals("My site", p.getTitle());
        assertEquals("https://me.io", p.getUrl());
    }

    @Test
    void updatePortfolio_notFound_throws() {
        when(portfolioRepo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
                () -> service.updatePortfolio(99L, new PortfolioRequest()));
    }

    @Test
    void deletePortfolio_callsRepo() {
        service.deletePortfolio(5L);
        verify(portfolioRepo).deleteById(5L);
    }

    // ── CV ──────────────────────────────────────────────────────────────

    @Test
    void getCVs_delegates() {
        when(cvRepo.findByProfile_Id(1L)).thenReturn(List.of(new CV()));
        assertEquals(1, service.getCVs(1L).size());
    }

    @Test
    void addCV_notDefault_skipsResetLogic() {
        when(userProfileRepo.findById(1L)).thenReturn(Optional.of(profile()));
        when(cvRepo.save(any(CV.class))).thenAnswer(inv -> inv.getArgument(0));

        CVRequest req = new CVRequest();
        req.setTitle("CV");
        req.setFileUrl("/cv.pdf");
        req.setIsDefault(false);

        CV cv = service.addCV(1L, req);
        assertEquals("CV", cv.getTitle());
        // findByProfile_Id not called because isDefault=false
        verify(cvRepo, never()).findByProfile_Id(any());
    }

    @Test
    void updateCVTitle_existing_savesNewTitle() {
        CV cv = new CV(); cv.setId(10L);
        when(cvRepo.findById(10L)).thenReturn(Optional.of(cv));

        service.updateCVTitle(10L, "New title");

        assertEquals("New title", cv.getTitle());
        verify(cvRepo).save(cv);
    }

    @Test
    void updateCVTitle_notFound_throws() {
        when(cvRepo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
                () -> service.updateCVTitle(99L, "x"));
    }

    @Test
    void setDefaultCV_notFound_throws() {
        when(cvRepo.findByProfile_Id(1L)).thenReturn(List.of());
        when(cvRepo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.setDefaultCV(1L, 99L));
    }

    @Test
    void deleteCV_withFileUrl_deletesFile() {
        CV cv = new CV();
        cv.setId(10L);
        cv.setFileUrl("/api/files/cv.pdf");
        when(cvRepo.findById(10L)).thenReturn(Optional.of(cv));

        service.deleteCV(10L);

        verify(fileUploadService).deleteByUrl("/api/files/cv.pdf");
        verify(cvRepo).delete(cv);
    }

    @Test
    void deleteCV_blankFileUrl_skipsFileService() {
        CV cv = new CV(); cv.setId(10L); cv.setFileUrl("   ");
        when(cvRepo.findById(10L)).thenReturn(Optional.of(cv));

        service.deleteCV(10L);

        verify(fileUploadService, never()).deleteByUrl(any());
        verify(cvRepo).delete(cv);
    }

    @Test
    void deleteCV_nullFileUrl_skipsFileService() {
        CV cv = new CV(); cv.setId(10L); cv.setFileUrl(null);
        when(cvRepo.findById(10L)).thenReturn(Optional.of(cv));

        service.deleteCV(10L);

        verify(fileUploadService, never()).deleteByUrl(any());
    }

    @Test
    void deleteCV_notFound_throws() {
        when(cvRepo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.deleteCV(99L));
    }

    // ── Social Link CRUD ───────────────────────────────────────────────

    @Test
    void getSocialLinks_delegates() {
        when(socialRepo.findByProfile_Id(1L)).thenReturn(List.of(new SocialLink()));
        assertEquals(1, service.getSocialLinks(1L).size());
    }

    @Test
    void addSocialLink_setsFields() {
        when(userProfileRepo.findById(1L)).thenReturn(Optional.of(profile()));
        when(socialRepo.save(any(SocialLink.class))).thenAnswer(inv -> inv.getArgument(0));

        SocialLinkRequest req = new SocialLinkRequest();
        req.setPlatform(SocialPlatform.GITHUB);
        req.setUrl("https://gh");

        SocialLink l = service.addSocialLink(1L, req);
        assertEquals(SocialPlatform.GITHUB, l.getPlatform());
        assertEquals("https://gh", l.getUrl());
    }

    @Test
    void deleteSocialLink_callsRepo() {
        service.deleteSocialLink(5L);
        verify(socialRepo).deleteById(5L);
    }
}
