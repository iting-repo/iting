package com.iting.jobportal.company.service;

import com.iting.jobportal.company.dto.response.FollowedCompanyResponse;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.UserFollowCompany;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.repository.UserFollowCompanyRepository;
import com.iting.jobportal.company.service.impl.CompanyFollowServiceImpl;
import com.iting.jobportal.notification.entity.Notification;
import com.iting.jobportal.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompanyFollowServiceImplTest {

    @Mock
    private UserFollowCompanyRepository userFollowCompanyRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private CompanyFollowServiceImpl companyFollowService;

    private Company company;

    @BeforeEach
    void setUp() {
        company = new Company();
        company.setId(10L);
        company.setName("ITing");
        company.setIndustry("Software");
        company.setLogoUrl("https://logo.png");
    }

    @Test
    void followCompany_whenAlreadyFollowing_shouldThrow() {
        when(companyRepository.findById(10L)).thenReturn(Optional.of(company));
        when(userFollowCompanyRepository.existsByUserIdAndCompanyId(1L, 10L)).thenReturn(true);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> companyFollowService.followCompany(1L, 10L)
        );

        assertTrue(exception.getMessage().contains("theo"));
        verify(notificationRepository, never()).save(any());
        verify(userFollowCompanyRepository, never()).save(any());
    }

    @Test
    void unfollowCompany_whenNotFollowing_shouldThrow() {
        when(userFollowCompanyRepository.existsByUserIdAndCompanyId(1L, 10L)).thenReturn(false);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> companyFollowService.unfollowCompany(1L, 10L)
        );

        assertTrue(exception.getMessage().contains("theo"));
        verify(userFollowCompanyRepository, never()).deleteByUserIdAndCompanyId(any(), any());
    }

    @Test
    void followCompany_whenValid_shouldCreateNotificationAndFollowRelation() {
        when(companyRepository.findById(10L)).thenReturn(Optional.of(company));
        when(userFollowCompanyRepository.existsByUserIdAndCompanyId(1L, 10L)).thenReturn(false);
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        companyFollowService.followCompany(1L, 10L);

        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
        ArgumentCaptor<UserFollowCompany> followCaptor = ArgumentCaptor.forClass(UserFollowCompany.class);

        verify(notificationRepository).save(notificationCaptor.capture());
        verify(userFollowCompanyRepository).save(followCaptor.capture());

        assertTrue(notificationCaptor.getValue().getContent().contains("ITing"));
        assertEquals(1L, followCaptor.getValue().getUserId());
        assertEquals(10L, followCaptor.getValue().getCompanyId());
    }

    @Test
    void getFollowedCompanies_shouldNormalizeInvalidPaginationAndMapCompanyData() {
        UserFollowCompany follow = UserFollowCompany.builder()
                .userId(1L)
                .companyId(10L)
                .followDate(LocalDateTime.of(2026, 4, 1, 8, 0))
                .build();

        when(userFollowCompanyRepository.findByUserId(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(follow)));
        when(companyRepository.findById(10L)).thenReturn(Optional.of(company));

        Page<FollowedCompanyResponse> result = companyFollowService.getFollowedCompanies(1L, -1, 0);

        assertEquals(1, result.getContent().size());
        assertEquals("ITing", result.getContent().get(0).getCompanyName());

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(userFollowCompanyRepository).findByUserId(any(), pageableCaptor.capture());
        assertEquals(0, pageableCaptor.getValue().getPageNumber());
        assertEquals(10, pageableCaptor.getValue().getPageSize());
    }
}
