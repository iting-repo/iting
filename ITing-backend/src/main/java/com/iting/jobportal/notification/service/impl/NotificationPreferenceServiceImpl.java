package com.iting.jobportal.notification.service.impl;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.notification.dto.NotificationPreferenceDto;
import com.iting.jobportal.notification.entity.NotificationPreference;
import com.iting.jobportal.notification.repository.NotificationPreferenceRepository;
import com.iting.jobportal.notification.service.NotificationPreferenceService;
import java.time.LocalTime;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class NotificationPreferenceServiceImpl implements NotificationPreferenceService {

  private final NotificationPreferenceRepository repository;
  private final AccountRepository accountRepository;

  @Override
  @Transactional
  public NotificationPreferenceDto getOrCreate(Long accountId) {
    NotificationPreference pref =
        repository.findById(accountId).orElseGet(() -> createDefault(accountId));
    return NotificationPreferenceDto.fromEntity(pref);
  }

  @Override
  @Transactional
  public NotificationPreferenceDto update(Long accountId, NotificationPreferenceDto dto) {
    NotificationPreference pref =
        repository.findById(accountId).orElseGet(() -> createDefault(accountId));

    // Partial update: chỉ override nếu DTO có giá trị (không null)
    if (dto.getJobAlerts() != null) pref.setJobAlerts(dto.getJobAlerts());
    if (dto.getApplicationUpdates() != null)
      pref.setApplicationUpdates(dto.getApplicationUpdates());
    if (dto.getNewMessages() != null) pref.setNewMessages(dto.getNewMessages());
    if (dto.getRecommendations() != null) pref.setRecommendations(dto.getRecommendations());
    if (dto.getSystemUpdates() != null) pref.setSystemUpdates(dto.getSystemUpdates());
    if (dto.getPromotions() != null) pref.setPromotions(dto.getPromotions());
    if (dto.getWeeklyDigest() != null) pref.setWeeklyDigest(dto.getWeeklyDigest());
    if (dto.getFollowedCompanies() != null) pref.setFollowedCompanies(dto.getFollowedCompanies());

    if (dto.getEmailEnabled() != null) pref.setEmailEnabled(dto.getEmailEnabled());
    if (dto.getPushEnabled() != null) pref.setPushEnabled(dto.getPushEnabled());
    if (dto.getSmsEnabled() != null) pref.setSmsEnabled(dto.getSmsEnabled());
    if (dto.getSoundEnabled() != null) pref.setSoundEnabled(dto.getSoundEnabled());

    if (dto.getQuietHoursEnabled() != null) pref.setQuietHoursEnabled(dto.getQuietHoursEnabled());
    if (dto.getQuietHoursFrom() != null) pref.setQuietHoursFrom(dto.getQuietHoursFrom());
    if (dto.getQuietHoursTo() != null) pref.setQuietHoursTo(dto.getQuietHoursTo());

    // Edge case: nếu bật quiet hours mà from == to → ném 400 để tránh "im lặng cả ngày" vô tình
    if (Boolean.TRUE.equals(pref.getQuietHoursEnabled())
        && pref.getQuietHoursFrom() != null
        && pref.getQuietHoursFrom().equals(pref.getQuietHoursTo())) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Giờ bắt đầu và kết thúc của chế độ im lặng không được trùng nhau.");
    }

    return NotificationPreferenceDto.fromEntity(repository.save(pref));
  }

  private NotificationPreference createDefault(Long accountId) {
    Account account =
        accountRepository
            .findById(accountId)
            .orElseThrow(
                () ->
                    new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản"));
    NotificationPreference pref =
        NotificationPreference.builder()
            .account(account)
            .jobAlerts(true)
            .applicationUpdates(true)
            .newMessages(true)
            .recommendations(true)
            .systemUpdates(false)
            .promotions(false)
            .weeklyDigest(true)
            .followedCompanies(true)
            .emailEnabled(true)
            .pushEnabled(true)
            .smsEnabled(false)
            .soundEnabled(true)
            .quietHoursEnabled(false)
            .quietHoursFrom(LocalTime.of(22, 0))
            .quietHoursTo(LocalTime.of(7, 0))
            .build();
    return repository.save(pref);
  }
}
