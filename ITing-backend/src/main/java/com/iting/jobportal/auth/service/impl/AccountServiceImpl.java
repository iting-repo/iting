package com.iting.jobportal.auth.service.impl;

import com.iting.jobportal.auth.dto.request.BanRequest;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.BanHistory;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.exception.ResourceNotFoundException;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.repository.BanHistoryRepository;
import com.iting.jobportal.auth.service.AccountService;
import com.iting.jobportal.common.service.EmailService;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

  private final AccountRepository accountRepository;
  private final BanHistoryRepository banHistoryRepository;
  private final EmailService emailService;

  @Transactional
  public void banAccount(Long targetId, BanRequest request, String adminEmail) {
    Account target =
        accountRepository
            .findById(targetId)
            .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

    Account admin =
        accountRepository
            .findByEmail(adminEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

    // 1. Cập nhật trạng thái Account
    target.setStatus(AccountStatus.BANNED);
    accountRepository.save(target);

    // 2. Lưu lịch sử Ban
    BanHistory history =
        BanHistory.builder()
            .targetAccount(target)
            .adminAccount(admin)
            .reason(request.getReason())
            .expiredAt(
                request.getDurationDays() != null
                    ? LocalDateTime.now().plusDays(request.getDurationDays())
                    : null)
            .isActive(true)
            .build();
    banHistoryRepository.save(history);

    // 3. Gửi mail thông báo
    emailService.sendBanNotification(
        target.getEmail(), request.getReason(), request.getDurationDays());
  }

  @Transactional
  public void unbanAccount(Long targetId) {
    Account target =
        accountRepository
            .findById(targetId)
            .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

    // 1. Trả trạng thái về ACTIVE
    target.setStatus(AccountStatus.ACTIVE);
    accountRepository.save(target);

    // 2. Vô hiệu hóa các bản ghi lệnh cấm cũ trong History
    List<BanHistory> histories =
        banHistoryRepository.findByTargetAccountIdAndIsActiveTrue(targetId);
    histories.forEach(h -> h.setIsActive(false));
    banHistoryRepository.saveAll(histories);
  }
}
