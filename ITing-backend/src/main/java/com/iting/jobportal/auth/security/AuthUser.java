package com.iting.jobportal.auth.security;

import com.iting.jobportal.auth.entity.Account;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class AuthUser implements UserDetails {
    
    private final Account account;
    
    public AuthUser(Account account) {
        this.account = account;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptySet();
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
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    public Long getId() {
        return account.getId();
    }
}
