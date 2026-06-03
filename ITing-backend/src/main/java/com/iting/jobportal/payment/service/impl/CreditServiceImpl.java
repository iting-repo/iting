package com.iting.jobportal.payment.service.impl;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.payment.entity.CreditTransaction;
import com.iting.jobportal.payment.repository.CreditTransactionRepository;
import com.iting.jobportal.payment.service.CreditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditServiceImpl implements CreditService {

  private final AccountRepository accountRepository;
  private final CreditTransactionRepository txRepository;

  @Override
  @Transactional(readOnly = true)
  public int getBalance(Long accountId) {
    Account account =
        accountRepository
            .findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found: " + accountId));
    return account.getCredits() != null ? account.getCredits() : 0;
  }

  @Override
  @Transactional
  public CreditTransaction grant(
      Long accountId, int amount, String source, Long referenceId, String description) {
    if (amount <= 0) {
      throw new IllegalArgumentException("Grant amount must be positive: " + amount);
    }
    Account account =
        accountRepository
            .findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found: " + accountId));

    int current = account.getCredits() != null ? account.getCredits() : 0;
    int next = current + amount;
    account.setCredits(next);
    accountRepository.save(account);

    log.info(
        "[CREDIT] grant account={} amount={} source={} balance {}→{}",
        accountId,
        amount,
        source,
        current,
        next);

    return txRepository.save(
        CreditTransaction.builder()
            .account(account)
            .amount(amount)
            .balanceAfter(next)
            .source(source)
            .referenceId(referenceId)
            .description(description)
            .build());
  }

  @Override
  @Transactional
  public CreditTransaction consume(
      Long accountId, int amount, String source, Long referenceId, String description) {
    if (amount <= 0) {
      throw new IllegalArgumentException("Consume amount must be positive: " + amount);
    }
    Account account =
        accountRepository
            .findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found: " + accountId));

    int current = account.getCredits() != null ? account.getCredits() : 0;
    if (current < amount) {
      throw new InsufficientCreditException(
          "Không đủ credits. Cần " + amount + ", hiện có " + current);
    }
    int next = current - amount;
    account.setCredits(next);
    accountRepository.save(account);

    log.info(
        "[CREDIT] consume account={} amount={} source={} balance {}→{}",
        accountId,
        amount,
        source,
        current,
        next);

    return txRepository.save(
        CreditTransaction.builder()
            .account(account)
            .amount(-amount)
            .balanceAfter(next)
            .source(source)
            .referenceId(referenceId)
            .description(description)
            .build());
  }

  @Override
  @Transactional(readOnly = true)
  public Page<CreditTransaction> getHistory(Long accountId, Pageable pageable) {
    return txRepository.findByAccount_IdOrderByCreatedAtDesc(accountId, pageable);
  }
}
