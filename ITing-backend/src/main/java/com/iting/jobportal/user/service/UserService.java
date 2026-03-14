package com.iting.jobportal.user.service;
import com.iting.jobportal.user.dto.*;
import com.iting.jobportal.user.entity.*;
import com.iting.jobportal.user.entity.enums.Gender;
import com.iting.jobportal.userprofile.entity.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public interface UserService {
    // Thay String userId thành Long id để khớp với Account Id
    UserProfileResponse getProfile(Long id);

    void updateBasic(Long id, UpdateUserRequest req);

    void updateAvatar(Long id, String url);

    void deleteAvatar(Long id);

    void updateDescription(Long id, String description);

    void updateAddress(Long id, String address);

    void updateAddress(String userId, String address);

    void updateBirthGender(String userId, LocalDate birthDate, Gender gender);

    String uploadAvatar(String userId, org.springframework.web.multipart.MultipartFile file);

    }
