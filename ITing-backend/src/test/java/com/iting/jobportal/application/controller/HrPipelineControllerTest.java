package com.iting.jobportal.application.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.iting.jobportal.application.entity.HrEmailTemplate;
import com.iting.jobportal.application.repository.CandidateApplicationRepository;
import com.iting.jobportal.application.repository.HrEmailTemplateRepository;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.common.service.EmailService;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.service.AuthorizationService;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.notification.service.NotificationService;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class HrPipelineControllerTest {

  @Mock private CandidateApplicationRepository applicationRepository;
  @Mock private HrEmailTemplateRepository templateRepository;
  @Mock private JobRepository jobRepository;
  @Mock private AccountRepository accountRepository;
  @Mock private EmailService emailService;
  @Mock private AuthorizationService authorizationService;
  @Mock private JwtTokenUtil jwtTokenUtil;
  @Mock private NotificationService notificationService;
  @Mock private EntityManager em;
  @Mock private HttpServletRequest request;

  @InjectMocks private HrPipelineController controller;

  @BeforeEach
  void setupEm() throws Exception {
    // EntityManager is @PersistenceContext (field injection),
    // Mockito's @InjectMocks không inject @PersistenceContext fields → set thủ công.
    Field f = HrPipelineController.class.getDeclaredField("em");
    f.setAccessible(true);
    f.set(controller, em);
  }

  // ── stages list ──────────────────────────────────────────────────────

  @Test
  void stages_returnsHardcodedList() {
    ResponseEntity<List<String>> resp = controller.stages();

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    List<String> stages = resp.getBody();
    assertNotNull(stages);
    assertTrue(
        stages.containsAll(
            List.of("SCREENING", "PHONE_SCREEN", "INTERVIEW", "OFFER", "HIRED", "REJECTED")));
  }

  // ── listTemplates ────────────────────────────────────────────────────

  @Test
  void listTemplates_delegatesToRepoWithCompanyId() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(99L);
    when(authorizationService.requireApprovedCompanyOf(99L)).thenReturn(10L);
    List<HrEmailTemplate> tpls = List.of();
    when(templateRepository.findByCompanyIdOrCompanyIdIsNullOrderByTemplateTypeAsc(10L))
        .thenReturn(tpls);

    ResponseEntity<List<HrEmailTemplate>> resp = controller.listTemplates(request);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertEquals(tpls, resp.getBody());
  }

  @Test
  void listTemplates_unauth_throws401() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.listTemplates(request));
    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
  }

  // ── createTemplate ───────────────────────────────────────────────────

  @Test
  void createTemplate_buildsEntityFromBody() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(99L);
    when(authorizationService.requireApprovedCompanyOf(99L)).thenReturn(10L);
    when(templateRepository.save(any(HrEmailTemplate.class))).thenAnswer(inv -> inv.getArgument(0));

    Map<String, Object> body =
        Map.of(
            "name", "Custom interview",
            "templateType", "INTERVIEW_INVITE",
            "subject", "Phỏng vấn vị trí {{job_title}}",
            "body", "Chào {{candidate_name}}");

    ResponseEntity<HrEmailTemplate> resp = controller.createTemplate(body, request);

    ArgumentCaptor<HrEmailTemplate> cap = ArgumentCaptor.forClass(HrEmailTemplate.class);
    org.mockito.Mockito.verify(templateRepository).save(cap.capture());
    HrEmailTemplate saved = cap.getValue();
    assertEquals(10L, saved.getCompanyId(), "companyId từ HR's authorized company");
    assertEquals(99L, saved.getCreatedBy());
    assertEquals("Custom interview", saved.getName());
    assertEquals("INTERVIEW_INVITE", saved.getTemplateType());
    assertEquals("Phỏng vấn vị trí {{job_title}}", saved.getSubject());
    assertEquals("Chào {{candidate_name}}", saved.getBody());
    assertEquals(false, saved.getIsDefault(), "User-created template KHÔNG default");
    assertEquals(HttpStatus.OK, resp.getStatusCode());
  }

  @Test
  void createTemplate_unauth_throws401() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);
    assertThrows(ResponseStatusException.class, () -> controller.createTemplate(Map.of(), request));
  }

  // ── moveStage: validation cases ─────────────────────────────────────

  @Test
  void moveStage_unauth_throws401() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> controller.moveStage(1L, 2L, Map.of("toStage", "INTERVIEW"), request));
    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
  }

  @Test
  void moveStage_invalidStage_throws400() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(99L);
    when(authorizationService.requireApprovedCompanyOf(99L)).thenReturn(10L);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> controller.moveStage(1L, 2L, Map.of("toStage", "INVALID_STAGE"), request));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertTrue(ex.getReason().contains("INVALID_STAGE"));
  }

  @Test
  void moveStage_missingToStage_throws400() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(99L);
    when(authorizationService.requireApprovedCompanyOf(99L)).thenReturn(10L);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> controller.moveStage(1L, 2L, Map.of(), request));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
  }

  @Test
  void moveStage_jobNotFound_throws404() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(99L);
    when(authorizationService.requireApprovedCompanyOf(99L)).thenReturn(10L);
    when(jobRepository.findById(2L)).thenReturn(Optional.empty());

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> controller.moveStage(1L, 2L, Map.of("toStage", "INTERVIEW"), request));
    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
  }

  @Test
  void moveStage_jobBelongsToOtherCompany_throws403() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(99L);
    when(authorizationService.requireApprovedCompanyOf(99L)).thenReturn(10L);
    Company otherCompany = new Company();
    otherCompany.setId(20L);
    Job job = Job.builder().id(2L).company(otherCompany).build();
    when(jobRepository.findById(2L)).thenReturn(Optional.of(job));

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> controller.moveStage(1L, 2L, Map.of("toStage", "INTERVIEW"), request));
    assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
  }

  @Test
  void moveStage_jobWithNullCompany_throws403() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(99L);
    when(authorizationService.requireApprovedCompanyOf(99L)).thenReturn(10L);
    Job job = Job.builder().id(2L).company(null).build();
    when(jobRepository.findById(2L)).thenReturn(Optional.of(job));

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> controller.moveStage(1L, 2L, Map.of("toStage", "INTERVIEW"), request));
    assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
  }

  // ── kanbanByJob: auth + ownership ───────────────────────────────────

  @Test
  void kanbanByJob_unauth_throws401() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.kanbanByJob(2L, request));
    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
  }

  @Test
  void kanbanByJob_jobNotFound_throws404() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(99L);
    when(authorizationService.requireApprovedCompanyOf(99L)).thenReturn(10L);
    when(jobRepository.findById(2L)).thenReturn(Optional.empty());

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.kanbanByJob(2L, request));
    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
  }

  @Test
  void kanbanByJob_otherCompany_throws403() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(99L);
    when(authorizationService.requireApprovedCompanyOf(99L)).thenReturn(10L);
    Company otherCompany = new Company();
    otherCompany.setId(20L);
    Job job = Job.builder().id(2L).company(otherCompany).build();
    when(jobRepository.findById(2L)).thenReturn(Optional.of(job));

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.kanbanByJob(2L, request));
    assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
  }
}
