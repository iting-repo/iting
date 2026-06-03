package com.iting.jobportal.payment.controller;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.payment.entity.CreditTransaction;
import com.iting.jobportal.payment.service.CreditService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/me/credits")
@RequiredArgsConstructor
public class CreditController {

  private final CreditService creditService;
  private final AccountRepository accountRepository;
  private final JwtTokenUtil jwtTokenUtil;

  /** Balance + thông tin gói hiện tại để frontend hiển thị 1 phát. */
  @GetMapping
  public ResponseEntity<Map<String, Object>> getBalance(HttpServletRequest request) {
    Long userId = requireUser(request);
    Account account =
        accountRepository
            .findById(userId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account không tồn tại"));

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("balance", account.getCredits() != null ? account.getCredits() : 0);
    body.put("premiumUntil", account.getPremiumUntil());
    body.put("premiumSource", account.getPremiumSource());
    return ResponseEntity.ok(body);
  }

  /** Lịch sử giao dịch credit, mới nhất trước. */
  @GetMapping("/history")
  public ResponseEntity<Map<String, Object>> getHistory(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      HttpServletRequest request) {
    Long userId = requireUser(request);
    int safeSize = Math.min(Math.max(size, 1), 100);
    Page<CreditTransaction> p =
        creditService.getHistory(userId, PageRequest.of(Math.max(page, 0), safeSize));

    List<Map<String, Object>> items =
        p.getContent().stream()
            .map(
                tx -> {
                  Map<String, Object> m = new LinkedHashMap<>();
                  m.put("id", tx.getId());
                  m.put("amount", tx.getAmount());
                  m.put("balanceAfter", tx.getBalanceAfter());
                  m.put("source", tx.getSource());
                  m.put("referenceId", tx.getReferenceId());
                  m.put("description", tx.getDescription());
                  m.put("createdAt", tx.getCreatedAt());
                  return m;
                })
            .collect(Collectors.toList());

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("items", items);
    body.put("page", p.getNumber());
    body.put("size", p.getSize());
    body.put("totalElements", p.getTotalElements());
    body.put("totalPages", p.getTotalPages());
    return ResponseEntity.ok(body);
  }

  private Long requireUser(HttpServletRequest request) {
    Long id = jwtTokenUtil.getUserIdFromHeader(request);
    if (id == null)
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
    return id;
  }
}
