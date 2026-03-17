package com.iting.jobportal.user.service.impl;

import com.iting.jobportal.auth.exception.ResourceNotFoundException;
import com.iting.jobportal.file.FileUploadService;
import com.iting.jobportal.user.dto.request.PersonalUpdateDto;
import com.iting.jobportal.user.dto.request.UpdateUserRequest;
import com.iting.jobportal.user.dto.response.UserProfileResponse;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.user.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;

    private User getUserEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Override
    public UserProfileResponse getProfile(Long id) {
        User user = getUserEntity(id);

        return UserProfileResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getAccount() != null ? user.getAccount().getEmail() : null)
                .phoneNum(user.getPhoneNum())
                .locId(user.getLocId())
                .avatarUrl(user.getAvatarUrl())
                .lastUpdate(user.getLastUpdate())
                .build();
    }

    @Override
    public void updateBasic(Long id, UpdateUserRequest req) {
        User user = getUserEntity(id);

        user.setFullName(req.getFullName());
        user.setPhoneNum(req.getPhoneNum());
        user.setAvatarUrl(req.getAvatarUrl());
        user.setLastUpdate(LocalDateTime.now());

        if (user.getAccount() != null && req.getEmail() != null) {
            user.getAccount().setEmail(req.getEmail());
        }
    }

    @Override
    public void updatePersonal(Long id, PersonalUpdateDto dto) {
        User user = getUserEntity(id);

        if (dto.getFullName() != null) {
            user.setFullName(dto.getFullName());
        }

        if (dto.getPhoneNum() != null) {
            user.setPhoneNum(dto.getPhoneNum());
        }

        if (dto.getAvatarUrl() != null) {
            user.setAvatarUrl(dto.getAvatarUrl());
        }

        user.setLastUpdate(LocalDateTime.now());
    }

    @Override
    public void updateAvatar(Long id, String url) {
        User user = getUserEntity(id);
        user.setAvatarUrl(url);
        user.setLastUpdate(LocalDateTime.now());
    }

    @Override
    public void deleteAvatar(Long id) {
        User user = getUserEntity(id);
        user.setAvatarUrl(null);
        user.setLastUpdate(LocalDateTime.now());
    }

    @Override
    public String uploadAvatar(Long id, MultipartFile file) {
        String avatarUrl = fileUploadService.uploadAvatar(file);

        User user = getUserEntity(id);
        user.setAvatarUrl(avatarUrl);
        user.setLastUpdate(LocalDateTime.now());

        return avatarUrl;
    }
}