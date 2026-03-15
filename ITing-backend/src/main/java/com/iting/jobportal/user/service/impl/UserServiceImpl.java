package com.iting.jobportal.user.service.impl;

import com.iting.jobportal.auth.exception.ResourceNotFoundException;
import com.iting.jobportal.user.dto.request.PersonalUpdateDto;
import com.iting.jobportal.user.dto.request.UpdateUserRequest;
import com.iting.jobportal.user.dto.response.UserProfileResponse;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.user.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private User getUserEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Override
    public UserProfileResponse getProfile(Long id) {
        User u = getUserEntity(id);

        return UserProfileResponse.builder()
                .userId(u.getId())
                .fullName(u.getFullName())
                .email(u.getAccount().getEmail())
                .phoneNum(u.getPhoneNum())
                .locId(u.getLocId())
                .avatarUrl(u.getAvatarUrl())
                .lastUpdate(u.getLastUpdate())
                .build();
    }

    @Override
    public void updateBasic(Long id, UpdateUserRequest req) {
        User u = getUserEntity(id);

        u.setFullName(req.getFullName());
        u.setAvatarUrl(req.getAvatarUrl());
        u.getAccount().setEmail(req.getEmail());
        u.setPhoneNum(req.getPhoneNum());
        u.setLastUpdate(LocalDateTime.now());
    }

    @Override
    public void updatePersonal(Long id, PersonalUpdateDto dto) {
        User u = getUserEntity(id);

        u.setFullName(dto.getFullName());
        u.setPhoneNum(dto.getPhoneNum());
        if (dto.getAvatarUrl() != null) {
            u.setAvatarUrl(dto.getAvatarUrl());
        }
        u.setLastUpdate(LocalDateTime.now());
    }

    @Override
    public void updateAvatar(Long id, String url) {
        User u = getUserEntity(id);
        u.setAvatarUrl(url);
        u.setLastUpdate(LocalDateTime.now());
    }

    @Override
    public void deleteAvatar(Long id) {
        User u = getUserEntity(id);
        u.setAvatarUrl(null);
        u.setLastUpdate(LocalDateTime.now());
    }
}

