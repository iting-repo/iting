package com.iting.jobportal.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {

        private static final String SECURITY_SCHEME_NAME = "bearerAuth";

        @Bean
        public OpenAPI customOpenAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("🏸ITing API")
                                                .version("1.0.0")
                                                .description("API Documentation cho hệ thống xin việc làm. " +
                                                                "Bao gồm các module: HR (Nhà tuyển dụng), Candidate (Người xin việc), Admin.")
                                                .contact(new Contact()
                                                                .name("ITing Team")
                                                                .email("support@itington.com")
                                                                .url("https://itington.com"))
                                                .license(new License()
                                                                .name("MIT License")
                                                                .url("https://opensource.org/licenses/MIT")))
                                .servers(List.of(
                                                new Server().url("/").description("Default")))

                                .components(new Components().addSecuritySchemes(
                                                SECURITY_SCHEME_NAME,
                                                new SecurityScheme()
                                                                .name(SECURITY_SCHEME_NAME)
                                                                .type(SecurityScheme.Type.HTTP)
                                                                .scheme("bearer")
                                                                .bearerFormat("JWT")))

                                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME));
        }
}
