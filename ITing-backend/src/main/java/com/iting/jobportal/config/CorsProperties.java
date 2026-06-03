package com.iting.jobportal.config;

import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CorsProperties {

  private final List<String> allowedOrigins;

  public CorsProperties(
      @Value("${cors.allowed-origins:http://localhost:3000}") String allowedOrigins) {
    this.allowedOrigins =
        Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .toList();
  }

  public List<String> getAllowedOrigins() {
    return allowedOrigins;
  }
}
