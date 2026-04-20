# 🔐 JWT & REFRESH TOKEN IMPLEMENTATION GUIDE

## 📋 MỤC LỤC

- [Tổng quan](#tổng-quan)
- [Architecture](#architecture)
- [Implementation Details](#implementation-details)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Usage Examples](#usage-examples)
- [Testing](#testing)

---

## 🎯 TỔNG QUAN

### **Trạng thái hiện tại**
```
✅ JWT Access Token  - Đã implement
✅ Refresh Token     - Mới implement
✅ Token Rotation    - Đã có
✅ Token Limit       - Đã có
✅ Token Revocation  - Đã có
```

### **Token Types**
| **Token Type** | **Purpose** | **Expiration** | **Storage** |
|----------------|-------------|----------------|-------------|
| **Access Token** | API authentication | 24 hours | Memory/LocalStorage |
| **Refresh Token** | Get new access token | 7 days | Database + HttpOnly Cookie |

---

## 🏗️ ARCHITECTURE

### **Flow Diagram**
```
1. Login Request
   ↓
2. Validate Credentials
   ↓
3. Generate Access Token (24h)
4. Generate Refresh Token (7d)
   ↓
5. Store Refresh Token in DB
   ↓
6. Return Both Tokens

7. API Request with Access Token
   ↓
8. Validate Access Token
   ↓
9. If Valid → Process Request
   ↓
10. If Expired → Use Refresh Token
    ↓
11. Validate Refresh Token
    ↓
12. Generate New Access Token
    ↓
13. Mark Old Refresh Token as Used
14. Generate New Refresh Token
    ↓
15. Return New Tokens
```

### **Database Schema**
```sql
-- refresh_tokens table
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_id VARCHAR(255) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    token TEXT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    is_revoked BOOLEAN DEFAULT FALSE,
    device_info VARCHAR(255),
    ip_address VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 IMPLEMENTATION DETAILS

### **1. Core Components**

#### **JwtTokenUtil** (Access Token)
```java
@Component
public class JwtTokenUtil {
    // ✅ Already implemented
    // Generates 24-hour access token
    // Contains user info and role
}
```

#### **RefreshTokenUtil** (Refresh Token)
```java
@Component
public class RefreshTokenUtil {
    // ✅ New implementation
    // Generates 7-day refresh token
    // Contains unique token ID
    // Separate secret key from access token
}
```

#### **RefreshToken Entity**
```java
@Entity
public class RefreshToken extends AuditEntity {
    // ✅ New implementation
    // Tracks token usage and revocation
    // Stores device info and IP
    // Supports token rotation
}
```

### **2. Security Features**

#### **Token Rotation**
```java
// Each refresh generates new refresh token
// Old token is marked as used
// Prevents token reuse attacks
```

#### **Token Limit**
```java
// Max 5 active tokens per user
// Oldest token revoked when limit exceeded
// Prevents token accumulation
```

#### **Token Revocation**
```java
// Individual token revocation
// All tokens revocation (logout all)
// Automatic cleanup of expired tokens
```

---

## 🚀 API ENDPOINTS

### **1. Login (Updated)**
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123",
    "deviceInfo": "Chrome on Windows",
    "ipAddress": "192.168.1.100"
}
```

**Response:**
```json
{
    "userId": 1,
    "email": "user@example.com",
    "role": "CANDIDATE",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400
}
```

### **2. Refresh Token**
```http
POST /api/auth/refresh
Content-Type: application/json

{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "deviceInfo": "Chrome on Windows",
    "ipAddress": "192.168.1.100"
}
```

**Response:**
```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400
}
```

### **3. Logout**
```http
POST /api/auth/logout
Authorization: Bearer {access_token}
```

### **4. Logout All Devices**
```http
POST /api/auth/logout-all
X-User-Id: 1
```

---

## 🛡️ SECURITY FEATURES

### **1. Token Validation**
```java
public boolean validateRefreshToken(String token) {
    try {
        // Validate JWT signature
        // Check token type = "refresh"
        // Verify not expired
        return true;
    } catch (Exception e) {
        return false;
    }
}
```

### **2. Token Usage Tracking**
```java
public boolean isValid() {
    return !isUsed && !isRevoked && !isExpired();
}
```

### **3. Device & IP Tracking**
```java
RefreshToken refreshToken = RefreshToken.builder()
    .deviceInfo("Chrome on Windows")
    .ipAddress("192.168.1.100")
    .build();
```

### **4. Automatic Cleanup**
```java
@Scheduled(cron = "0 0 2 * * *") // Daily at 2 AM
public void cleanupExpiredTokens() {
    refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
}
```

---

## 📱 USAGE EXAMPLES

### **Frontend Implementation**

#### **Login Flow**
```javascript
async function login(credentials) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...credentials,
            deviceInfo: navigator.userAgent,
            ipAddress: await getClientIP()
        })
    });
    
    const data = await response.json();
    
    // Store tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    return data;
}
```

#### **Token Refresh**
```javascript
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            refreshToken: refreshToken,
            deviceInfo: navigator.userAgent,
            ipAddress: await getClientIP()
        })
    });
    
    const data = await response.json();
    
    // Update tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    return data.accessToken;
}
```

#### **API Request with Auto-Refresh**
```javascript
async function apiRequest(url, options = {}) {
    let accessToken = localStorage.getItem('accessToken');
    
    // Add token to headers
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
    };
    
    let response = await fetch(url, options);
    
    // If token expired, try refresh
    if (response.status === 401) {
        try {
            accessToken = await refreshAccessToken();
            options.headers['Authorization'] = `Bearer ${accessToken}`;
            response = await fetch(url, options);
        } catch (refreshError) {
            // Refresh failed, redirect to login
            logout();
            throw new Error('Session expired');
        }
    }
    
    return response;
}
```

---

## 🧪 TESTING

### **1. Unit Tests**
```java
@Test
public void testRefreshTokenGeneration() {
    String refreshToken = refreshTokenUtil.generateRefreshToken(1L, "test@example.com");
    
    assertThat(refreshTokenUtil.validateRefreshToken(refreshToken)).isTrue();
    assertThat(refreshTokenUtil.getEmailFromRefreshToken(refreshToken)).isEqualTo("test@example.com");
    assertThat(refreshTokenUtil.getUserIdFromRefreshToken(refreshToken)).isEqualTo(1L);
}

@Test
public void testTokenRotation() {
    // Create initial refresh token
    RefreshToken initialToken = refreshTokenService.createRefreshToken(1L, "test@example.com", "device", "ip");
    
    // Use it to get new tokens
    TokenResponse response = refreshTokenService.refreshToken(
        RefreshTokenRequest.builder()
            .refreshToken(initialToken.getToken())
            .build()
    );
    
    // Initial token should be marked as used
    assertThat(initialToken.isUsed()).isTrue();
    
    // Should have new refresh token
    assertThat(response.getRefreshToken()).isNotEqualTo(initialToken.getToken());
}
```

### **2. Integration Tests**
```java
@Test
public void testLoginWithRefreshToken() {
    LoginRequest request = LoginRequest.builder()
        .email("test@example.com")
        .password("password")
        .deviceInfo("Test Device")
        .ipAddress("127.0.0.1")
        .build();
    
    ResponseEntity<LoginResponse> response = authController.login(request);
    
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody().getAccessToken()).isNotNull();
    assertThat(response.getBody().getRefreshToken()).isNotNull();
}

@Test
public void testRefreshTokenFlow() {
    // First login
    LoginResponse loginResponse = authService.login(loginRequest);
    
    // Use refresh token
    RefreshTokenRequest refreshRequest = RefreshTokenRequest.builder()
        .refreshToken(loginResponse.getRefreshToken())
        .build();
    
    TokenResponse tokenResponse = refreshTokenService.refreshToken(refreshRequest);
    
    assertThat(tokenResponse.getAccessToken()).isNotNull();
    assertThat(tokenResponse.getRefreshToken()).isNotNull();
}
```

### **3. Security Tests**
```java
@Test
public void testInvalidRefreshToken() {
    assertThatThrownBy(() -> 
        refreshTokenService.refreshToken(
            RefreshTokenRequest.builder()
                .refreshToken("invalid-token")
                .build()
        )
    ).isInstanceOf(RuntimeException.class)
     .hasMessageContaining("Invalid refresh token");
}

@Test
public void testExpiredRefreshToken() {
    // Create expired token
    RefreshToken expiredToken = RefreshToken.builder()
        .tokenId("expired-token")
        .userId(1L)
        .email("test@example.com")
        .token("expired-jwt")
        .expiryDate(LocalDateTime.now().minusDays(1))
        .build();
    
    refreshTokenRepository.save(expiredToken);
    
    assertThatThrownBy(() -> 
        refreshTokenService.refreshToken(
            RefreshTokenRequest.builder()
                .refreshToken("expired-jwt")
                .build()
        )
    ).isInstanceOf(RuntimeException.class);
}
```

---

## 📊 CONFIGURATION SUMMARY

### **Application Properties**
```properties
# JWT Access Token
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration=86400000  # 24 hours

# JWT Refresh Token
jwt.refresh.secret=7134743777217A25432A462D4A614E645267556B58703272357538782F413F4428472B4B6250645367566B5970
jwt.refresh.expiration=604800000  # 7 days
jwt.refresh.max-tokens-per-user=5
```

### **Security Headers**
```java
// Add to SecurityConfig
@Override
protected void configure(HttpSecurity http) throws Exception {
    http
        .csrf().disable()
        .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        .and()
        .authorizeRequests()
        .antMatchers("/api/auth/login", "/api/auth/refresh").permitAll()
        .anyRequest().authenticated();
}
```

---

## 🚀 DEPLOYMENT CHECKLIST

### **Before Production**
- [ ] Update JWT secrets with strong random values
- [ ] Set appropriate token expiration times
- [ ] Configure HTTPS for all endpoints
- [ ] Set up token cleanup scheduled job
- [ ] Test token rotation thoroughly
- [ ] Verify rate limiting implementation

### **Monitoring**
- [ ] Log token generation and refresh events
- [ ] Monitor failed refresh attempts
- [ ] Track active tokens per user
- [ ] Alert on suspicious token usage

---

**Last Updated**: 2026-02-15  
**Version**: 1.0  
**Status**: ✅ Implemented
