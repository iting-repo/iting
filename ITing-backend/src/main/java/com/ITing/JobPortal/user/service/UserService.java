package com.iting.jobportal.user.service;
import com.iting.jobportal.user.dto.*;
import com.iting.jobportal.user.entity.*;
import com.iting.jobportal.user.entity.enums.Gender;
import com.iting.jobportal.userprofile.entity.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public interface UserService {

    User getProfile(Long userId);

    void updateBasic(Long userId, UpdateUserRequest req);

    void updateAvatar(Long userId, String url);

    void deleteAvatar(Long userId);

    void updateDescription(Long userId, String description);

    void updateAddress(Long userId, String address);

    void updateBirthGender(Long userId, LocalDate birthDate, Gender gender);

    }
