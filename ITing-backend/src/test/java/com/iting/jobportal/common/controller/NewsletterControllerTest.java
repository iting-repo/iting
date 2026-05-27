package com.iting.jobportal.common.controller;

import com.iting.jobportal.common.entity.NewsletterSubscription;
import com.iting.jobportal.common.repository.NewsletterSubscriptionRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NewsletterControllerTest {

    @Mock private NewsletterSubscriptionRepository repository;
    @Mock private HttpServletRequest request;
    @InjectMocks private NewsletterController controller;

    // ── subscribe: email validation ──────────────────────────────────────

    @Test
    void subscribe_invalidEmail_throws400() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.subscribe(Map.of("email", "not-an-email"), request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void subscribe_nullEmail_throws400() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.subscribe(Map.of(), request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void subscribe_emailWithSpaces_trimmed_andLowercased() {
        when(repository.findByEmail("user@example.com")).thenReturn(Optional.empty());
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("1.2.3.4");

        controller.subscribe(Map.of("email", "  USER@example.com  "), request);

        ArgumentCaptor<NewsletterSubscription> cap = ArgumentCaptor.forClass(NewsletterSubscription.class);
        verify(repository).save(cap.capture());
        assertEquals("user@example.com", cap.getValue().getEmail());
    }

    // ── subscribe: new vs existing ───────────────────────────────────────

    @Test
    void subscribe_newEmail_savesAllOptionalFields() {
        when(repository.findByEmail("a@b.co")).thenReturn(Optional.empty());
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("9.9.9.9");

        ResponseEntity<Map<String, Object>> resp = controller.subscribe(Map.of(
                "email", "a@b.co",
                "source", "POPUP",
                "leadMagnet", "ebook-2026",
                "utmSource", "facebook",
                "utmMedium", "cpc",
                "utmCampaign", "spring2026"
        ), request);

        ArgumentCaptor<NewsletterSubscription> cap = ArgumentCaptor.forClass(NewsletterSubscription.class);
        verify(repository).save(cap.capture());
        NewsletterSubscription saved = cap.getValue();
        assertEquals("a@b.co", saved.getEmail());
        assertEquals("POPUP", saved.getSource());
        assertEquals("ebook-2026", saved.getLeadMagnet());
        assertEquals("facebook", saved.getUtmSource());
        assertEquals("cpc", saved.getUtmMedium());
        assertEquals("spring2026", saved.getUtmCampaign());
        assertEquals("9.9.9.9", saved.getIpAddress());
        assertNotNull(saved.getUnsubscribeToken(), "Token UUID phải được generate");
        assertEquals(false, resp.getBody().get("alreadySubscribed"));
    }

    @Test
    void subscribe_defaultSource_isFOOTER() {
        when(repository.findByEmail("a@b.co")).thenReturn(Optional.empty());
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("1.1.1.1");

        controller.subscribe(Map.of("email", "a@b.co"), request);

        ArgumentCaptor<NewsletterSubscription> cap = ArgumentCaptor.forClass(NewsletterSubscription.class);
        verify(repository).save(cap.capture());
        assertEquals("FOOTER", cap.getValue().getSource());
    }

    @Test
    void subscribe_existingActive_returnsAlreadySubscribed_noNewSave() {
        NewsletterSubscription existing = NewsletterSubscription.builder()
                .email("a@b.co").unsubscribedAt(null).build();
        when(repository.findByEmail("a@b.co")).thenReturn(Optional.of(existing));

        ResponseEntity<Map<String, Object>> resp = controller.subscribe(
                Map.of("email", "a@b.co"), request);

        assertEquals(true, resp.getBody().get("alreadySubscribed"));
        verify(repository, never()).save(any(NewsletterSubscription.class));
    }

    @Test
    void subscribe_previouslyUnsubscribed_reactivates() {
        NewsletterSubscription existing = NewsletterSubscription.builder()
                .email("a@b.co").unsubscribedAt(LocalDateTime.now().minusDays(30)).build();
        when(repository.findByEmail("a@b.co")).thenReturn(Optional.of(existing));

        controller.subscribe(Map.of("email", "a@b.co"), request);

        assertNull(existing.getUnsubscribedAt(), "Phải clear unsubscribedAt");
        assertNotNull(existing.getSubscribedAt(), "Phải set lại subscribedAt");
        verify(repository).save(existing);
    }

    // ── subscribe: IP extraction ─────────────────────────────────────────

    @Test
    void subscribe_xForwardedFor_chainOfProxies_firstUsed() {
        when(repository.findByEmail("a@b.co")).thenReturn(Optional.empty());
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.1, 10.0.0.1");

        controller.subscribe(Map.of("email", "a@b.co"), request);

        ArgumentCaptor<NewsletterSubscription> cap = ArgumentCaptor.forClass(NewsletterSubscription.class);
        verify(repository).save(cap.capture());
        assertEquals("203.0.113.1", cap.getValue().getIpAddress());
    }

    @Test
    void subscribe_xRealIp_fallback_whenNoForwarded() {
        when(repository.findByEmail("a@b.co")).thenReturn(Optional.empty());
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn("198.51.100.5");

        controller.subscribe(Map.of("email", "a@b.co"), request);

        ArgumentCaptor<NewsletterSubscription> cap = ArgumentCaptor.forClass(NewsletterSubscription.class);
        verify(repository).save(cap.capture());
        assertEquals("198.51.100.5", cap.getValue().getIpAddress());
    }

    // ── unsubscribe ──────────────────────────────────────────────────────

    @Test
    void unsubscribe_validToken_setsUnsubscribedAt() {
        NewsletterSubscription sub = NewsletterSubscription.builder()
                .email("a@b.co").unsubscribeToken("abc123").unsubscribedAt(null).build();
        when(repository.findByUnsubscribeToken("abc123")).thenReturn(Optional.of(sub));

        ResponseEntity<Map<String, String>> resp = controller.unsubscribe("abc123");

        assertNotNull(sub.getUnsubscribedAt(), "Phải set unsubscribedAt");
        verify(repository).save(sub);
        assertEquals(HttpStatus.OK, resp.getStatusCode());
    }

    @Test
    void unsubscribe_alreadyUnsubscribed_idempotent_noSave() {
        LocalDateTime previousUnsubAt = LocalDateTime.now().minusDays(7);
        NewsletterSubscription sub = NewsletterSubscription.builder()
                .email("a@b.co").unsubscribeToken("abc").unsubscribedAt(previousUnsubAt).build();
        when(repository.findByUnsubscribeToken("abc")).thenReturn(Optional.of(sub));

        controller.unsubscribe("abc");

        assertEquals(previousUnsubAt, sub.getUnsubscribedAt(), "Timestamp giữ nguyên (idempotent)");
        verify(repository, never()).save(any(NewsletterSubscription.class));
    }

    @Test
    void unsubscribe_invalidToken_throws404() {
        when(repository.findByUnsubscribeToken("bad")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.unsubscribe("bad"));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    // ── stats ────────────────────────────────────────────────────────────

    @Test
    void stats_returnsActiveAndTotal() {
        when(repository.countByUnsubscribedAtIsNull()).thenReturn(150L);
        when(repository.count()).thenReturn(200L);

        ResponseEntity<Map<String, Object>> resp = controller.stats();

        assertEquals(150L, resp.getBody().get("activeSubscribers"));
        assertEquals(200L, resp.getBody().get("total"));
    }

    // ── Email regex coverage ─────────────────────────────────────────────

    @Test
    void subscribe_emailWithSpecialChars_accepted() {
        when(repository.findByEmail(any())).thenReturn(Optional.empty());
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("1.1.1.1");

        // RFC-compliant email: dots, plus tag, dashes
        ResponseEntity<Map<String, Object>> resp = controller.subscribe(
                Map.of("email", "first.last+newsletter@sub-domain.example.com"), request);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
    }

    @Test
    void subscribe_emailMissingDotAfterAt_throws400() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.subscribe(Map.of("email", "x@nodomain"), request));
        assertTrue(ex.getMessage().contains("Email không hợp lệ"));
    }
}
