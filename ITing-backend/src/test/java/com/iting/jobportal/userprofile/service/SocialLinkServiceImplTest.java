package com.iting.jobportal.userprofile.service;

import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.userprofile.dto.request.SocialLinksBulkRequest;
import com.iting.jobportal.userprofile.dto.response.SocialLinkResponse;
import com.iting.jobportal.userprofile.entity.SocialLink;
import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.entity.enums.SocialPlatform;
import com.iting.jobportal.userprofile.repository.SocialLinkRepository;
import com.iting.jobportal.userprofile.repository.UserProfileRepository;
import com.iting.jobportal.userprofile.service.impl.SocialLinkServiceImpl;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SocialLinkServiceImplTest {

    @Mock
    private SocialLinkRepository socialLinkRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @InjectMocks
    private SocialLinkServiceImpl socialLinkService;

    @Test
    void getSocialLinks_shouldMapPlatformsToResponseFields() {
        SocialLink linkedin = new SocialLink();
        linkedin.setPlatform(SocialPlatform.LINKEDIN);
        linkedin.setUrl("https://linkedin");
        SocialLink github = new SocialLink();
        github.setPlatform(SocialPlatform.GITHUB);
        github.setUrl("https://github");

        when(socialLinkRepository.findByProfile_Id(1L)).thenReturn(List.of(linkedin, github));

        SocialLinkResponse response = socialLinkService.getSocialLinks("1");

        assertEquals("https://linkedin", response.getLinkedin());
        assertEquals("https://github", response.getGithub());
    }

    @Test
    void getSocialLinks_withInvalidUserId_shouldThrow() {
        assertThrows(IllegalArgumentException.class, () -> socialLinkService.getSocialLinks("abc"));
    }

    @Test
    void saveSocialLinks_shouldDeleteExistingLinkWhenBlank() {
        User user = new User();
        user.setId(1L);
        SocialLink existing = new SocialLink();

        SocialLinksBulkRequest request = new SocialLinksBulkRequest();
        request.setGithub("   ");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(socialLinkRepository.findByProfileIdAndPlatform(1L, SocialPlatform.LINKEDIN)).thenReturn(Optional.empty());
        when(socialLinkRepository.findByProfileIdAndPlatform(1L, SocialPlatform.GITHUB)).thenReturn(Optional.of(existing));
        when(socialLinkRepository.findByProfileIdAndPlatform(1L, SocialPlatform.PORTFOLIO)).thenReturn(Optional.empty());
        when(socialLinkRepository.findByProfileIdAndPlatform(1L, SocialPlatform.TWITTER)).thenReturn(Optional.empty());

        socialLinkService.saveSocialLinks("1", request);

        verify(socialLinkRepository).delete(existing);
        verify(socialLinkRepository, never()).save(any());
    }

    @Test
    void saveSocialLinks_shouldCreateProfileAndNormalizeUrl() {
        User user = new User();
        user.setId(1L);
        UserProfile profile = new UserProfile();
        profile.setId(1L);

        SocialLinksBulkRequest request = new SocialLinksBulkRequest();
        request.setLinkedin("  https://linkedin.com/in/test  ");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userProfileRepository.findById(1L)).thenReturn(Optional.empty());
        when(userProfileRepository.save(any(UserProfile.class))).thenReturn(profile);
        when(socialLinkRepository.findByProfileIdAndPlatform(1L, SocialPlatform.LINKEDIN)).thenReturn(Optional.empty());
        when(socialLinkRepository.findByProfileIdAndPlatform(1L, SocialPlatform.GITHUB)).thenReturn(Optional.empty());
        when(socialLinkRepository.findByProfileIdAndPlatform(1L, SocialPlatform.PORTFOLIO)).thenReturn(Optional.empty());
        when(socialLinkRepository.findByProfileIdAndPlatform(1L, SocialPlatform.TWITTER)).thenReturn(Optional.empty());

        socialLinkService.saveSocialLinks("1", request);

        ArgumentCaptor<SocialLink> captor = ArgumentCaptor.forClass(SocialLink.class);
        verify(socialLinkRepository).save(captor.capture());
        assertEquals("https://linkedin.com/in/test", captor.getValue().getUrl());
        assertEquals(SocialPlatform.LINKEDIN, captor.getValue().getPlatform());
    }

    @Test
    void saveSocialLinks_whenUserMissing_shouldThrow() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> socialLinkService.saveSocialLinks("1", new SocialLinksBulkRequest()));
    }
}
