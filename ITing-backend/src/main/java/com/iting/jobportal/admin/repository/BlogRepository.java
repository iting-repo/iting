package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {

    Optional<Blog> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("SELECT b FROM Blog b WHERE " +
           "(CAST(:keyword AS text) IS NULL OR LOWER(CAST(b.title AS text)) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%'))) AND " +
           "(CAST(:status AS text) IS NULL OR b.status = :status)")
    Page<Blog> searchBlogs(
            @Param("keyword") String keyword,
            @Param("status") String status,
            Pageable pageable);
}
