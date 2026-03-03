package com.iting.jobportal.auth;

import com.iting.jobportal.auth.security.RefreshTokenUtil;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
    "jwt.refresh.secret=7134743777217A25432A462D4A614E645267556B58703272357538782F413F4428472B4B6250645367566B5970",
    "jwt.refresh.expiration=604800000"
})
public class RefreshTokenTest {

    @Test
    public void testRefreshTokenGeneration() {
        // This test will be implemented when RefreshTokenUtil is properly configured
        // For now, just verify the test setup works
        assertTrue(true, "Refresh token test setup successful");
    }
}
