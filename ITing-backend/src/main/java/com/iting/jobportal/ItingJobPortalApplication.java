package com.iting.jobportal;

import com.iting.jobportal.debug.DebugSessionLogger;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.context.event.ApplicationFailedEvent;
import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

@SpringBootApplication(scanBasePackages = {"com.iting.jobportal", "com.iting.service"})
@EnableScheduling
public class ItingJobPortalApplication {

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(ItingJobPortalApplication.class);
        application.addListeners((ApplicationListener<ApplicationStartedEvent>) event -> {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("activeProfiles", Arrays.asList(event.getApplicationContext().getEnvironment().getActiveProfiles()));
            data.put("serverPort", event.getApplicationContext().getEnvironment().getProperty("server.port"));
            data.put("datasourceUrl", sanitizeJdbcUrl(
                    event.getApplicationContext().getEnvironment().getProperty("spring.datasource.url")));
            data.put("redisHost", event.getApplicationContext().getEnvironment().getProperty("spring.data.redis.host"));
            data.put("redisPort", event.getApplicationContext().getEnvironment().getProperty("spring.data.redis.port"));
            data.put("mlEnabled", event.getApplicationContext().getEnvironment().getProperty("ml.service.enabled"));
            data.put("kafkaEnabled", event.getApplicationContext().getEnvironment().getProperty("spring.kafka.enabled"));

            // #region agent log
            DebugSessionLogger.log("pre-fix", "H1,H3", "ItingJobPortalApplication.java:31",
                    "ApplicationStartedEvent captured runtime config snapshot", data);
            // #endregion
        });
        application.addListeners((ApplicationListener<ApplicationFailedEvent>) event -> {
            Throwable exception = event.getException();
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("exceptionType", exception == null ? "unknown" : exception.getClass().getName());
            data.put("message", exception == null ? "unknown" : safeMessage(exception.getMessage()));

            // #region agent log
            DebugSessionLogger.log("pre-fix", "H1", "ItingJobPortalApplication.java:43",
                    "ApplicationFailedEvent captured backend startup failure", data);
            // #endregion
        });
        application.run(args);
    }

    @Bean
    public static CommandLineRunner finalGreeting() {
        return args -> {
            // Chờ 1 giây để các log khởi động của Spring và Hibernate chạy xong hẳn
            Thread.sleep(1000);

            // ANSI code cho màu sắc: Vàng (Yellow) và Xanh (Cyan)
            String yellow = "\u001B[33m";
            String cyan = "\u001B[36m";
            String reset = "\u001B[0m";

            System.out.println("\n" + yellow +
                    "     _       ____   ___       _    _   _ \n" +
                    "    / \\     |  _ \\ / _ \\     / \\  | \\ | |\n" +
                    "   / _ \\    | | | | | | |   / _ \\ |  \\| |\n" +
                    "  / ___ \\   | |_| | |_| |  / ___ \\| |\\  |\n" +
                    " /_/   \\_\\  |____/ \\___/  /_/   \\_\\_| \\_|");

            System.out.println(cyan + "   >>>--- CUÙNG NHAU A ĐỒ ÁN :)" +
                    "! ---<<<" + reset + "\n");
        };
    }

    private static String sanitizeJdbcUrl(String jdbcUrl) {
        if (jdbcUrl == null || jdbcUrl.isBlank()) {
            return "missing";
        }

        int querySeparator = jdbcUrl.indexOf('?');
        return querySeparator >= 0 ? jdbcUrl.substring(0, querySeparator) : jdbcUrl;
    }

    private static String safeMessage(String message) {
        if (message == null || message.isBlank()) {
            return "no-message";
        }
        return message.length() > 400 ? message.substring(0, 400) : message;
    }
}
