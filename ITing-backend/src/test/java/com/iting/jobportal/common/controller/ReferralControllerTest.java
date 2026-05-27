package com.iting.jobportal.common.controller;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.common.entity.Referral;
import com.iting.jobportal.common.entity.ReferralCode;
import com.iting.jobportal.common.repository.ReferralCodeRepository;
import com.iting.jobportal.common.repository.ReferralRepository;
import com.iting.jobportal.common.service.ReferralService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReferralControllerTest {

    @Mock private ReferralService referralService;
    @Mock private ReferralCodeRepository codeRepository;
    @Mock private ReferralRepository referralRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private HttpServletRequest request;

    @InjectMocks private ReferralController controller;

    private Account makeMe() {
        Account a = new Account();
        a.setId(1L);
        a.setEmail("me@iting.vn");
        return a;
    }

    private ReferralCode makeCode(int totalSignups, int totalInvited) {
        ReferralCode c = new ReferralCode();
        c.setCode("MYREF123");
        c.setTotalSignups(totalSignups);
        c.setTotalInvited(totalInvited);
        return c;
    }

    @Test
    void myReferral_happyPath_returnsAllStats() {
        Account me = makeMe();
        ReferralCode code = makeCode(10, 25);
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(me));
        when(referralService.getOrCreateCodeFor(me)).thenReturn(code);
        when(referralRepository.findByReferrer_IdOrderBySignupAtDesc(1L)).thenReturn(List.of());
        when(codeRepository.findByAccount_Id(1L)).thenReturn(Optional.of(code));
        when(referralRepository.countByReferrer_IdAndFirstApplicationAtIsNotNull(1L)).thenReturn(3L);

        ResponseEntity<Map<String, Object>> resp = controller.myReferral(request);

        Map<String, Object> body = resp.getBody();
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("MYREF123", body.get("code"));
        assertEquals("https://iting.vn/register?ref=MYREF123", body.get("shareUrl"));
        assertEquals(25L, body.get("totalInvited"));
        assertEquals(10, body.get("totalSignups"));
        assertEquals(3L, body.get("converted"));
        assertEquals(30.0, body.get("conversionRate"), "3/10 = 30.0%");
    }

    @Test
    void myReferral_zeroSignups_conversionRateZero() {
        Account me = makeMe();
        ReferralCode code = makeCode(0, 0);
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(me));
        when(referralService.getOrCreateCodeFor(me)).thenReturn(code);
        when(referralRepository.findByReferrer_IdOrderBySignupAtDesc(1L)).thenReturn(List.of());
        when(codeRepository.findByAccount_Id(1L)).thenReturn(Optional.empty()); // totalInvited fallback 0
        when(referralRepository.countByReferrer_IdAndFirstApplicationAtIsNotNull(1L)).thenReturn(0L);

        ResponseEntity<Map<String, Object>> resp = controller.myReferral(request);

        Map<String, Object> body = resp.getBody();
        assertEquals(0L, body.get("totalInvited"), "fallback 0 khi không có code");
        assertEquals(0.0, body.get("conversionRate"), "Tránh chia cho 0");
    }

    @Test
    void myReferral_recentInvitees_maxLimit20_andMaskEmail() {
        Account me = makeMe();
        ReferralCode code = makeCode(50, 50);
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(me));
        when(referralService.getOrCreateCodeFor(me)).thenReturn(code);
        when(codeRepository.findByAccount_Id(1L)).thenReturn(Optional.of(code));
        when(referralRepository.countByReferrer_IdAndFirstApplicationAtIsNotNull(1L)).thenReturn(20L);

        // 30 referrals — controller phải limit về 20
        java.util.List<Referral> referrals = new java.util.ArrayList<>();
        for (int i = 0; i < 30; i++) {
            Referral r = new Referral();
            r.setSignupAt(LocalDateTime.now().minusDays(i));
            r.setFirstApplicationAt(i % 2 == 0 ? LocalDateTime.now() : null);
            r.setRewarded(false);
            Account ref = new Account();
            ref.setEmail("user" + i + "@gmail.com");
            r.setReferred(ref);
            referrals.add(r);
        }
        when(referralRepository.findByReferrer_IdOrderBySignupAtDesc(1L)).thenReturn(referrals);

        Map<String, Object> body = controller.myReferral(request).getBody();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> recent = (List<Map<String, Object>>) body.get("recentInvitees");
        assertEquals(20, recent.size(), "Limit 20");

        Map<String, Object> first = recent.get(0);
        String masked = (String) first.get("referredEmail");
        assertTrue(masked.startsWith("u") && masked.contains("***@"),
                "Email phải mask format n***@domain, got: " + masked);
    }

    @Test
    void myReferral_referredAccountNull_maskedAsTripleStar() {
        Account me = makeMe();
        ReferralCode code = makeCode(1, 1);
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(me));
        when(referralService.getOrCreateCodeFor(me)).thenReturn(code);
        when(codeRepository.findByAccount_Id(1L)).thenReturn(Optional.of(code));
        when(referralRepository.countByReferrer_IdAndFirstApplicationAtIsNotNull(1L)).thenReturn(0L);

        Referral r = new Referral();
        r.setSignupAt(LocalDateTime.now());
        r.setReferred(null); // orphan
        r.setRewarded(false);
        when(referralRepository.findByReferrer_IdOrderBySignupAtDesc(1L)).thenReturn(List.of(r));

        Map<String, Object> body = controller.myReferral(request).getBody();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> recent = (List<Map<String, Object>>) body.get("recentInvitees");
        assertEquals("***", recent.get(0).get("referredEmail"));
    }

    @Test
    void myReferral_accountNotFound_throws404() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
        when(accountRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.myReferral(request));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void myReferral_unauthenticated_throws401() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.myReferral(request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }
}
