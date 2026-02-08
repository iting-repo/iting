package com.iting.jobportal.security.user;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.security.AuthUser;
import com.iting.jobportal.auth.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthUserDetailsService implements UserDetailsService {

    private final AccountRepository accountRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Account account = accountRepository.findByEmailWithRolesAndPermissions(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        log.debug("Loading user details for email: {} with {} roles and {} permissions",
                email, account.getRoles().size(),
                account.getRoles().stream()
                        .mapToInt(role -> role.getPermissions().size())
                        .sum());

        return new AuthUser(account);
    }
}
