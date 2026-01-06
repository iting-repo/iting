package com.iting.jobportal.user.service.impl;

import com.iting.jobportal.user.dto.UpdateUserRequest;
import com.iting.jobportal.user.dto.UserProfileResponse;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.entity.enums.Gender;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.user.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    // ✅ dùng nội bộ cho các hàm update
    private User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ✅ dùng cho API GET /profile
    @Override
    public UserProfileResponse getProfile(Long userId) {
        User u = getUserEntity(userId);

        return UserProfileResponse.builder()
                .userId(u.getUserId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .phoneNum(u.getPhoneNum())
                .birthDate(u.getBirthDate())
                .sex(u.getSex())
                .avatarUrl(u.getAvatarUrl())
                .description(u.getDescription())
                .address(u.getAddress())
                .lastUpdate(u.getLastUpdate())
                .build();
    }

    @Override
    public void updateBasic(Long userId, UpdateUserRequest req) {
        User u = getUserEntity(userId);

        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());
        u.setBirthDate(req.getBirthDate());
        u.setSex(req.getGender());
        u.setAvatarUrl(req.getAvatarUrl());
        u.setDescription(req.getDescription());
        u.setAddress(req.getAddress());

        u.setEmail(req.getEmail());
        u.setPhoneNum(req.getPhoneNum());

        u.setLastUpdate(LocalDateTime.now());
        // không cần save nếu @Transactional + entity managed
    }

    @Override
    public void updateAvatar(Long userId, String url) {
        User u = getUserEntity(userId);
        u.setAvatarUrl(url);
        u.setLastUpdate(LocalDateTime.now());
    }

    @Override
    public void deleteAvatar(Long userId) {
        User u = getUserEntity(userId);
        u.setAvatarUrl(null);
        u.setLastUpdate(LocalDateTime.now());
    }

    @Override
    public void updateDescription(Long userId, String description) {
        User u = getUserEntity(userId);
        u.setDescription(description);
        u.setLastUpdate(LocalDateTime.now());
    }

    @Override
    public void updateAddress(Long userId, String address) {
        User u = getUserEntity(userId);
        u.setAddress(address);
        u.setLastUpdate(LocalDateTime.now());
    }

    @Override
    public void updateBirthGender(Long userId, LocalDate birth, Gender gender) {
        User u = getUserEntity(userId);
        u.setBirthDate(birth);
        u.setSex(gender);
        u.setLastUpdate(LocalDateTime.now());
    }
}
