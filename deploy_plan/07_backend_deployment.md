# Task 07: Backend Deployment (Spring Boot + OpenTelemetry)

## Objective

Deploy the ITing Spring Boot backend as a Docker container on the EC2 instance, integrated with OpenTelemetry for distributed tracing, Redis for caching/rate limiting, Kafka for messaging, and RDS PostgreSQL for persistence.

## Prerequisites

- Task 02 completed (Docker foundation, .env, iting-net network)
- Task 03 completed (RDS PostgreSQL configured)
- Task 04 completed (Redis container running)
- Task 05 completed (Kafka + Zookeeper running)
- Task 06 completed (Nginx reverse proxy with SSL)

## Step-by-Step Instructions

### 7.1 Update Backend Dockerfile for Production

The existing `ITing-backend/Dockerfile` is mostly good but needs OTel agent addition. Create an updated production Dockerfile:

```bash
# On your local machine, create an updated Dockerfile
cat > ITing-backend/Dockerfile.prod << 'DOCKERFILEEOF'
# ==========================================
# ITing Backend - Production Dockerfile
# Spring Boot + OpenTelemetry Java Agent
# ==========================================

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
RUN gradle clean bootJar --no-daemon \
    --no-build-cache \
    -Porg.gradle.parallel=true \
    -Dorg.gradle.jvmargs="-Xmx512m"

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jre-alpine

# Install curl for health checks and download OTel agent
RUN apk add --no-cache curl && \
    curl -L -o /opt/opentelemetry-javaagent.jar \
      https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -s /bin/sh -D appuser

# Copy JAR from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Create layered jar extraction directory
RUN mkdir -p /app/loader && \
    unzip -q -o /app/app.jar -d /app/loader && \
    rm /app/app.jar && \
    chown -R appuser:appgroup /app

USER appuser

# Expose port
EXPOSE 8080

# Optimized JVM args for containers
ENV JAVA_OPTS="-XX:+UseZGC -XX:MaxRAMPercentage=75.0 -Xms256m -Xmx768m"

# OpenTelemetry configuration (set via environment variables in docker-compose)
ENV OTEL_JAVAAGENT_ENABLED=true
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
ENV OTEL_SERVICE_NAME=iting-backend
ENV OTEL_TRACES_EXPORTER=otlp
ENV OTEL_METRICS_EXPORTER=otlp
ENV OTEL_LOGS_EXPORTER=none
ENV OTEL_INSTRUMENTATION_SPRING-MVC_ENABLED=true
ENV OTEL_INSTRUMENTATION_JDBC_ENABLED=true
ENV OTEL_INSTRUMENTATION_REDIS_ENABLED=true
ENV OTEL_INSTRUMENTATION_KAFKA_ENABLED=true

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run with OTel agent and production profile
ENTRYPOINT ["sh", "-c", "java \
  -javaagent:/opt/opentelemetry-javaagent.jar \
  -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod} \
  ${JAVA_OPTS} \
  -cp /app/loader org.springframework.boot.loader.launch.JarLauncher"]
DOCKERFILEEOF
```

### 7.2 Add Actuator Prometheus Endpoint

Update `ITing-backend/src/main/resources/application-prod.properties` (or create it):

```properties
# ==========================================
# ITing Backend - Production Configuration
# ==========================================

# Server
server.port=8080
server.shutdown=graceful
server.compression.enabled=true
server.compression.mime-types=application/json,text/html,text/xml,text/plain

# Database (RDS)
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?currentSchema=${DB_SCHEMA}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.max-lifetime=1200000

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=none
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=false
spring.jpa.properties.hibernate.default_schema=${DB_SCHEMA}

# Flyway
spring.flyway.enabled=true
spring.flyway.default-schema=${DB_SCHEMA}
spring.flyway.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.flyway.user=${DB_USERNAME}
spring.flyway.password=${DB_PASSWORD}
spring.flyway.schemas=${DB_SCHEMA}

# Kafka
spring.kafka.bootstrap-servers=${KAFKA_BROKERS}
spring.kafka.consumer.group-id=iting-group
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.apache.kafka.common.serialization.StringSerializer

# Redis
spring.data.redis.host=${REDIS_HOST}
spring.data.redis.port=${REDIS_PORT}
spring.data.redis.password=${REDIS_PASSWORD}
spring.data.redis.timeout=5000ms
spring.data.redis.lettuce.pool.max-active=8
spring.data.redis.lettuce.pool.max-idle=8
spring.data.redis.lettuce.pool.min-idle=2
spring.cache.type=redis
spring.cache.redis.time-to-live=30m

# Rate Limiting (Redis-based)
iting.rate-limit.enabled=true
iting.rate-limit.default-max-requests=100
iting.rate-limit.default-window-seconds=60

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION}
jwt.refresh.secret=${JWT_REFRESH_SECRET}
jwt.refresh.expiration=${JWT_REFRESH_EXPIRATION}
jwt.refresh.max-tokens-per-user=5

# AWS S3
aws.access-key=${AWS_ACCESS_KEY}
aws.secret-key=${AWS_SECRET_KEY}
aws.region=${AWS_REGION}
aws.s3.bucket=${AWS_S3_BUCKET}
aws.enabled=${AWS_ENABLED}

# CORS
cors.origins=${CORS_ORIGINS}

# Swagger (disable in production)
springdoc.api-docs.enabled=false
springdoc.swagger-ui.enabled=false

# Actuator - Expose health, info, metrics, and prometheus
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=when-authorized
management.health.mail.enabled=false
management.metrics.export.prometheus.enabled=true

# Logging
logging.level.root=INFO
logging.level.com.iting=INFO
logging.level.org.springframework.security=WARN
logging.level.org.hibernate=WARN

# Application name
spring.application.name=iting-job-portal

# Email
spring.mail.host=${MAIL_HOST}
spring.mail.port=${MAIL_PORT}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Google OAuth
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
```

### 7.3 Build and Push Backend Docker Image

```bash
# On the local development machine
cd ITing-backend

# Build the Docker image (local build/test only)
docker build -f Dockerfile.prod -t iting-backend:latest .

# Test locally
docker run -d --name iting-backend-test \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  -e DB_NAME=iting_job_portal \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=test \
  -e SPRING_PROFILES_ACTIVE=prod \
  -p 8080:8080 \
  iting-backend:latest

# Wait for startup and test health
sleep 30
curl -f http://localhost:8080/actuator/health

# CI/CD will build and push the backend image to GHCR.
# EC2 pulls the image during the deploy job (no SCP of images).
```

### 7.4 Add Backend Service to docker-compose.yml

```bash
cat >> ./deploy/docker-compose.yml << 'COMPOSEEOF'

  # ========================================
  # Backend - Spring Boot API
  # ========================================
  backend:
    image: ${BACKEND_IMAGE}
    container_name: iting-backend
    restart: unless-stopped
    networks:
      - iting-net
    depends_on:
      redis:
        condition: service_healthy
      kafka:
        condition: service_healthy
    env_file:
      - .env
    environment:
      # Database (RDS)
      SPRING_DATASOURCE_URL: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?currentSchema=${DB_SCHEMA}
      SPRING_DATASOURCE_USERNAME: ${DB_USERNAME}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE: 20
      SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE: 5

      # JPA/Hibernate
      SPRING_JPA_HIBERNATE_DDL_AUTO: none
      SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT: org.hibernate.dialect.PostgreSQLDialect
      SPRING_JPA_PROPERTIES_HIBERNATE_FORMAT_SQL: "false"
      SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA: ${DB_SCHEMA}

      # Flyway
      SPRING_FLYWAY_ENABLED: "true"
      SPRING_FLYWAY_DEFAULT_SCHEMA: ${DB_SCHEMA}
      SPRING_FLYWAY_URL: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
      SPRING_FLYWAY_USER: ${DB_USERNAME}
      SPRING_FLYWAY_PASSWORD: ${DB_PASSWORD}

      # Kafka
      SPRING_KAFKA_BOOTSTRAP_SERVERS: ${KAFKA_BROKERS}

      # Redis
      SPRING_DATA_REDIS_HOST: ${REDIS_HOST}
      SPRING_DATA_REDIS_PORT: ${REDIS_PORT}
      SPRING_DATA_REDIS_PASSWORD: ${REDIS_PASSWORD}
      SPRING_CACHE_TYPE: redis

      # JWT
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION: ${JWT_EXPIRATION}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      JWT_REFRESH_EXPIRATION: ${JWT_REFRESH_EXPIRATION}

      # AWS S3
      AWS_ACCESS_KEY: ${AWS_ACCESS_KEY}
      AWS_SECRET_KEY: ${AWS_SECRET_KEY}
      AWS_REGION: ${AWS_REGION}
      AWS_S3_BUCKET: ${AWS_S3_BUCKET}
      AWS_ENABLED: ${AWS_ENABLED}

      # CORS
      CORS_ORIGINS: ${CORS_ORIGINS}

      # Swagger (disable for prod)
      SPRINGDOC_API_DOCS_ENABLED: "false"
      SPRINGDOC_SWAGGER_UI_ENABLED: "false"

      # Actuator + Prometheus
      MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE: health,info,metrics,prometheus
      MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS: when-authorized
      MANAGEMENT_HEALTH_MAIL_ENABLED: "false"
      MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED: "true"

      # Logging
      LOGGING_LEVEL_ROOT: INFO
      LOGGING_LEVEL_COM_ITING: INFO
      LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY: WARN

      # Application
      SPRING_APPLICATION_NAME: iting-job-portal
      SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE}
      SERVER_PORT: 8080
      SERVER_SHUTDOWN: graceful

      # Email
      SPRING_MAIL_HOST: ${MAIL_HOST}
      SPRING_MAIL_PORT: ${MAIL_PORT}
      SPRING_MAIL_USERNAME: ${MAIL_USERNAME}
      SPRING_MAIL_PASSWORD: ${MAIL_PASSWORD}

      # Google OAuth
      SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}

      # OpenTelemetry
      OTEL_JAVAAGENT_ENABLED: "true"
      OTEL_EXPORTER_OTLP_ENDPOINT: http://otel-collector:4317
      OTEL_SERVICE_NAME: iting-backend
      OTEL_RESOURCE_ATTRIBUTES: service.name=iting-backend,service.namespace=iting,deployment.environment=prod
      OTEL_TRACES_EXPORTER: otlp
      OTEL_METRICS_EXPORTER: otlp
      OTEL_LOGS_EXPORTER: none
    ports:
      - "8080:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 5s
      retries: 5
      start_period: 60s
    deploy:
      resources:
        limits:
          memory: 768M
        reservations:
          memory: 512M
    logging:
      driver: json-file
      options:
        max-size: "50m"
        max-file: "5"
COMPOSEEOF
```

### 7.5 Start Backend and Verify

```bash
cd /opt/iting

# Start backend
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod up -d backend

# Wait for startup (Spring Boot takes ~30-60 seconds)
echo "Waiting for backend to start (this may take 60 seconds)..."
for i in {1..12}; do
  if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "Backend is healthy!"
    break
  fi
  echo "Waiting... ($i/12)"
  sleep 10
done

# Verify backend health
curl -f http://localhost:8080/actuator/health | jq .

# Verify Prometheus metrics endpoint
curl -s http://localhost:8080/actuator/prometheus | head -20

# Verify backend logs
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod logs backend --tail=30

# Test through Nginx (after Task 06)
curl -f https://api.datnhk252iting.dpdns.org/actuator/health | jq .
```

## Verification

```bash
# 1. Container is running
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod ps backend

# 2. Health endpoint responds
curl -f http://localhost:8080/actuator/health

# 3. Prometheus metrics available
curl -s http://localhost:8080/actuator/prometheus | grep jvm_memory_used

# 4. Redis connectivity (from backend logs)
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod logs backend | grep -i redis | head -5

# 5. Kafka connectivity (from backend logs)
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod logs backend | grep -i kafka | head -5

# 6. Database connectivity (from backend logs)
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod logs backend | grep -i "datasource\|hibernate\|flyway" | head -5

# 7. OpenTelemetry agent loaded
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod logs backend | grep -i "opentelemetry\|otel" | head -5

# 8. SSL access through Nginx (after Task 06)
curl -f https://api.datnhk252iting.dpdns.org/actuator/health
```

## Rollback

```bash
# Stop backend
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod down backend

# Revert to previous image version
docker tag iting-backend:previous iting-backend:latest

# Remove backend image
docker rmi iting-backend:latest
```

## References

- `ITing-backend/Dockerfile` - Existing Dockerfile (base template)
- `ITing-backend/docker-compose.yml` - Existing compose for reference
- `ITing-backend/build.gradle` - Build dependencies
- `ITing-backend/.env.production` - Production environment template
- `.opencode/create-github-action-workflow-specification/SKILL.md` - CI/CD workflow specification
