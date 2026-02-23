package com.iting.jobportal.auth.security;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.core.domain.auth.Role;
import com.iting.jobportal.admin.entity.Permission;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

public class AuthUser implements UserDetails {
    
    private final Account account;
    
    public AuthUser(Account account) {
        this.account = account;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Convert Role + Permission → GrantedAuthority
        return account.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(permission -> new SimpleGrantedAuthority(permission.getCode()))
                .collect(Collectors.toSet());
    }
    
    @Override
    public String getPassword() {
        return account.getPasswordHash();
    }
    
    @Override
    public String getUsername() {
        return account.getEmail();
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return account.getStatus().equals(com.iting.jobportal.auth.entity.Enum.AccountStatus.ACTIVE);
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return account.getStatus().equals(com.iting.jobportal.auth.entity.Enum.AccountStatus.ACTIVE);
    }
    
    public Long getId() {
        return account.getId();
    }
    
    public Set<String> getRoles() {
        return account.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet());
    }
    
    public Set<String> getPermissions() {
        return account.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(permission -> permission.getCode())
                .collect(Collectors.toSet());
    }
}
