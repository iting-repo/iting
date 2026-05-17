package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.Blog;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("integration")
@EnableJpaRepositories(basePackages = "com.iting.jobportal")
@EntityScan(basePackages = "com.iting.jobportal")
class BlogRepositoryIT {

    @Autowired private BlogRepository blogRepository;
    @Autowired private TestEntityManager em;

    @BeforeEach
    void setUp() {
        // each test uses a transaction that rolls back, so no manual cleanup
    }

    // ── findBySlug / existsBySlug ─────────────────────────────────

    @Test
    @DisplayName("findBySlug returns the blog when slug matches")
    void findBySlug_returnsBlog() {
        em.persistAndFlush(blog("Spring Boot Guide", "spring-boot-guide", "PUBLISHED"));

        Optional<Blog> result = blogRepository.findBySlug("spring-boot-guide");

        assertThat(result).isPresent();
        assertThat(result.get().getTitle()).isEqualTo("Spring Boot Guide");
    }

    @Test
    @DisplayName("findBySlug returns empty when no match")
    void findBySlug_returnsEmpty() {
        Optional<Blog> result = blogRepository.findBySlug("non-existent");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("existsBySlug returns true/false correctly")
    void existsBySlug_returnsCorrectBoolean() {
        em.persistAndFlush(blog("Java Tutorial", "java-tutorial", "PUBLISHED"));

        assertThat(blogRepository.existsBySlug("java-tutorial")).isTrue();
        assertThat(blogRepository.existsBySlug("python-tutorial")).isFalse();
    }

    @Test
    @DisplayName("Unique constraint on slug throws when duplicating")
    void uniqueSlugConstraint_isEnforced() {
        em.persistAndFlush(blog("First", "duplicate-slug", "PUBLISHED"));

        Blog second = blog("Second", "duplicate-slug", "PUBLISHED");

        assertThatThrownBy(() -> em.persistAndFlush(second))
                .isInstanceOf(Exception.class);  // either DataIntegrityViolation or PersistenceException
    }

    // ── searchBlogs ───────────────────────────────────────────────

    @Test
    @DisplayName("searchBlogs with both filters null returns all blogs")
    void searchBlogs_withNullFilters_returnsAll() {
        em.persistAndFlush(blog("A", "a-slug", "PUBLISHED"));
        em.persistAndFlush(blog("B", "b-slug", "DRAFT"));

        Page<Blog> result = blogRepository.searchBlogs(null, null, PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(2);
    }

    @Test
    @DisplayName("searchBlogs filters by status")
    void searchBlogs_filtersByStatus() {
        em.persistAndFlush(blog("Published Post", "pub-post", "PUBLISHED"));
        em.persistAndFlush(blog("Draft Post", "draft-post", "DRAFT"));
        em.persistAndFlush(blog("Another Published", "ano-pub", "PUBLISHED"));

        Page<Blog> result = blogRepository.searchBlogs(null, "PUBLISHED", PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent())
                .extracting(Blog::getStatus)
                .containsOnly("PUBLISHED");
    }

    @Test
    @DisplayName("searchBlogs filters by keyword (case-insensitive)")
    void searchBlogs_keywordFilterIsCaseInsensitive() {
        em.persistAndFlush(blog("Spring Boot Guide", "spring-1", "PUBLISHED"));
        em.persistAndFlush(blog("Java Programming", "java-1", "PUBLISHED"));
        em.persistAndFlush(blog("Spring Security Tutorial", "spring-2", "PUBLISHED"));

        Page<Blog> result = blogRepository.searchBlogs("spring", null, PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(2);
    }

    @Test
    @DisplayName("searchBlogs combines keyword + status filters")
    void searchBlogs_combinesFilters() {
        em.persistAndFlush(blog("Spring Published", "sp-1", "PUBLISHED"));
        em.persistAndFlush(blog("Spring Draft", "sp-2", "DRAFT"));
        em.persistAndFlush(blog("Java Published", "jv-1", "PUBLISHED"));

        Page<Blog> result = blogRepository.searchBlogs("spring", "PUBLISHED", PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Spring Published");
    }

    @Test
    @DisplayName("searchBlogs paginates correctly")
    void searchBlogs_paginates() {
        for (int i = 0; i < 25; i++) {
            em.persistAndFlush(blog("Title " + i, "slug-" + i, "PUBLISHED"));
        }

        Page<Blog> page1 = blogRepository.searchBlogs(null, null, PageRequest.of(0, 10));
        Page<Blog> page3 = blogRepository.searchBlogs(null, null, PageRequest.of(2, 10));

        assertThat(page1.getContent()).hasSize(10);
        assertThat(page3.getContent()).hasSize(5);
        assertThat(page1.getTotalPages()).isEqualTo(3);
    }

    // ── helper ────────────────────────────────────────────────────

    private Blog blog(String title, String slug, String status) {
        return Blog.builder()
                .title(title)
                .slug(slug)
                .status(status)
                .isFeatured(false)
                .build();
    }
}
