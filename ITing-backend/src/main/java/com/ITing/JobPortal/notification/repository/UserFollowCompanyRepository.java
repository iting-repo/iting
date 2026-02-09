package com.iting.jobportal.notification.repository;

import com.iting.jobportal.notification.entity.UserFollowCompany;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserFollowCompanyRepository extends JpaRepository<UserFollowCompany, Long> {

    /**
     * Check if user follows company
     */
    boolean existsByUserIdAndCompanyId(Long userId, Long companyId);

    /**
     * Find specific follow relationship
     */
    Optional<UserFollowCompany> findByUserIdAndCompanyId(Long userId, Long companyId);

    /**
     * Get all companies a user follows (paginated)
     */
    Page<UserFollowCompany> findByUserId(Long userId, Pageable pageable);

    /**
     * Get follower count for a company
     */
    Long countByCompanyId(Long companyId);

    /**
     * Unfollow company (delete relationship)
     */
    @Modifying
    @Query("DELETE FROM UserFollowCompany ufc WHERE ufc.userId = :userId AND ufc.companyId = :companyId")
    void deleteByUserIdAndCompanyId(@Param("userId") Long userId, @Param("companyId") Long companyId);
}
