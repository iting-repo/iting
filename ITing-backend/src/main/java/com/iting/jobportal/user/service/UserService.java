package com.iting.jobportal.user.service;
import com.iting.jobportal.user.dto.*;
import com.iting.jobportal.user.entity.*;
import com.iting.jobportal.user.entity.enums.Gender;
import com.iting.jobportal.userprofile.entity.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public interface UserService {

    UserProfileResponse getProfile(String userId);

    void updateBasic(String userId, UpdateUserRequest req);

    void updateAvatar(String userId, String url);

    void deleteAvatar(String userId);

    void updateDescription(String userId, String description);

    void updateAddress(String userId, String address);

    void updateBirthGender(String userId, LocalDate birthDate, Gender gender);

    String uploadAvatar(String userId, org.springframework.web.multipart.MultipartFile file);

    }
