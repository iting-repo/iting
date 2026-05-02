package com.iting.jobportal.userprofile.service.impl;

import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.userprofile.dto.request.SocialLinkRequest;
import com.iting.jobportal.userprofile.dto.request.SocialLinksBulkRequest;
import com.iting.jobportal.userprofile.dto.response.SocialLinkResponse;
import com.iting.jobportal.userprofile.entity.SocialLink;
import com.iting.jobportal.userprofile.entity.enums.SocialPlatform;
import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.repository.SocialLinkRepository;
import com.iting.jobportal.userprofile.repository.UserProfileRepository;
import com.iting.jobportal.userprofile.service.SocialLinkService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class SocialLinkServiceImpl implements SocialLinkService {

    private final SocialLinkRepository socialLinkRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    private static final SocialPlatform LINKEDIN = SocialPlatform.LINKEDIN;
    private static final SocialPlatform GITHUB = SocialPlatform.GITHUB;
    private static final SocialPlatform PORTFOLIO = SocialPlatform.PORTFOLIO;
    private static final SocialPlatform TWITTER = SocialPlatform.TWITTER;

    @Override
    public SocialLinkResponse getSocialLinks(String userId) {
        Long uid = parseUserId(userId);

        List<SocialLink> links = socialLinkRepository.findByProfile_Id(uid);

        SocialLinkResponse res = new SocialLinkResponse();

        for (SocialLink link : links) {
            if (link.getPlatform() == null)
                continue;

            switch (link.getPlatform()) {
                case LINKEDIN -> res.setLinkedin(link.getUrl());
                case GITHUB -> res.setGithub(link.getUrl());
                case PORTFOLIO -> res.setPortfolio(link.getUrl());
                case TWITTER -> res.setTwitter(link.getUrl());
            }
        }

        return res;
    }

    @Override
    public void saveSocialLinks(String userId, SocialLinksBulkRequest req) {
        Long uid = parseUserId(userId);

        User user = userRepository.findById(uid)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + uid));

        upsertOrDelete(user, LINKEDIN, req.getLinkedin());
        upsertOrDelete(user, GITHUB, req.getGithub());
        upsertOrDelete(user, PORTFOLIO, req.getPortfolio());
        upsertOrDelete(user, TWITTER, req.getTwitter());
    }

    private void upsertOrDelete(User user, SocialPlatform platform, String url) {
        String normalizedUrl = normalize(url);

        Optional<SocialLink> existing = socialLinkRepository.findByProfileIdAndPlatform(user.getId(), platform);

        if (normalizedUrl == null) {
            existing.ifPresent(socialLinkRepository::delete);
            return;
        }

        SocialLink socialLink = existing.orElseGet(() -> {
            SocialLink link = new SocialLink();
            link.setProfile(getOrCreateProfile(user));
            link.setPlatform(platform);
            return link;
        });

        socialLink.setUrl(normalizedUrl);
        socialLinkRepository.save(socialLink);
    }

    private UserProfile getOrCreateProfile(User user) {
        return userProfileRepository.findById(user.getId())
                .orElseGet(() -> {
                    UserProfile profile = new UserProfile();
                    profile.setId(user.getId());
                    profile.setUser(user);
                    return userProfileRepository.save(profile);
                });
    }

    private String normalize(String value) {
        if (value == null)
            return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Long parseUserId(String userId) {
        try {
            return Long.valueOf(userId);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid userId: " + userId);
        }
    }
}