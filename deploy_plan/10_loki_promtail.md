# Task 10: Loki + Promtail (Logging)

## Objective

Deploy Loki for log aggregation and Promtail for log collection from all Docker containers. This provides centralized, searchable logs with integration to Grafana for visualization.

## Prerequisites
- Task 02 completed (Docker foundation)
- Task 09 completed (Prometheus + Grafana running)

## Step-by-Step Instructions

### 10.1 Create Loki Configuration

```bash
ssh -i iting-key-pair.pem ubuntu@$PUBLIC_IP

cat > /opt/iting/monitoring/loki/loki-config.yml << 'LOKIEOF'
# ITing Loki Configuration
# Reference: https://grafana.com/docs/loki/latest/configuration/

auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096
  log_level: warn

common:
  instance_addr: 127.0.0.1
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory

query_range:
  results_cache:
    cache:
      embedded_cache:
        enabled: true
        max_size_mb: 100

schema_config:
  configs:
    - from: 2020-10-24
      store: tsdb
      object_store: filesystem
      schema: v13
      index:
        prefix: index_
        period: 24h

storage_config:
  filesystem:
    directory: /loki/storage
  tsdb:
    dir: /loki/tsdb

compactor:
  working_directory: /loki/compactor
  compaction_interval: 10m
  retention_enabled: true
  retention_delete_threshold: 0
  delete_request_store: filesystem

limits_config:
  reject_old_samples: true
  reject_old_samples_max_age: 168h
  max_query_length: 721h
  max_entries_limit_per_query: 5000
  allow_structured_metadata: false

analytics:
  reporting_enabled: false
LOKIEOF
```

### 10.2 Create Promtail Configuration

```bash
cat > /opt/iting/monitoring/loki/promtail-config.yml << 'PROMTAILEOF'
# ITing Promtail Configuration

server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  # Docker container logs
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
        filters:
          - name: label
            values: ["com.docker.compose.project"]
    relabel_configs:
      # Container name
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container'
      # Container image
      - source_labels: ['__meta_docker_container_label_com_docker_compose_service']
        target_label: 'service'
      # Keep only ITing containers
      - source_labels: ['__meta_docker_container_label_com_docker_compose_project']
        regex: 'iting'
        action: keep

    pipeline_stages:
      # Parse Docker JSON logs
      - json:
          expressions:
            output: log
            stream: stream
            attrs:
      # Parse timestamp
      - timestamp:
          source: time
          format: RFC3339Nano
      # Add labels from log content
      - labels:
          stream:
          service:
          container:
      # Label structured logs from Spring Boot
      - match:
          selector: '{service="iting-backend"}'
          stages:
            - json:
                expressions:
                  level: level
                  logger: loggerName
                  traceId: traceId
                  spanId: spanId
            - labels:
                level:
                logger:
            - timestamp:
                source: timestamp
                format: RFC3339
      # Label Nginx access logs
      - match:
          selector: '{service="nginx-proxy"}'
          stages:
            - regex:
                expression: '^(?P<remote_addr>\S+) - (?P<remote_user>\S+) \[(?P<time>[^\]]+)\] "(?P<method>\S+) (?P<path>\S+) (?P<protocol>\S+)" (?P<status>\d+) (?P<body_bytes_sent>\d+) "(?P<referer>[^"]*)" "(?P<user_agent>[^"]*)"'
            - labels:
                method:
                status:
                path:
            - timestamp:
                source: time
                format: '02/Jan/2006:15:04:05 -0700'
PROMTAILEOF
```

### 10.3 Add Loki and Promtail to docker-compose.yml

```bash
cat >> /opt/iting/docker-compose.yml << 'COMPOSEEOF'

  # ========================================
  # Loki - Log Aggregation
  # ========================================
  loki:
    image: grafana/loki:2.9.3
    container_name: iting-loki
    restart: unless-stopped
    networks:
      - iting-net
    ports:
      - "3100:3100"
    volumes:
      - ./monitoring/loki/loki-config.yml:/etc/loki/config.yml:ro
      - iting_loki_data:/loki
    command: -config.file=/etc/loki/config.yml
    healthcheck:
      test: ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:3100/ready || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 5
      start_period: 15s
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

  # ========================================
  # Promtail - Log Shipper
  # ========================================
  promtail:
    image: grafana/promtail:2.9.3
    container_name: iting-promtail
    restart: unless-stopped
    networks:
      - iting-net
    volumes:
      - ./monitoring/loki/promtail-config.yml:/etc/promtail/config.yml:ro
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    command: -config.file=/etc/promtail/config.yml
    depends_on:
      - loki
    deploy:
      resources:
        limits:
          memory: 128M
        reservations:
          memory: 32M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
COMPOSEEOF
```

### 10.4 Start Loki and Promtail

```bash
cd /opt/iting

# Start Loki and Promtail
docker compose --env-file .env up -d loki promtail

# Wait for startup
sleep 10

# Verify Loki
curl -s http://localhost:3100/ready
# Expected: ready

# Verify Promtail
curl -s http://localhost:3100/loki/api/v1/labels | jq .
# Expected: list of label names

# Test log query
curl -s 'http://localhost:3100/loki/api/v1/query?query={service=~".+"}' | jq '.data.result[0].values[:2]'
```

### 10.5 Update Grafana Datasource for Loki

The Loki datasource was already configured in Task 09's `datasources.yml`. Verify the connection in Grafana:

```bash
# Check Grafana datasource status
source /opt/iting/.env
curl -s -u admin:${GF_ADMIN_PASSWORD} http://localhost:3000/api/datasources | jq '.[] | {name: .name, type: .type}'

# Test Loki query from Grafana
curl -s -u admin:${GF_ADMIN_PASSWORD} \
  'http://localhost:3000/api/datasources/proxy/2/loki/api/v1/query?query={service=~".+"}' | jq .

# Add a Loki log dashboard
# Navigate to Grafana → Explore → Loki → Log browser
```

## Verification

```bash
# Loki is running
docker compose --env-file .env ps loki promtail

# Loki is ready
curl -s http://localhost:3100/ready

# Promtail is shipping logs
curl -s 'http://localhost:3100/loki/api/v1/labels' | jq .

# Query backend logs
curl -s 'http://localhost:3100/loki/api/v1/query_range?query={service="iting-backend"}&limit=10' | jq '.data.result[0].values[:3]'

# Query nginx logs
curl -s 'http://localhost:3100/loki/api/v1/query_range?query={service="nginx-proxy"}&limit=10' | jq '.data.result[0].values[:3]'

# All Docker containers have logs
docker compose --env-file .env logs --tail=5 loki promtail
```

## Rollback

```bash
docker compose --env-file .env down loki promtail
docker volume rm iting_loki_data
rm -rf /opt/iting/monitoring/loki
```

## References

- `.opencode/skills/monitoring-observability/skills/SKILL.md` - Log aggregation section
- `.opencode/skills/monitoring-observability/skills/references/logging_guide.md` - Structured logging patterns