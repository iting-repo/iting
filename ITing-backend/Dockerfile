# ==========================================
# DOCKERFILE FOR AWS EC2 DEPLOYMENT
# Optimized for fast startup with Gradle + Layered JARs
# ==========================================

# syntax=docker/dockerfile:1.4

# Stage 1: Build stage
FROM gradle:8.5-jdk17-alpine AS build

WORKDIR /app

# Copy build configuration first (better layer caching)
COPY build.gradle settings.gradle* ./

# Create empty src to prevent build failures if missing
RUN mkdir -p src/main/java src/main/resources

# Pre-download dependencies (cache layer)
RUN gradle dependencies --no-daemon || true

# Copy source code
COPY src ./src

# Build with layered JARs for faster container startup
RUN gradle bootJar --no-daemon \
    --no-build-cache \
    -Porg.gradle.parallel=true \
    -Dorg.gradle.jvmargs="-Xmx512m"

# Stage 2: Runtime stage - Minimal JRE for faster startup
FROM eclipse-temurin:17-jre-alpine

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -s /bin/sh -D appuser

# Copy JAR from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Create layered jar extraction directory
RUN mkdir -p /app/loader && \
    unzip -q -o /app/app.jar -d /app/loader && \
    rm /app/app.jar

# Change ownership
RUN chown -R appuser:appgroup /app

USER appuser

# Expose port
EXPOSE 8080

# Optimized JVM args for containers:
# -XX:+UseZGC: Low-latency GC, faster startup
# -XX:MaxRAMPercentage: Use container memory efficiently
# -Xlog:gc*: Enable GC logging for debugging
# -Dspring.context.startup.analyzer.enabled=false: Skip startup analysis for faster boot
ENV JAVA_OPTS="-XX:+UseZGC -XX:MaxRAMPercentage=75.0 -Xms256m -Xmx512m"

# Health check - use actuator (faster than wget)
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run with production profile
ENTRYPOINT ["sh", "-c", "java -Dspring.profiles.active=prod $JAVA_OPTS -cp /app/loader org.springframework.boot.loader.launch.JarLauncher"]
