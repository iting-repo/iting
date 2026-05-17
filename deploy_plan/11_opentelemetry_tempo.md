# Task 11: OpenTelemetry + Tempo (Distributed Tracing)

## Objective

Deploy OpenTelemetry Collector for instrumentation collection and Grafana Tempo for distributed tracing storage. The backend Spring Boot application uses the OTel Java agent (configured in Task 07) to send traces to the OTel Collector, which forwards them to Tempo.

## Prerequisites
- Task 02 completed (Docker foundation)
- Task 07 completed (Backend with OTel Java agent configured)
- Task 09 completed (Prometheus + Grafana running)

## Step-by-Step Instructions

### 11.1 Create Tempo Configuration

```bash
ssh -i iting-key-pair.pem ubuntu@$PUBLIC_IP

cat > ./deploy/monitoring/tempo/tempo-config.yml << 'TEMPOEOF'
# ITing Tempo Configuration
# Reference: https://grafana.com/docs/tempo/latest/configuration/

server:
  http_listen_port: 3200
  grpc_listen_port: 9095
  log_level: warn

distributor:
  receivers:
    otlp:
      protocols:
        grpc:
          endpoint: "0.0.0.0:4317"
        http:
          endpoint: "0.0.0.0:4318"

storage:
  trace:
    backend: local
    local:
      path: /var/tempo/traces
    wal:
      path: /var/tempo/wal
    pool:
      max_workers: 10
      queue_depth: 1000

compactor:
  compaction:
    compaction_window: 1h
    max_block_bytes: 100_000_000
    block_retention: 168h  # 7 days

metrics_generator:
  registry:
    external_labels:
      source: tempo
      cluster: iting-production
  storage:
    path: /var/tempo/generator/wal
    remote_write:
      - url: http://prometheus:9090/api/v1/write
        send_exemplars: true

overrides:
  defaults:
    metrics_generator:
      processors: [service-graphs, span-metrics]
TEMPOEOF
```

### 11.2 Create OTel Collector Configuration

```bash
cat > ./deploy/config/otel/otel-collector-config.yaml << 'OTELEOF'
# ITing OpenTelemetry Collector Configuration
# Reference: .opencode/skills/monitoring-observability/skills/assets/templates/otel-config/collector-config.yaml

receivers:
  # Receive traces from OTel SDK/agents
  otlp:
    protocols:
      grpc:
        endpoint: "0.0.0.0:4317"
        max_recv_msg_size_mib: 4
      http:
        endpoint: "0.0.0.0:4318"

  # Receive Prometheus metrics for forwarding
  prometheus:
    config:
      scrape_configs:
        - job_name: 'otel-collector'
          scrape_interval: 10s
          static_configs:
            - targets: ['localhost:8888']

processors:
  # Batch processing for efficiency
  batch:
    send_batch_size: 1024
    timeout: 5s
    send_batch_max_size: 2048

  # Add resource attributes
  resource:
    attributes:
      - key: environment
        value: production
        action: upsert
      - key: deployment.environment
        value: production
        action: upsert

  # Memory limiter to prevent OOM
  memory_limiter:
    check_interval: 1s
    limit_mib: 256
    spike_limit_mib: 64

  # Filter out health checks and actuator noise
  filter:
    error_mode: ignore
    traces:
      span:
        - 'attributes["http.route"] == "/actuator/health"'
        - 'attributes["http.route"] == "/actuator/info"'

exporters:
  # Export traces to Tempo
  otlphttp:
    endpoint: "http://tempo:4318"
    tls:
      insecure: true

  # Export to Prometheus for trace-derived metrics
  prometheus:
    endpoint: "0.0.0.0:8889"
    namespace: "iting"

  # Export logs to Loki
  loki:
    endpoint: "http://loki:3100/loki/api/v1/push"
    default_labels_enabled:
      exporter: false
      job: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, filter, resource, batch]
      exporters: [otlphttp]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, resource, batch]
      exporters: [prometheus]

  telemetry:
    logs:
      level: warn
OTELEOF
```

### 11.3 Add Tempo and OTel Collector to docker-compose.yml

```bash
cat >> ./deploy/docker-compose.yml << 'COMPOSEEOF'

  # ========================================
  # Tempo - Distributed Tracing Storage
  # ========================================
  tempo:
    image: grafana/tempo:2.3.1
    container_name: iting-tempo
    restart: unless-stopped
    networks:
      - iting-net
    ports:
      - "3200:3200"   # Tempo HTTP API
      - "4317:4317"   # OTLP gRPC (used by backend)
      - "4318:4318"   # OTLP HTTP (used by collector)
    volumes:
      - ./monitoring/tempo/tempo-config.yml:/etc/tempo/tempo-config.yml:ro
      - iting_tempo_data:/var/tempo
    command: ["-config.file=/etc/tempo/tempo-config.yml"]
    healthcheck:
      test: ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:3200/ready || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 5
      start_period: 30s
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 128M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  # ========================================
  # OpenTelemetry Collector
  # ========================================
  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.91.0
    container_name: iting-otel-collector
    restart: unless-stopped
    networks:
      - iting-net
    ports:
      - "8889:8889"   # Prometheus metrics exporter
    volumes:
      - ./config/otel/otel-collector-config.yaml:/etc/otelcol-contrib/config.yaml:ro
    depends_on:
      tempo:
        condition: service_healthy
      loki:
        condition: service_healthy
    command: ["--config=/etc/otelcol-contrib/config.yaml"]
    healthcheck:
      test: ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:13133/ || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 64M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
COMPOSEEOF
```

### 11.4 Update Backend OTel Configuration

The backend was already configured with OTel environment variables in Task 07. Update the `OTEL_EXPORTER_OTLP_ENDPOINT` to point to the OTel Collector instead of directly to Tempo:

```bash
# In .env, verify/update:
# OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
# 
# This is already set in Task 02's .env file.
# The backend Dockerfile.prod also includes the OTel Java agent.
# Spring Boot will automatically pick up these environment variables.
```

### 11.5 Add Trace Search to Grafana

Update the Grafana datasource provisioning to add Tempo tracing:

```bash
# The Tempo datasource was already configured in Task 09's datasources.yml.
# Verify it's connecting properly.

# Update the datasources.yml if needed to add trace-to-log correlation
cat > ./deploy/monitoring/grafana/provisioning/datasources.yml << 'DSEOF'
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
    jsonData:
      timeInterval: "15s"

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    editable: false
    jsonData:
      maxLines: 1000

  - name: Tempo
    type: tempo
    access: proxy
    url: http://tempo:3200
    editable: false
    jsonData:
      tracesToMetrics:
        datasourceUid: prometheus
        tags:
          - key: 'service.name'
            value: 'service'
      tracesToLogs:
        datasourceUid: loki
        tags:
          - key: 'service.name'
            value: 'service'
          - key: 'traceId'
            value: 'traceId'
        spanStartTimeShift: '-1h'
        spanEndTimeShift: '1h'
        filterByTraceID: true
        filterBySpanID: false
      search:
        hide: false
      nodeGraph:
        enabled: true
DSEOF
```

### 11.6 Start Tempo and OTel Collector

```bash
cd /opt/iting

# Start Tempo and OTel Collector
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod up -d tempo otel-collector

# Wait for startup
sleep 15

# Verify Tempo
curl -s http://localhost:3200/ready
# Expected: ready

# Verify OTel Collector
curl -s http://localhost:13133/
# Expected: up

# Verify OTel Collector metrics
curl -s http://localhost:8889/metrics | head -20

# Restart backend to pick up OTel agent changes (if needed)
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod restart backend

# Wait for backend to start
sleep 30

# Generate a test trace
curl -s https://api.datnhk252iting.dpdns.org/actuator/health

# Search for traces in Tempo
curl -s "http://localhost:3200/api/traces?service=iting-backend&limit=10" | jq .

# Verify trace in Grafana
# Navigate to Grafana → Explore → Tempo → Search
```

## Verification

```bash
# All tracing containers running
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod ps tempo otel-collector

# Tempo is ready
curl -s http://localhost:3200/ready

# OTel Collector is healthy
curl -s http://localhost:13133/

# Backend is sending traces (check backend logs)
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod logs backend | grep -i "opentelemetry\|otel" | head -10

# Generate a trace and verify
curl -s https://api.datnhk252iting.dpdns.org/api/auth/health || true

# Search Tempo for recent traces
curl -s "http://localhost:3200/api/traces?service=iting-backend&limit=10"

# Verify Grafana Tempo datasource
curl -s -u admin:${GF_ADMIN_PASSWORD} http://localhost:3000/api/datasources/name/Tempo | jq .
```

## Rollback

```bash
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod down tempo otel-collector
docker volume rm iting_tempo_data
rm -rf /opt/iting/monitoring/tempo /opt/iting/config/otel
```

## References

- `.opencode/skills/monitoring-observability/skills/SKILL.md` - Distributed tracing section
- `.opencode/skills/monitoring-observability/skills/references/tracing_guide.md` - OpenTelemetry instrumentation patterns
- `.opencode/skills/monitoring-observability/skills/assets/templates/otel-config/collector-config.yaml` - OTel Collector template
