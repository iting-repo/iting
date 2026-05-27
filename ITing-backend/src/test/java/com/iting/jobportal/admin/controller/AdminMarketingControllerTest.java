package com.iting.jobportal.admin.controller;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.common.entity.Referral;
import com.iting.jobportal.common.entity.ReferralCode;
import com.iting.jobportal.common.repository.NewsletterSubscriptionRepository;
import com.iting.jobportal.common.repository.ReferralCodeRepository;
import com.iting.jobportal.common.repository.ReferralRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminMarketingControllerTest {

    @Mock private AccountRepository accountRepository;
    @Mock private ReferralCodeRepository referralCodeRepository;
    @Mock private ReferralRepository referralRepository;
    @Mock private NewsletterSubscriptionRepository newsletterRepository;

    @InjectMocks private AdminMarketingController controller;

    // ── utmFunnel ────────────────────────────────────────────────────────

    @Test
    void utmFunnel_returnsAllThreeAggregations() {
        List<Object[]> sources = new java.util.ArrayList<>();
        sources.add(new Object[]{"facebook", 100L});
        sources.add(new Object[]{"google", 50L});
        List<Object[]> mediums = new java.util.ArrayList<>();
        mediums.add(new Object[]{"cpc", 80L});
        List<Object[]> campaigns = new java.util.ArrayList<>();
        campaigns.add(new Object[]{"spring2026", 60L});

        when(accountRepository.aggregateByUtmSource(any(LocalDateTime.class))).thenReturn(sources);
        when(accountRepository.aggregateByUtmMedium(any(LocalDateTime.class))).thenReturn(mediums);
        when(accountRepository.aggregateByUtmCampaign(any(LocalDateTime.class))).thenReturn(campaigns);

        ResponseEntity<Map<String, Object>> resp = controller.utmFunnel(30);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        Map<String, Object> body = resp.getBody();
        assertEquals(30, body.get("timeWindowDays"));
        assertNotNull(body.get("since"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> bySource = (List<Map<String, Object>>) body.get("bySource");
        assertEquals(2, bySource.size());
        assertEquals("facebook", bySource.get(0).get("label"));
        assertEquals(100L, bySource.get(0).get("count"));
    }

    @Test
    void utmFunnel_customDays_passedThrough() {
        when(accountRepository.aggregateByUtmSource(any(LocalDateTime.class))).thenReturn(List.of());
        when(accountRepository.aggregateByUtmMedium(any(LocalDateTime.class))).thenReturn(List.of());
        when(accountRepository.aggregateByUtmCampaign(any(LocalDateTime.class))).thenReturn(List.of());

        Map<String, Object> body = controller.utmFunnel(7).getBody();
        assertEquals(7, body.get("timeWindowDays"));
    }

    @Test
    void utmFunnel_emptyAggregations_returnsEmptyLists() {
        when(accountRepository.aggregateByUtmSource(any(LocalDateTime.class))).thenReturn(List.of());
        when(accountRepository.aggregateByUtmMedium(any(LocalDateTime.class))).thenReturn(List.of());
        when(accountRepository.aggregateByUtmCampaign(any(LocalDateTime.class))).thenReturn(List.of());

        Map<String, Object> body = controller.utmFunnel(30).getBody();
        assertTrue(((List<?>) body.get("bySource")).isEmpty());
    }

    // ── topReferrers ─────────────────────────────────────────────────────

    @Test
    void topReferrers_mapsAccountAndCodeFields() {
        Account a = new Account();
        a.setId(1L); a.setEmail("hero@iting.vn"); a.setFullName("Top User");
        ReferralCode code = new ReferralCode();
        code.setAccount(a);
        code.setCode("HERO1");
        code.setTotalSignups(50);
        code.setTotalInvited(80);

        when(referralCodeRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(code)));
        when(referralRepository.countByReferrer_IdAndFirstApplicationAtIsNotNull(1L)).thenReturn(15L);

        ResponseEntity<List<Map<String, Object>>> resp = controller.topReferrers(20);

        List<Map<String, Object>> body = resp.getBody();
        assertEquals(1, body.size());
        Map<String, Object> m = body.get(0);
        assertEquals(1L, m.get("accountId"));
        assertEquals("hero@iting.vn", m.get("email"));
        assertEquals("Top User", m.get("fullName"));
        assertEquals("HERO1", m.get("code"));
        assertEquals(50, m.get("totalSignups"));
        assertEquals(80, m.get("totalInvited"));
        assertEquals(15L, m.get("convertedCount"));
    }

    @Test
    void topReferrers_empty_returnsEmptyList() {
        when(referralCodeRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        assertTrue(controller.topReferrers(20).getBody().isEmpty());
    }

    // ── overview ─────────────────────────────────────────────────────────

    @Test
    void overview_calculatesAllKpis_andConversionRate() {
        when(accountRepository.countByCreatedAtAfter(any(LocalDateTime.class))).thenReturn(500L);
        when(referralCodeRepository.count()).thenReturn(50L);
        when(newsletterRepository.countByUnsubscribedAtIsNull()).thenReturn(1000L);
        when(referralRepository.count()).thenReturn(100L);

        Referral converted = new Referral();
        converted.setFirstApplicationAt(LocalDateTime.now());
        Referral notConverted = new Referral();
        notConverted.setFirstApplicationAt(null);

        // 25 converted out of 100 → 25%
        java.util.List<Referral> all = new java.util.ArrayList<>();
        for (int i = 0; i < 25; i++) all.add(converted);
        for (int i = 0; i < 75; i++) all.add(notConverted);
        when(referralRepository.findAll()).thenReturn(all);

        ResponseEntity<Map<String, Object>> resp = controller.overview(30);

        Map<String, Object> body = resp.getBody();
        assertEquals(30, body.get("timeWindowDays"));
        assertEquals(500L, body.get("totalSignups"));
        assertEquals(50L, body.get("activeReferralCodes"));
        assertEquals(1000L, body.get("activeNewsletterSubs"));
        assertEquals(100L, body.get("totalReferrals"));
        assertEquals(25L, body.get("convertedReferrals"));
        assertEquals(25.0, body.get("referralConversionRate"));
    }

    @Test
    void overview_zeroReferrals_conversionRateZero() {
        when(accountRepository.countByCreatedAtAfter(any(LocalDateTime.class))).thenReturn(0L);
        when(referralCodeRepository.count()).thenReturn(0L);
        when(newsletterRepository.countByUnsubscribedAtIsNull()).thenReturn(0L);
        when(referralRepository.count()).thenReturn(0L);
        when(referralRepository.findAll()).thenReturn(List.of());

        assertEquals(0.0, controller.overview(30).getBody().get("referralConversionRate"));
    }

    // ── recentReferrals ──────────────────────────────────────────────────

    @Test
    void recentReferrals_mapsReferralFields() {
        Account referrer = new Account(); referrer.setEmail("ref@x.y");
        Account referred = new Account(); referred.setEmail("new@x.y");
        Referral r = new Referral();
        r.setId(1L);
        r.setCodeUsed("CODE1");
        r.setSignupAt(LocalDateTime.now());
        r.setFirstApplicationAt(null);
        r.setRewarded(true);
        r.setReferrer(referrer);
        r.setReferred(referred);

        when(referralRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(r)));

        Map<String, Object> body = controller.recentReferrals(50).getBody().get(0);
        assertEquals(1L, body.get("id"));
        assertEquals("CODE1", body.get("codeUsed"));
        assertEquals(true, body.get("rewarded"));
        assertEquals("ref@x.y", body.get("referrerEmail"));
        assertEquals("new@x.y", body.get("referredEmail"));
    }

    @Test
    void recentReferrals_orphan_referrerOrReferredNull_returnsNullEmail() {
        Referral r = new Referral();
        r.setId(1L);
        r.setReferrer(null);
        r.setReferred(null);

        when(referralRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(r)));

        Map<String, Object> body = controller.recentReferrals(50).getBody().get(0);
        assertNull(body.get("referrerEmail"));
        assertNull(body.get("referredEmail"));
    }
}
