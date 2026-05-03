package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.StaticContent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StaticContentRepository extends JpaRepository<StaticContent, Long> {

    Optional<StaticContent> findBySlug(String slug);

    List<StaticContent> findByTypeAndPublishedOrderBySortOrderAsc(String type, Boolean published);

    Page<StaticContent> findByType(String type, Pageable pageable);

    Page<StaticContent> findByTypeAndPublished(String type, Boolean published, Pageable pageable);

    Page<StaticContent> findByTypeAndTitleContainingIgnoreCase(String type, String title, Pageable pageable);

    Page<StaticContent> findByTypeAndPublishedAndTitleContainingIgnoreCase(
            String type, Boolean published, String title, Pageable pageable);

    boolean existsBySlug(String slug);
}

