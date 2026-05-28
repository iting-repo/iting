package com.iting.jobportal.application.util;

import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.entity.enums.ApplicationStatus;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.common.service.S3Service;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.userprofile.entity.CV;
import com.iting.jobportal.userprofile.entity.Education;
import com.iting.jobportal.userprofile.entity.Experience;
import com.iting.jobportal.userprofile.repository.CVRepository;
import com.iting.jobportal.userprofile.repository.EducationRepository;
import com.iting.jobportal.userprofile.repository.ExperienceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApplicationMapperUtilTest {

    @Mock private JobRepository jobRepository;
    @Mock private UserRepository userRepository;
    @Mock private CVRepository cvRepository;
    @Mock private ExperienceRepository experienceRepository;
    @Mock private EducationRepository educationRepository;
    @Mock private S3Service s3Service;

    @InjectMocks private ApplicationMapperUtil mapper;

    private ApplyForm form;
    private ApplyFormSentToJob sent;

    @BeforeEach
    void setUp() {
        form = ApplyForm.builder()
                .id(100L)
                .userId(7L)
                .applicantName("Alice")
                .introduction("hello")
                .build();

        ApplyFormSentToJob.ApplyFormSentToJobId id =
                new ApplyFormSentToJob.ApplyFormSentToJobId(42L, 100L);
        sent = ApplyFormSentToJob.builder()
                .id(id)
                .timeSent(LocalDateTime.now())
                .status(ApplicationStatus.PENDING)
                .build();

        // default empty lists/optionals to avoid NPE per test
        lenient().when(experienceRepository.findByProfile_Id(7L)).thenReturn(List.of());
        lenient().when(educationRepository.findByProfile_Id(7L)).thenReturn(List.of());
    }

    // ── Job mapping ─────────────────────────────────────────────────────

    @Test
    void buildFullResponse_jobFound_mapsCompanyAndTitle() {
        Company c = new Company();
        c.setId(5L);
        c.setName("ACME");
        c.setLogoUrl("/logo.png");
        c.setActive(true);

        Job job = Job.builder().id(42L).position("Backend Dev").company(c).build();
        when(jobRepository.findById(42L)).thenReturn(Optional.of(job));
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("Backend Dev", res.getJobTitle());
        assertEquals(5L, res.getCompanyId());
        assertEquals("ACME", res.getCompanyName());
        assertEquals("/logo.png", res.getCompanyLogo());
        assertEquals(true, res.getCompanyActive());
    }

    @Test
    void buildFullResponse_jobNotFound_companyFieldsNull() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertNull(res.getJobTitle());
        assertNull(res.getCompanyId());
        assertNull(res.getCompanyName());
    }

    @Test
    void buildFullResponse_jobWithoutCompany_companyFieldsNull() {
        Job job = Job.builder().id(42L).position("Dev").company(null).build();
        when(jobRepository.findById(42L)).thenReturn(Optional.of(job));
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("Dev", res.getJobTitle());
        assertNull(res.getCompanyId());
    }

    // ── Account / Email / Avatar ────────────────────────────────────────

    @Test
    void buildFullResponse_accountPresent_mapsEmailPhoneAvatar() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());

        Account acc = new Account();
        acc.setEmail("alice@iting.vn");
        acc.setPhone("0901234567");
        acc.setAvatarUrl("/avatar.png");
        User u = new User();
        u.setAccount(acc);
        when(userRepository.findById(7L)).thenReturn(Optional.of(u));

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("alice@iting.vn", res.getEmail());
        assertEquals("0901234567", res.getPhoneNumber());
        assertEquals("/avatar.png", res.getAvatarUrl());
    }

    @Test
    void buildFullResponse_emailBlank_fallbacksToUserId() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());

        Account acc = new Account();
        acc.setEmail("   ");
        User u = new User();
        u.setAccount(acc);
        when(userRepository.findById(7L)).thenReturn(Optional.of(u));

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("7", res.getEmail());
    }

    @Test
    void buildFullResponse_noAccount_emailIsUserIdString() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("7", res.getEmail());
        assertNull(res.getPhoneNumber());
        assertNull(res.getAvatarUrl());
    }

    // ── CV: attached ────────────────────────────────────────────────────

    @Test
    void buildFullResponse_cvAttached_withS3Key_callsFreshUrl() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        CV cv = CV.builder()
                .id(50L)
                .s3Key("cvs/user_7/abc.pdf")
                .fileUrl("https://bucket.s3.amazonaws.com/cvs/user_7/abc.pdf")
                .build();
        form.setCv(cv);

        when(s3Service.getPreSignedUrl("cvs/user_7/abc.pdf"))
                .thenReturn("https://signed.url?sig=xyz");

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("https://signed.url?sig=xyz", res.getCvUrl());
        assertEquals("abc", res.getCvFileName());
        assertEquals("PDF", res.getCvFileType());
    }

    @Test
    void buildFullResponse_cvFileUrl_withQueryString_stripsQuery() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        CV cv = CV.builder()
                .id(50L)
                .fileUrl("/api/files/cvs/user_7/resume.docx?signature=abc")
                .build();
        form.setCv(cv);

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("resume", res.getCvFileName());
        assertEquals("DOCX", res.getCvFileType());
    }

    @Test
    void buildFullResponse_cvNoExtension_defaultsPdf() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        CV cv = CV.builder().id(50L).fileUrl("/files/no_ext_here").build();
        form.setCv(cv);

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("no_ext_here", res.getCvFileName());
        assertEquals("PDF", res.getCvFileType());
    }

    @Test
    void buildFullResponse_cvNullFileUrl_fallbacksToTitle() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        CV cv = CV.builder().id(50L).title("Resume_v2").fileUrl(null).build();
        form.setCv(cv);

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("Resume_v2", res.getCvFileName());
    }

    // ── CV: not attached, cvTitle = CV_<id> ─────────────────────────────

    @Test
    void buildFullResponse_cvTitleStartsCv_parsesCvIdAndLoads() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        form.setCv(null);
        form.setCvTitle("CV_99");

        CV cv = CV.builder().id(99L).fileUrl("/files/cv_99.pdf").build();
        when(cvRepository.findById(99L)).thenReturn(Optional.of(cv));

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("cv_99", res.getCvFileName());
        assertEquals("PDF", res.getCvFileType());
    }

    @Test
    void buildFullResponse_cvTitleInvalidNumberFormat_fallbacksToTitle() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        form.setCv(null);
        form.setCvTitle("CV_xyz_invalid");

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("CV_xyz_invalid", res.getCvFileName());
    }

    @Test
    void buildFullResponse_cvNullAndTitleNotCv_usesTitleDirectly() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        form.setCv(null);
        form.setCvTitle("My CV PDF");

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("My CV PDF", res.getCvFileName());
    }

    // ── Experience → years calculation ──────────────────────────────────

    @Test
    void buildFullResponse_experiences_calculatesYears() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        Experience e1 = new Experience();
        e1.setStartDate(LocalDate.now().minusMonths(30));
        e1.setEndDate(LocalDate.now().minusMonths(6)); // 24 months

        Experience e2 = new Experience();
        e2.setStartDate(LocalDate.now().minusMonths(12));
        e2.setEndDate(null); // current → 12 months

        when(experienceRepository.findByProfile_Id(7L)).thenReturn(List.of(e1, e2));

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        // total 36 months / 12 = 3 years
        assertEquals(3, res.getYearsExperience());
    }

    @Test
    void buildFullResponse_experiences_lessThan12Months_atLeastOne() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        Experience e1 = new Experience();
        e1.setStartDate(LocalDate.now().minusMonths(3));
        e1.setEndDate(null);
        when(experienceRepository.findByProfile_Id(7L)).thenReturn(List.of(e1));

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        // 3 months → totalMonths > 0 → Math.max(1, 3/12)=1
        assertEquals(1, res.getYearsExperience());
    }

    @Test
    void buildFullResponse_noExperiences_yearsNull() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertNull(res.getYearsExperience());
    }

    @Test
    void buildFullResponse_experienceNullStart_skipped() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        Experience e = new Experience();
        e.setStartDate(null);
        when(experienceRepository.findByProfile_Id(7L)).thenReturn(List.of(e));

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertNull(res.getYearsExperience());
    }

    // ── Education formatting ────────────────────────────────────────────

    @Test
    void buildFullResponse_education_degreeAndSchool_combined() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        Education ed = new Education();
        ed.setDegree("Bachelor");
        ed.setSchoolName("UIT");
        ed.setEndDate(LocalDate.now());
        when(educationRepository.findByProfile_Id(7L)).thenReturn(List.of(ed));

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("Bachelor - UIT", res.getEducation());
    }

    @Test
    void buildFullResponse_education_degreeOnly() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        Education ed = new Education();
        ed.setDegree("Master");
        when(educationRepository.findByProfile_Id(7L)).thenReturn(List.of(ed));

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("Master", res.getEducation());
    }

    @Test
    void buildFullResponse_education_schoolAndMajorNoDegree() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        Education ed = new Education();
        ed.setSchoolName("HUST");
        ed.setMajor("CS");
        when(educationRepository.findByProfile_Id(7L)).thenReturn(List.of(ed));

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("HUST (CS)", res.getEducation());
    }

    @Test
    void buildFullResponse_education_majorOnly() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        Education ed = new Education();
        ed.setMajor("CS");
        when(educationRepository.findByProfile_Id(7L)).thenReturn(List.of(ed));

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("CS", res.getEducation());
    }

    @Test
    void buildFullResponse_education_pickLatestByEndDate() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        Education older = new Education();
        older.setDegree("Bachelor");
        older.setEndDate(LocalDate.of(2020, 6, 1));

        Education newer = new Education();
        newer.setDegree("Master");
        newer.setEndDate(LocalDate.of(2024, 6, 1));

        when(educationRepository.findByProfile_Id(7L)).thenReturn(List.of(older, newer));

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("Master", res.getEducation());
    }

    @Test
    void buildFullResponse_education_emptyList_nullEducation() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertNull(res.getEducation());
    }

    // ── Status / Pipeline defaults ──────────────────────────────────────

    @Test
    void buildFullResponse_nullStatus_defaultsPending() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        sent.setStatus(null);

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals(ApplicationStatus.PENDING, res.getStatus());
    }

    @Test
    void buildFullResponse_nullPipelineStage_defaultsScreening() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        sent.setPipelineStage(null);

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("SCREENING", res.getPipelineStage());
    }

    @Test
    void buildFullResponse_customPipelineStage_preserved() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        sent.setPipelineStage("INTERVIEW");

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("INTERVIEW", res.getPipelineStage());
    }

    // ── S3 preSign error fallthrough ───────────────────────────────────

    @Test
    void buildFullResponse_s3PresignFails_usesOriginalFileUrl() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        CV cv = CV.builder()
                .id(50L)
                .s3Key("cvs/user_7/abc.pdf")
                .fileUrl("https://bucket.s3.amazonaws.com/cvs/abc.pdf")
                .build();
        form.setCv(cv);

        when(s3Service.getPreSignedUrl(any()))
                .thenThrow(new RuntimeException("S3 down"));

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        // fallback to original fileUrl
        assertEquals("https://bucket.s3.amazonaws.com/cvs/abc.pdf", res.getCvUrl());
    }

    @Test
    void buildFullResponse_cvWithoutS3Key_andNonS3Url_keepsOriginalUrl() {
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        CV cv = CV.builder()
                .id(50L)
                .s3Key(null)
                .fileUrl("/api/files/cv.pdf") // local path, no amazonaws
                .build();
        form.setCv(cv);

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertEquals("/api/files/cv.pdf", res.getCvUrl());
    }

    // ── Smoke: all fields populated ────────────────────────────────────

    @Test
    void buildFullResponse_smokeTest_allFieldsBuilt() {
        Job job = Job.builder().id(42L).position("X").build();
        when(jobRepository.findById(42L)).thenReturn(Optional.of(job));
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        ApplicationResponse res = mapper.buildFullResponse(form, sent);

        assertNotNull(res);
        assertEquals(100L, res.getId());
        assertEquals(7L, res.getUserId());
        assertEquals(42L, res.getJobId());
        assertEquals("Alice", res.getApplicantName());
        assertEquals("hello", res.getIntroduction());
        assertTrue(res.getTimeSent() != null);
    }
}
