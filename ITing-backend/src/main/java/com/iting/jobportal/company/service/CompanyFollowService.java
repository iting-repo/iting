package com.iting.jobportal.company.service;

import com.iting.jobportal.company.dto.response.FollowedCompanyResponse;
import org.springframework.data.domain.Page;

public interface CompanyFollowService {

    /**
     * Follow a company
     * 
     * @param userId    User ID
     * @param companyId Company ID
     */
    void followCompany(Long userId, Long companyId);

    /**
     * Unfollow a company
     * 
     * @param userId    User ID
     * @param companyId Company ID
     */
    void unfollowCompany(Long userId, Long companyId);

    /**
     * Check if user is following a company
     * 
     * @param userId    User ID
     * @param companyId Company ID
     * @return true if following, false otherwise
     */
    boolean isFollowing(Long userId, Long companyId);

    /**
     * Get all companies a user follows (paginated)
     * 
     * @param userId User ID
     * @param page   Page number
     * @param size   Page size
     * @return Page of followed companies
     */
    Page<FollowedCompanyResponse> getFollowedCompanies(Long userId, int page, int size);

    /**
     * Get follower count for a company
     * 
     * @param companyId Company ID
     * @return Number of followers
     */
    Long getFollowerCount(Long companyId);
}
