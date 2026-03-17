package com.iting.jobportal.user.service;
import com.iting.jobportal.user.dto.request.PersonalUpdateDto;
import com.iting.jobportal.user.dto.request.UpdateUserRequest;
import com.iting.jobportal.user.dto.response.UserProfileResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    // Thay String userId thành Long id để khớp với Account Id
    UserProfileResponse getProfile(Long id);

    void updateBasic(Long id, UpdateUserRequest req);

    void updatePersonal(Long id, PersonalUpdateDto dto);

    void updateAvatar(Long id, String url);

    void deleteAvatar(Long id);

    String uploadAvatar(Long id, MultipartFile file);
}


