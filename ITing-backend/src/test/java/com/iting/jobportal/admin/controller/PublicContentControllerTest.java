package com.iting.jobportal.admin.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.entity.Category;
import com.iting.jobportal.admin.entity.StaticContent;
import com.iting.jobportal.admin.repository.CategoryRepository;
import com.iting.jobportal.admin.repository.StaticContentRepository;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class PublicContentControllerTest {

  @Mock private StaticContentRepository contentRepository;
  @Mock private CategoryRepository categoryRepository;
  @Mock private JobRepository jobRepository;
  @Mock private AccountRepository accountRepository;
  @Mock private CompanyRepository companyRepository;

  @InjectMocks private PublicContentController controller;

  // ── getPage ──────────────────────────────────────────────────────────

  @Test
  void getPage_publishedPage_returnsAndIncrementsViewCount() {
    StaticContent page =
        StaticContent.builder().slug("about").title("About").published(true).viewCount(10L).build();
    when(contentRepository.findBySlug("about")).thenReturn(Optional.of(page));

    ResponseEntity<StaticContent> resp = controller.getPage("about");

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertEquals(11L, page.getViewCount(), "viewCount tăng 1");
    verify(contentRepository).save(page);
  }

  @Test
  void getPage_notFound_throws() {
    when(contentRepository.findBySlug("missing")).thenReturn(Optional.empty());

    assertThrows(RuntimeException.class, () -> controller.getPage("missing"));
    verify(contentRepository, never()).save(any(StaticContent.class));
  }

  @Test
  void getPage_unpublished_throws_noViewCountIncrement() {
    StaticContent draft =
        StaticContent.builder().slug("draft").published(false).viewCount(0L).build();
    when(contentRepository.findBySlug("draft")).thenReturn(Optional.of(draft));

    assertThrows(RuntimeException.class, () -> controller.getPage("draft"));
    assertEquals(0L, draft.getViewCount(), "Unpublished không được count");
    verify(contentRepository, never()).save(any(StaticContent.class));
  }

  // ── getFAQs / getBlogs ───────────────────────────────────────────────

  @Test
  void getFAQs_returnsOnlyPublishedFaqs_sortedBySortOrder() {
    List<StaticContent> faqs = List.of(StaticContent.builder().slug("f1").build());
    when(contentRepository.findByTypeAndPublishedOrderBySortOrderAsc("FAQ", true)).thenReturn(faqs);

    ResponseEntity<List<StaticContent>> resp = controller.getFAQs();

    assertSame(faqs, resp.getBody());
  }

  @Test
  void getBlogs_returnsOnlyPublishedBlogs() {
    List<StaticContent> blogs = List.of(StaticContent.builder().slug("b1").build());
    when(contentRepository.findByTypeAndPublishedOrderBySortOrderAsc("BLOG", true))
        .thenReturn(blogs);

    assertSame(blogs, controller.getBlogs().getBody());
  }

  // ── categories ───────────────────────────────────────────────────────

  @Test
  void getIndustries_queriesIndustryType() {
    List<Category> cats = List.of(new Category());
    when(categoryRepository.findByTypeAndActiveOrderBySortOrderAsc("INDUSTRY", true))
        .thenReturn(cats);

    assertSame(cats, controller.getIndustries().getBody());
  }

  @Test
  void getSkills_queriesSkillType() {
    when(categoryRepository.findByTypeAndActiveOrderBySortOrderAsc("SKILL", true))
        .thenReturn(List.of());
    controller.getSkills();
    verify(categoryRepository).findByTypeAndActiveOrderBySortOrderAsc("SKILL", true);
  }

  @Test
  void getLocations_queriesLocationType() {
    when(categoryRepository.findByTypeAndActiveOrderBySortOrderAsc("LOCATION", true))
        .thenReturn(List.of());
    controller.getLocations();
    verify(categoryRepository).findByTypeAndActiveOrderBySortOrderAsc("LOCATION", true);
  }

  @Test
  void getCategoriesByType_uppercasesParam() {
    when(categoryRepository.findByTypeAndActiveOrderBySortOrderAsc("INDUSTRY", true))
        .thenReturn(List.of());

    controller.getCategoriesByType("industry");

    verify(categoryRepository).findByTypeAndActiveOrderBySortOrderAsc("INDUSTRY", true);
  }

  // ── getStats ─────────────────────────────────────────────────────────

  @Test
  void getStats_aggregatesAcrossRepos() {
    when(jobRepository.countByStatus(JobStatus.ACTIVE)).thenReturn(500L);
    when(jobRepository.countByStatusAndCreatedAtAfter(
            eq(JobStatus.ACTIVE), any(LocalDateTime.class)))
        .thenReturn(10L);
    when(accountRepository.countByRole(Role.CANDIDATE)).thenReturn(800L);
    when(accountRepository.countByRole(Role.USER)).thenReturn(200L);
    when(companyRepository.count()).thenReturn(50L);

    ResponseEntity<Map<String, Long>> resp = controller.getStats();

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    Map<String, Long> body = resp.getBody();
    assertNotNull(body);
    assertEquals(500L, body.get("totalJobs"));
    assertEquals(10L, body.get("newJobs24h"));
    assertEquals(1000L, body.get("totalCandidates"), "Cộng cả CANDIDATE + USER legacy");
    assertEquals(50L, body.get("totalCompanies"));
  }

  // ── helpers ──────────────────────────────────────────────────────────

  private static <T> T eq(T v) {
    return org.mockito.ArgumentMatchers.eq(v);
  }

  private static <T> T any(Class<T> c) {
    return org.mockito.ArgumentMatchers.any(c);
  }
}
