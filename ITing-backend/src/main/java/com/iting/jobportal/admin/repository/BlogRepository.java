package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.Blog;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {

  Optional<Blog> findBySlug(String slug);

  boolean existsBySlug(String slug);

  @Query(
      "SELECT b FROM Blog b WHERE (:keyword IS NULL OR :keyword = '' OR LOWER(b.title) LIKE"
          + " LOWER(CONCAT('%', :keyword, '%'))) AND (:status IS NULL OR :status = '' OR b.status ="
          + " :status)")
  Page<Blog> searchBlogs(
      @Param("keyword") String keyword, @Param("status") String status, Pageable pageable);

  @Modifying
  @Query("UPDATE Blog b SET b.viewCount = b.viewCount + 1 WHERE b.id = :id")
  void incrementViewCount(@Param("id") Long id);

  @Query("SELECT b FROM Blog b WHERE b.status = 'PUBLISHED' ORDER BY b.viewCount DESC")
  List<Blog> findTopViewed(Pageable pageable);
}
