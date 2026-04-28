package com.iting.jobportal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ItingJobPortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(ItingJobPortalApplication.class, args);
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
                    " /_/   \\_\\  |____/ \\___/  /_/   \\_\\_| \\_|"
            );


            System.out.println(cyan + "   >>>--- CUÙNG NHAU A ĐỒ ÁN :)" +
                    "! ---<<<" + reset + "\n");
        };
    }
}