package com.iting.jobportal.user.service.impl;

import com.iting.jobportal.auth.exception.ResourceNotFoundException;
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

    // ✅ Tìm kiếm trực tiếp bằng Long Id (ID kế thừa từ Account)
    private User getUserEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Override
    public UserProfileResponse getProfile(Long id) {
        User u = getUserEntity(id);

        return UserProfileResponse.builder()
                .userId(u.getId()) // u.getId() chính là AccountId
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getAccount().getEmail())
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
    public void updateBasic(Long id, UpdateUserRequest req) {
        User u = getUserEntity(id);

        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());
        u.setBirthDate(req.getBirthDate());
        u.setSex(req.getGender());
        u.setAvatarUrl(req.getAvatarUrl());
        u.setDescription(req.getDescription());
        u.setAddress(req.getAddress());

        // Cập nhật thông tin email ở bảng Account thông qua quan hệ kế thừa/liên kết
        u.getAccount().setEmail(req.getEmail());
        u.setPhoneNum(req.getPhoneNum());
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

    @Override
    public void updateDescription(Long id, String description) {
        User u = getUserEntity(id);
        u.setDescription(description);
        u.setLastUpdate(LocalDateTime.now());
    }

    @Override
    public void updateAddress(Long id, String address) {
        User u = getUserEntity(id);
        u.setAddress(address);
        u.setLastUpdate(LocalDateTime.now());
    }

    @Override
    public void updateBirthGender(Long id, LocalDate birth, Gender gender) {
        User u = getUserEntity(id);
        u.setBirthDate(birth);
        u.setSex(gender);
        u.setLastUpdate(LocalDateTime.now());
    }
}
