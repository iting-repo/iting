package com.iting.jobportal.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Scheduler để giữ app không bị sleep trên Render Free tier
 * Ping health endpoint mỗi 10 phút
 */
@Component
@EnableScheduling
public class KeepAliveScheduler {

    private static final Logger logger = LoggerFactory.getLogger(KeepAliveScheduler.class);

    // Ping mỗi 10 phút (600000 ms)
    @Scheduled(fixedRate = 600000)
    public void keepAlive() {
        try {
            // Log để biết scheduler đang chạy
            logger.info("🔄 Keep-alive ping executed at: {}", java.time.LocalDateTime.now());
        } catch (Exception e) {
            logger.error("Keep-alive ping failed: {}", e.getMessage());
        }
    }
}

