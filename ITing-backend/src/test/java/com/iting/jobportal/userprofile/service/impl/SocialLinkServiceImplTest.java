package com.iting.jobportal.userprofile.service.impl;

import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.userprofile.dto.request.SocialLinksBulkRequest;
import com.iting.jobportal.userprofile.dto.response.SocialLinkResponse;
import com.iting.jobportal.userprofile.entity.SocialLink;
import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.entity.enums.SocialPlatform;
import com.iting.jobportal.userprofile.repository.SocialLinkRepository;
import com.iting.jobportal.userprofile.repository.UserProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SocialLinkServiceImplTest {

    @Mock private SocialLinkRepository socialLinkRepository;
    @Mock private UserRepository userRepository;
    @Mock private UserProfileRepository userProfileRepository;

    @InjectMocks private SocialLinkServiceImpl service;

    private SocialLink link(SocialPlatform p, String url) {
        SocialLink l = new SocialLink();
        l.setPlatform(p);
        l.setUrl(url);
        return l;
    }

    // ── getSocialLinks ──────────────────────────────────────────────────

    @Test
    void getSocialLinks_mapsAllFourPlatforms() {
        when(socialLinkRepository.findByProfile_Id(1L)).thenReturn(List.of(
                link(SocialPlatform.LINKEDIN, "https://linkedin.com/u"),
                link(SocialPlatform.GITHUB, "https://github.com/u"),
                link(SocialPlatform.PORTFOLIO, "https://me.io"),
                link(SocialPlatform.TWITTER, "https://x.com/u")));

        SocialLinkResponse res = service.getSocialLinks("1");

        assertEquals("https://linkedin.com/u", res.getLinkedin());
        assertEquals("https://github.com/u", res.getGithub());
        assertEquals("https://me.io", res.getPortfolio());
        assertEquals("https://x.com/u", res.getTwitter());
    }

    @Test
    void getSocialLinks_skipsNullPlatform() {
        SocialLink broken = new SocialLink();
        broken.setPlatform(null);
        broken.setUrl("ignored");

        when(socialLinkRepository.findByProfile_Id(1L)).thenReturn(List.of(
                broken,
                link(SocialPlatform.GITHUB, "gh-url")));

        SocialLinkResponse res = service.getSocialLinks("1");

        assertNull(res.getLinkedin());
        assertEquals("gh-url", res.getGithub());
    }

    @Test
    void getSocialLinks_emptyList_allNull() {
        when(socialLinkRepository.findByProfile_Id(1L)).thenReturn(List.of());

        SocialLinkResponse res = service.getSocialLinks("1");

        assertNull(res.getLinkedin());
        assertNull(res.getGithub());
        assertNull(res.getPortfolio());
        assertNull(res.getTwitter());
    }

    @Test
    void getSocialLinks_invalidUserId_throws() {
        assertThrows(IllegalArgumentException.class,
                () -> service.getSocialLinks("not-a-number"));
    }

    // ── saveSocialLinks ─────────────────────────────────────────────────

    @Test
    void saveSocialLinks_userNotFound_throws() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        SocialLinksBulkRequest req = new SocialLinksBulkRequest();
        assertThrows(EntityNotFoundException.class,
                () -> service.saveSocialLinks("1", req));
    }

    @Test
    void saveSocialLinks_insertsNewLinks_whenNoneExist() {
        User user = new User();
        user.setId(1L);
        UserProfile profile = new UserProfile();
        profile.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(socialLinkRepository.findByProfileIdAndPlatform(any(Long.class), any(SocialPlatform.class)))
                .thenReturn(Optional.empty());
        when(userProfileRepository.findById(1L)).thenReturn(Optional.of(profile));

        SocialLinksBulkRequest req = new SocialLinksBulkRequest();
        req.setLinkedin("https://linkedin.com/u");
        req.setGithub("https://github.com/u");
        req.setPortfolio("https://me.io");
        req.setTwitter("https://x.com/u");

        service.saveSocialLinks("1", req);

        ArgumentCaptor<SocialLink> cap = ArgumentCaptor.forClass(SocialLink.class);
        verify(socialLinkRepository, org.mockito.Mockito.times(4)).save(cap.capture());

        // verify nothing was deleted
        verify(socialLinkRepository, never()).delete(any());
    }

    @Test
    void saveSocialLinks_updatesExisting_whenAlreadyPresent() {
        User user = new User();
        user.setId(1L);

        SocialLink existing = new SocialLink();
        existing.setId(10L);
        existing.setPlatform(SocialPlatform.LINKEDIN);
        existing.setUrl("old-url");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(socialLinkRepository.findByProfileIdAndPlatform(1L, SocialPlatform.LINKEDIN))
                .thenReturn(Optional.of(existing));
        when(socialLinkRepository.findByProfileIdAndPlatform(1L, SocialPlatform.GITHUB))
                .thenReturn(Optional.empty());
        when(socialLinkRepository.findByProfileIdAndPlatform(1L, SocialPlatform.PORTFOLIO))
                .thenReturn(Optional.empty());
        when(socialLinkRepository.findByProfileIdAndPlatform(1L, SocialPlatform.TWITTER))
                .thenReturn(Optional.empty());

        SocialLinksBulkRequest req = new SocialLinksBulkRequest();
        req.setLinkedin("new-linkedin");
        // others null → should NOT save them

        service.saveSocialLinks("1", req);

        // existing link updated (URL changed) — reused, not new
        assertEquals("new-linkedin", existing.getUrl());
        verify(socialLinkRepository).save(existing);
        // 3 platforms with null url + no existing record → no save + no delete
        verify(socialLinkRepository, org.mockito.Mockito.times(1)).save(any());
        verify(socialLinkRepository, never()).delete(any());
    }

    @Test
    void saveSocialLinks_deletesExisting_whenUrlBlank() {
        User user = new User();
        user.setId(1L);

        SocialLink existing = new SocialLink();
        existing.setPlatform(SocialPlatform.GITHUB);
        existing.setUrl("old");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(socialLinkRepository.findByProfileIdAndPlatform(1L, SocialPlatform.LINKEDIN))
                .thenReturn(Optional.empty());
        when(socialLinkRepository.findByProfileIdAndPlatform(1L, SocialPlatform.GITHUB))
                .thenReturn(Optional.of(existing));
        when(socialLinkRepository.findByProfileIdAndPlatform(1L, SocialPlatform.PORTFOLIO))
                .thenReturn(Optional.empty());
        when(socialLinkRepository.findByProfileIdAndPlatform(1L, SocialPlatform.TWITTER))
                .thenReturn(Optional.empty());

        SocialLinksBulkRequest req = new SocialLinksBulkRequest();
        req.setGithub("   "); // blank → normalize null → delete

        service.saveSocialLinks("1", req);

        verify(socialLinkRepository).delete(existing);
        verify(socialLinkRepository, never()).save(any());
    }

    @Test
    void saveSocialLinks_normalizeTrimWhitespace() {
        User user = new User(); user.setId(1L);
        UserProfile profile = new UserProfile(); profile.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(socialLinkRepository.findByProfileIdAndPlatform(any(Long.class), any(SocialPlatform.class)))
                .thenReturn(Optional.empty());
        when(userProfileRepository.findById(1L)).thenReturn(Optional.of(profile));

        SocialLinksBulkRequest req = new SocialLinksBulkRequest();
        req.setLinkedin("  https://linkedin.com/u  ");

        service.saveSocialLinks("1", req);

        ArgumentCaptor<SocialLink> cap = ArgumentCaptor.forClass(SocialLink.class);
        verify(socialLinkRepository).save(cap.capture());
        assertEquals("https://linkedin.com/u", cap.getValue().getUrl());
    }

    @Test
    void saveSocialLinks_createsProfile_whenNoneExists() {
        User user = new User(); user.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(socialLinkRepository.findByProfileIdAndPlatform(any(Long.class), any(SocialPlatform.class)))
                .thenReturn(Optional.empty());
        when(userProfileRepository.findById(1L)).thenReturn(Optional.empty());
        when(userProfileRepository.save(any(UserProfile.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        SocialLinksBulkRequest req = new SocialLinksBulkRequest();
        req.setGithub("gh-url");

        service.saveSocialLinks("1", req);

        verify(userProfileRepository).save(any(UserProfile.class));
        verify(socialLinkRepository).save(any(SocialLink.class));
    }

    @Test
    void saveSocialLinks_nullUrl_andNoExisting_isNoOp() {
        User user = new User(); user.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(socialLinkRepository.findByProfileIdAndPlatform(any(Long.class), any(SocialPlatform.class)))
                .thenReturn(Optional.empty());

        // all fields null in request
        SocialLinksBulkRequest req = new SocialLinksBulkRequest();

        service.saveSocialLinks("1", req);

        verify(socialLinkRepository, never()).save(any());
        verify(socialLinkRepository, never()).delete(any());
    }

    @Test
    void saveSocialLinks_invalidUserId_throws() {
        SocialLinksBulkRequest req = new SocialLinksBulkRequest();
        assertThrows(IllegalArgumentException.class,
                () -> service.saveSocialLinks("abc", req));
    }
}
