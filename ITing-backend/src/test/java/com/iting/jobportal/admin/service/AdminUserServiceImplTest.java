package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.dto.request.UpdateUserRequest;
import com.iting.jobportal.admin.dto.response.UserListResponse;
import com.iting.jobportal.admin.service.impl.AdminUserServiceImpl;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceImplTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminUserServiceImpl service;

    @Test
    void getAllUsers_shouldMapSupplementalUserFields() {
        Account account = Account.builder().id(1L).email("u@test.com").role(Role.CANDIDATE).status(AccountStatus.ACTIVE).build();
        User user = new User();
        user.setId(1L);
        user.setFullName("Test User");
        user.setAvatarUrl("/a.png");

        when(accountRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(account)));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Page<UserListResponse> result = service.getAllUsers(null, null, null, 0, 10);

        assertEquals(1, result.getContent().size());
        assertEquals("Test User", result.getContent().get(0).getFullName());
        assertEquals("/a.png", result.getContent().get(0).getAvatarUrl());
    }

    @Test
    void updateUser_shouldApplyProvidedRoleAndStatus() {
        Account account = Account.builder().id(2L).role(Role.CANDIDATE).status(AccountStatus.ACTIVE).build();
        UpdateUserRequest request = new UpdateUserRequest();
        request.setRole(Role.EMPLOYER);
        request.setStatus(AccountStatus.BANNED);

        when(accountRepository.findById(2L)).thenReturn(Optional.of(account));
        when(accountRepository.save(account)).thenReturn(account);
        when(userRepository.findById(2L)).thenReturn(Optional.empty());

        UserListResponse result = service.updateUser(1L, 2L, request);

        assertEquals(Role.EMPLOYER, account.getRole());
        assertEquals(AccountStatus.BANNED, account.getStatus());
        assertEquals(Role.EMPLOYER, result.getRole());
    }

    @Test
    void banAndUnbanUser_shouldToggleStatus() {
        Account account = Account.builder().id(2L).status(AccountStatus.ACTIVE).build();
        when(accountRepository.findById(2L)).thenReturn(Optional.of(account));

        service.banUser(1L, 2L, new com.iting.jobportal.admin.dto.request.BanUserRequest());
        assertEquals(AccountStatus.BANNED, account.getStatus());

        service.unbanUser(1L, 2L);
        assertEquals(AccountStatus.ACTIVE, account.getStatus());
        verify(accountRepository, org.mockito.Mockito.times(2)).save(account);
    }
}
