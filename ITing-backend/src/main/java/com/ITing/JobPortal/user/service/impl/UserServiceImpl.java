package com.iting.jobportal.user.service.impl;

import com.iting.jobportal.user.entity.enums.Gender;
import com.iting.jobportal.user.service.UserService;

import java.time.LocalDate;

import com.iting.jobportal.user.dto.UpdateUserRequest;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User getProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public void updateBasic(Long userId, UpdateUserRequest req) {
        User u = getProfile(userId);

        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());
        u.setBirthDate(req.getBirthDate());
        u.setSex(req.getGender());
        u.setAvatarUrl(req.getAvatarUrl());
        u.setDescription(req.getDescription());
        u.setAddress(req.getAddress());
        u.setLastUpdate(LocalDateTime.now());
    }

    @Override
    public void updateAvatar(Long userId, String url) {
        User u = getProfile(userId);
        u.setAvatarUrl(url);
    }

    @Override
    public void deleteAvatar(Long userId) {
        User u = getProfile(userId);
        u.setAvatarUrl(null);
    }

    @Override
    public void updateDescription(Long userId, String description) {
        User u = getProfile(userId);
        u.setDescription(description);
    }

    @Override
    public void updateAddress(Long userId, String address) {
        User u = getProfile(userId);
        u.setAddress(address);
    }

    @Override
    public void updateBirthGender(Long userId, LocalDate birth, Gender gender) {
        User u = getProfile(userId);
        u.setBirthDate(birth);
        u.setSex(gender);
    }
}

