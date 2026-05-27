package com.iting.jobportal.payment.service;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.payment.entity.CreditTransaction;
import com.iting.jobportal.payment.repository.CreditTransactionRepository;
import com.iting.jobportal.payment.service.impl.CreditServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Money flow là chỗ dễ vỡ nhất — test mọi nhánh side-effect:
 *  - balance update đúng
 *  - credit_transaction row được tạo với dấu (+/-) khớp grant/consume
 *  - insufficient → throw, KHÔNG save (đảm bảo không trừ "âm")
 *  - amount ≤ 0 → throw, KHÔNG save
 *  - account.credits null → coerce về 0
 */
@ExtendWith(MockitoExtension.class)
class CreditServiceImplTest {

    @Mock private AccountRepository accountRepository;
    @Mock private CreditTransactionRepository txRepository;
    @InjectMocks private CreditServiceImpl service;

    // ── getBalance ───────────────────────────────────────────────────────

    @Test
    void getBalance_returnsAccountCredits() {
        Account a = new Account();
        a.setId(1L);
        a.setCredits(150);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(a));

        assertEquals(150, service.getBalance(1L));
    }

    @Test
    void getBalance_nullCredits_returnsZero() {
        Account a = new Account();
        a.setId(1L);
        a.setCredits(null);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(a));

        assertEquals(0, service.getBalance(1L));
    }

    @Test
    void getBalance_accountNotFound_throws() {
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.getBalance(99L));
    }

    // ── grant ────────────────────────────────────────────────────────────

    @Test
    void grant_addsToBalance_andRecordsPositiveTx() {
        Account a = new Account();
        a.setId(1L);
        a.setCredits(50);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(a));
        when(txRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.grant(1L, 30, "TOPUP", 999L, "Nạp 30 credits");

        assertEquals(80, a.getCredits(), "Balance phải = 50 + 30");
        ArgumentCaptor<CreditTransaction> cap = ArgumentCaptor.forClass(CreditTransaction.class);
        verify(txRepository).save(cap.capture());
        CreditTransaction tx = cap.getValue();
        assertEquals(30, tx.getAmount(), "Grant amount phải dương");
        assertEquals(80, tx.getBalanceAfter());
        assertEquals("TOPUP", tx.getSource());
        assertEquals(999L, tx.getReferenceId());
        assertEquals("Nạp 30 credits", tx.getDescription());
        assertSame(a, tx.getAccount());
    }

    @Test
    void grant_nullCurrentCredits_treatedAsZero() {
        Account a = new Account();
        a.setId(2L);
        a.setCredits(null);
        when(accountRepository.findById(2L)).thenReturn(Optional.of(a));
        when(txRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.grant(2L, 10, "WELCOME", null, null);

        assertEquals(10, a.getCredits());
    }

    @Test
    void grant_zeroOrNegative_throws_andNothingSaved() {
        assertThrows(IllegalArgumentException.class,
                () -> service.grant(1L, 0, "X", null, null));
        assertThrows(IllegalArgumentException.class,
                () -> service.grant(1L, -5, "X", null, null));

        verify(accountRepository, never()).findById(any());
        verify(accountRepository, never()).save(any());
        verify(txRepository, never()).save(any());
    }

    @Test
    void grant_accountNotFound_throws_andNothingSaved() {
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.grant(99L, 10, "TOPUP", null, null));

        verify(accountRepository, never()).save(any());
        verify(txRepository, never()).save(any());
    }

    // ── consume ──────────────────────────────────────────────────────────

    @Test
    void consume_subtractsFromBalance_andRecordsNegativeTx() {
        Account a = new Account();
        a.setId(1L);
        a.setCredits(20);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(a));
        when(txRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.consume(1L, 5, "AI_CANDIDATE_MATCH", 7L, "Match job #7");

        assertEquals(15, a.getCredits());
        ArgumentCaptor<CreditTransaction> cap = ArgumentCaptor.forClass(CreditTransaction.class);
        verify(txRepository).save(cap.capture());
        CreditTransaction tx = cap.getValue();
        assertEquals(-5, tx.getAmount(), "Consume tx phải lưu amount âm để audit rõ");
        assertEquals(15, tx.getBalanceAfter());
        assertEquals("AI_CANDIDATE_MATCH", tx.getSource());
    }

    @Test
    void consume_exactBalance_drainsToZero() {
        Account a = new Account();
        a.setId(1L);
        a.setCredits(5);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(a));
        when(txRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.consume(1L, 5, "X", null, null);

        assertEquals(0, a.getCredits());
    }

    @Test
    void consume_insufficientBalance_throws_andNothingSaved() {
        Account a = new Account();
        a.setId(1L);
        a.setCredits(2);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(a));

        assertThrows(CreditService.InsufficientCreditException.class,
                () -> service.consume(1L, 5, "X", null, null));

        assertEquals(2, a.getCredits(), "Balance phải KHÔNG đổi khi consume fail");
        verify(accountRepository, never()).save(any());
        verify(txRepository, never()).save(any());
    }

    @Test
    void consume_nullCurrentCredits_treatedAsZero_insufficient() {
        Account a = new Account();
        a.setId(1L);
        a.setCredits(null);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(a));

        assertThrows(CreditService.InsufficientCreditException.class,
                () -> service.consume(1L, 1, "X", null, null));
    }

    @Test
    void consume_zeroOrNegative_throws_andNothingSaved() {
        assertThrows(IllegalArgumentException.class,
                () -> service.consume(1L, 0, "X", null, null));
        assertThrows(IllegalArgumentException.class,
                () -> service.consume(1L, -5, "X", null, null));

        verify(accountRepository, never()).findById(any());
        verify(txRepository, never()).save(any());
    }

    @Test
    void consume_accountNotFound_throws_andNothingSaved() {
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.consume(99L, 5, "X", null, null));

        verify(accountRepository, never()).save(any());
        verify(txRepository, never()).save(any());
    }

    // ── getHistory ───────────────────────────────────────────────────────

    @Test
    void getHistory_delegatesToRepo() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<CreditTransaction> expected = new PageImpl<>(List.of());
        when(txRepository.findByAccount_IdOrderByCreatedAtDesc(1L, pageable))
                .thenReturn(expected);

        Page<CreditTransaction> result = service.getHistory(1L, pageable);

        assertSame(expected, result);
    }
}
