package com.iting.jobportal.user.service.impl;

import com.iting.jobportal.auth.exception.ResourceNotFoundException;
import com.iting.jobportal.file.FileUploadService;
import com.iting.jobportal.file.FileValidator;
import com.iting.jobportal.user.dto.request.PersonalUpdateDto;
import com.iting.jobportal.user.dto.request.UpdateUserRequest;
import com.iting.jobportal.user.dto.response.UserProfileResponse;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.user.service.UserService;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;
  private final FileUploadService fileUploadService;
  private final FileValidator fileValidator;

  private User getUserEntity(Long id) {
    return userRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
  }

  @Override
  public UserProfileResponse getProfile(Long id) {
    User user = getUserEntity(id);
    var account = user.getAccount();

    return UserProfileResponse.builder()
        .userId(user.getId())
        .fullName(account != null ? account.getFullName() : null)
        .email(account != null ? account.getEmail() : null)
        .phoneNum(account != null ? account.getPhone() : null)
        .locId(user.getLocId())
        .avatarUrl(account != null ? account.getAvatarUrl() : null)
        .lastUpdate(user.getLastUpdate())
        .build();
  }

  @Override
  public void updateBasic(Long id, UpdateUserRequest req) {
    User user = getUserEntity(id);
    var account = user.getAccount();

    if (account != null) {
      account.setFullName(req.getFullName());
      account.setPhone(req.getPhoneNum());
      account.setAvatarUrl(req.getAvatarUrl());
      if (req.getEmail() != null) {
        account.setEmail(req.getEmail());
      }
    }
    user.setLastUpdate(LocalDateTime.now());
  }

  @Override
  public void updatePersonal(Long id, PersonalUpdateDto dto) {
    User user = getUserEntity(id);
    var account = user.getAccount();

    if (account != null) {
      if (dto.getFullName() != null) {
        account.setFullName(dto.getFullName());
      }
      if (dto.getPhoneNum() != null) {
        account.setPhone(dto.getPhoneNum());
      }
      if (dto.getAvatarUrl() != null) {
        account.setAvatarUrl(dto.getAvatarUrl());
      }
    }

    user.setLastUpdate(LocalDateTime.now());
  }

  @Override
  public void updateAvatar(Long id, String url) {
    User user = getUserEntity(id);
    if (user.getAccount() != null) {
      user.getAccount().setAvatarUrl(url);
    }
    user.setLastUpdate(LocalDateTime.now());
  }

  @Override
  public void deleteAvatar(Long id) {
    User user = getUserEntity(id);
    if (user.getAccount() != null) {
      user.getAccount().setAvatarUrl(null);
    }
    user.setLastUpdate(LocalDateTime.now());
  }

  @Override
  public String uploadAvatar(Long id, MultipartFile file) {
    fileValidator.validate(file, FileValidator.Category.AVATAR);
    String avatarUrl = fileUploadService.uploadAvatar(file);

    User user = getUserEntity(id);
    if (user.getAccount() != null) {
      user.getAccount().setAvatarUrl(avatarUrl);
    }
    user.setLastUpdate(LocalDateTime.now());

    return avatarUrl;
  }
}
