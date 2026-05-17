package com.iting.jobportal.userprofile.service;

import com.iting.jobportal.userprofile.dto.response.CVResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface CVService {
    /**
     * Get the 3 most recent CVs for a user
     */
    List<CVResponse> getRecentCVs(Long userId);

    /**
     * Upload a new CV for a user
     * Automatically manages CV limit (max 3 CVs)
     */
    CVResponse uploadCV(Long userId, MultipartFile file, String title) throws IOException;

    /**
     * Delete oldest CV if user has more than 3 CVs
     */
    void manageUserCVLimit(Long userId);
}
