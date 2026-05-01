# Task 09: Prometheus + Node Exporter + Grafana

## Objective

Deploy the monitoring stack: Prometheus for metrics collection, Node Exporter for host-level metrics, and Grafana for dashboards and visualization. This follows the patterns from `.opencode/skills/monitoring-observability/skills/SKILL.md`.

## Prerequisites
- Task 02 completed (Docker foundation, iting-net network, volumes)
- Task 06 completed (Nginx with SSL for monitor.datnhk252iting.dpdns.org)

## Step-by-Step Instructions

### 9.1 Create Prometheus Configuration

```bash
ssh -i iting-key-pair.pem ubuntu@$PUBLIC_IP

cat > ./deploy/monitoring/prometheus/prometheus.yml << 'PROMEOF'
# ITing Prometheus Configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  scrape_timeout: 10s
  external_labels:
    cluster: 'iting-production'
    environment: 'production'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

# Load alert rules
rule_files:
  - '/etc/prometheus/alerts/*.yml'

# Scrape configurations
scrape_configs:
  # Prometheus self-monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
        labels:
          service: 'prometheus'

  # Node Exporter - Host metrics
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
        labels:
          service: 'node-exporter'

  # Spring Boot Backend
  - job_name: 'iting-backend'
    metrics_path: '/actuator/prometheus'
    scrape_interval: 15s
    static_configs:
      - targets: ['backend:8080']
        labels:
          service: 'iting-backend'
          application: 'iting-job-portal'

  # Redis metrics (via redis_exporter - optional)
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
        labels:
          service: 'redis'

  # Kafka JMX metrics (via jmx exporter)
  - job_name: 'kafka'
    static_configs:
      - targets: ['kafka:9092']
        labels:
          service: 'kafka'

  # Nginx metrics (via nginx-prometheus-exporter)
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']
        labels:
          service: 'nginx'

  # Grafana metrics
  - job_name: 'grafana'
    static_configs:
      - targets: ['grafana:3000']
        labels:
          service: 'grafana'

  # Loki metrics
  - job_name: 'loki'
    static_configs:
      - targets: ['loki:3100']
        labels:
          service: 'loki'

  # Tempo metrics
  - job_name: 'tempo'
    static_configs:
      - targets: ['tempo:3200']
        labels:
          service: 'tempo'
PROMEOF
```

### 9.2 Create Prometheus Alert Rules

```bash
mkdir -p /opt/iting/monitoring/prometheus/alerts

cat > ./deploy/monitoring/prometheus/alerts/iting-alerts.yml << 'ALERTEOF'
# ITing Alert Rules
# Reference: .opencode/skills/monitoring-observability/skills/SKILL.md (Alert Design)

groups:
  # Backend application alerts
  - name: iting-backend
    rules:
      - alert: BackendDown
        expr: up{job="iting-backend"} == 0
        for: 2m
        labels:
          severity: critical
          team: devops
        annotations:
          summary: "ITing Backend is down"
          description: "The ITing backend has been down for more than 2 minutes."

      - alert: BackendHighErrorRate
        expr: |
          sum(rate(http_server_requests_seconds_count{status=~"5..", job="iting-backend"}[5m]))
          /
          sum(rate(http_server_requests_seconds_count{job="iting-backend"}[5m])) > 0.05
        for: 5m
        labels:
          severity: warning
          team: devops
        annotations:
          summary: "Backend error rate > 5%"
          description: "The backend 5xx error rate is {{ $value | humanizePercentage }}."

      - alert: BackendHighLatency
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_server_requests_seconds_bucket{job="iting-backend"}[5m])) by (le)
          ) > 5
        for: 5m
        labels:
          severity: warning
          team: devops
        annotations:
          summary: "Backend p95 latency > 5s"
          description: "The 95th percentile latency is {{ $value }}s."

      - alert: BackendJVMHighMemory
        expr: jvm_memory_used_bytes{job="iting-backend"} / jvm_memory_max_bytes{job="iting-backend"} > 0.85
        for: 10m
        labels:
          severity: warning
          team: devops
        annotations:
          summary: "JVM memory usage > 85%"
          description: "JVM memory usage is at {{ $value | humanizePercentage }}."

  # Infrastructure alerts
  - name: iting-infrastructure
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 10m
        labels:
          severity: warning
          team: devops
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is {{ $value }}%."

      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 10m
        labels:
          severity: warning
          team: devops
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}%."

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 15
        for: 10m
        labels:
          severity: warning
          team: devops
        annotations:
          summary: "Low disk space"
          description: "Only {{ $value }}% disk space remaining on /."

      - alert: DiskSpaceCritical
        expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 5
        for: 5m
        labels:
          severity: critical
          team: devops
        annotations:
          summary: "Critical disk space"
          description: "Only {{ $value }}% disk space remaining on /."

  # Service availability alerts
  - name: iting-services
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 3m
        labels:
          severity: critical
          team: devops
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "The service {{ $labels.job }} has been down for more than 3 minutes."

      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 2m
        labels:
          severity: critical
          team: devops
        annotations:
          summary: "Redis is down"
          description: "Redis has been down for more than 2 minutes. Caching and rate limiting will fail."

      - alert: KafkaDown
        expr: up{job="kafka"} == 0
        for: 3m
        labels:
          severity: critical
          team: devops
        annotations:
          summary: "Kafka is down"
          description: "Kafka has been down for more than 3 minutes. Event streaming will fail."
ALERTEOF
```

### 9.3 Create Grafana Provisioning Configuration

```bash
# Grafana datasources
cat > ./deploy/monitoring/grafana/provisioning/datasources.yml << 'DSEOF'
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    editable: false

  - name: Tempo
    type: tempo
    access: proxy
    url: http://tempo:3200
    editable: false
    jsonData:
      tracesToMetrics:
        datasourceUid: prometheus
      tracesToLogs:
        datasourceUid: loki
        tags: ['service.name', 'http.method', 'http.status_code']
DSEOF

# Grafana dashboard provider
cat > ./deploy/monitoring/grafana/provisioning/dashboards.yml << 'DBEOF'
apiVersion: 1
providers:
  - name: 'ITing Dashboards'
    orgId: 1
    folder: 'ITing'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    options:
      path: /var/lib/grafana/dashboards
      foldersFromFilesStructure: false
DBEOF

# Create dashboards directory
mkdir -p /opt/iting/monitoring/grafana/dashboards
```

### 9.4 Create ITing Overview Dashboard

```bash
cat > ./deploy/monitoring/grafana/dashboards/iting-overview.json << 'DASHBOARDEOF'
{
  "annotations": { "list": [] },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 1,
  "id": null,
  "links": [],
  "liveNow": false,
  "panels": [
    {
      "title": "Backend Health",
      "type": "stat",
      "gridPos": { "h": 4, "w": 6, "x": 0, "y": 0 },
      "targets": [{ "expr": "up{job=\"iting-backend\"}", "refId": "A" }],
      "fieldConfig": {
        "defaults": {
          "mappings": [
            { "type": "value", "options": { "0": { "text": "DOWN", "color": "red" }, "1": { "text": "UP", "color": "green" } } }
          ]
        }
      }
    },
    {
      "title": "Request Rate",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 12, "x": 6, "y": 0 },
      "targets": [
        { "expr": "sum(rate(http_server_requests_seconds_count{job=\"iting-backend\"}[5m]))", "legendFormat": "Total req/s" },
        { "expr": "sum(rate(http_server_requests_seconds_count{job=\"iting-backend\",status=~\"2..\"}[5m]))", "legendFormat": "2xx req/s" },
        { "expr": "sum(rate(http_server_requests_seconds_count{job=\"iting-backend\",status=~\"5..\"}[5m]))", "legendFormat": "5xx req/s" }
      ]
    },
    {
      "title": "Error Rate %",
      "type": "gauge",
      "gridPos": { "h": 4, "w": 6, "x": 0, "y": 4 },
      "targets": [{
        "expr": "sum(rate(http_server_requests_seconds_count{job=\"iting-backend\",status=~\"5..\"}[5m])) / sum(rate(http_server_requests_seconds_count{job=\"iting-backend\"}[5m])) * 100",
        "refId": "A"
      }],
      "fieldConfig": { "defaults": { "unit": "percent", "max": 100, "thresholds": { "steps": [{ "color": "green", "value": null }, { "color": "yellow", "value": 5 }, { "color": "red", "value": 10 }] } } }
    },
    {
      "title": "P95 Latency",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 8 },
      "targets": [
        { "expr": "histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket{job=\"iting-backend\"}[5m])) by (le))", "legendFormat": "p95" },
        { "expr": "histogram_quantile(0.99, sum(rate(http_server_requests_seconds_bucket{job=\"iting-backend\"}[5m])) by (le))", "legendFormat": "p99" }
      ]
    },
    {
      "title": "JVM Memory",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 8 },
      "targets": [
        { "expr": "jvm_memory_used_bytes{job=\"iting-backend\",area=\"heap\"}", "legendFormat": "Used" },
        { "expr": "jvm_memory_max_bytes{job=\"iting-backend\",area=\"heap\"}", "legendFormat": "Max" }
      ]
    },
    {
      "title": "CPU Usage %",
      "type": "stat",
      "gridPos": { "h": 4, "w": 6, "x": 0, "y": 16 },
      "targets": [{ "expr": "100 - (avg(rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)", "refId": "A" }],
      "fieldConfig": { "defaults": { "unit": "percent", "max": 100 } }
    },
    {
      "title": "Memory Usage %",
      "type": "stat",
      "gridPos": { "h": 4, "w": 6, "x": 6, "y": 16 },
      "targets": [{ "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100", "refId": "A" }],
      "fieldConfig": { "defaults": { "unit": "percent", "max": 100 } }
    },
    {
      "title": "Disk Usage %",
      "type": "stat",
      "gridPos": { "h": 4, "w": 6, "x": 12, "y": 16 },
      "targets": [{ "expr": "(1 - (node_filesystem_avail_bytes{mountpoint=\"/\"} / node_filesystem_size_bytes{mountpoint=\"/\"})) * 100", "refId": "A" }],
      "fieldConfig": { "defaults": { "unit": "percent", "max": 100 } }
    }
  ],
  "refresh": "30s",
  "schemaVersion": 38,
  "style": "dark",
  "tags": ["iting", "overview"],
  "templating": { "list": [] },
  "time": { "from": "now-1h", "to": "now" },
  "title": "ITing Overview",
  "uid": "iting-overview"
}
DASHBOARDEOF
```

### 9.5 Add Monitoring Services to docker-compose.yml

```bash
cat >> ./deploy/docker-compose.yml << 'COMPOSEEOF'

  # ========================================
  # Node Exporter - Host Metrics
  # ========================================
  node-exporter:
    image: prom/node-exporter:v1.7.0
    container_name: iting-node-exporter
    restart: unless-stopped
    networks:
      - iting-net
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--path.rootfs=/rootfs'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
      - '--collector.filesystem.fs-types-exclude=^(autofs|binfmt_misc|cgroup|configfs|debugfs|devpts|devtmpfs|fusectl|hugetlbfs|mqueue|proc|procfs|pstore|rpc_pipefs|securityfs|sysfs|tracefs)$$'
    deploy:
      resources:
        limits:
          memory: 64M
        reservations:
          memory: 16M
    logging:
      driver: json-file
      options:
        max-size: "5m"
        max-file: "3"

  # ========================================
  # Prometheus - Metrics Collection
  # ========================================
  prometheus:
    image: prom/prometheus:v2.48.0
    container_name: iting-prometheus
    restart: unless-stopped
    networks:
      - iting-net
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./monitoring/prometheus/alerts:/etc/prometheus/alerts:ro
      - iting_prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
      - '--storage.tsdb.retention.size=10GB'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
      - '--web.enable-lifecycle'
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:9090/-/healthy"]
      interval: 30s
      timeout: 5s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  # ========================================
  # Grafana - Visualization
  # ========================================
  grafana:
    image: grafana/grafana:10.2.0
    container_name: iting-grafana
    restart: unless-stopped
    networks:
      - iting-net
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_USER: ${GF_ADMIN_USER:-admin}
      GF_SECURITY_ADMIN_PASSWORD: ${GF_ADMIN_PASSWORD}
      GF_USERS_ALLOW_SIGN_UP: "false"
      GF_SERVER_ROOT_URL: https://monitor.datnhk252iting.dpdns.org
      GF_SERVER_ENABLE_GZIP: "true"
      GF_ANALYTICS_CHECK_FOR_UPDATES: "false"
      GF_AUTH_ANONYMOUS_ENABLED: "false"
      GF_LOG_MODE: "console file"
      GF_LOG_LEVEL: "warn"
    volumes:
      - iting_grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards:ro
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  # ========================================
  # Nginx Prometheus Exporter
  # ========================================
  nginx-exporter:
    image: nginx/nginx-prometheus-exporter:1.1.0
    container_name: iting-nginx-exporter
    restart: unless-stopped
    networks:
      - iting-net
    command:
      - '--scrape-uri=http://nginx-proxy/stub_status'
    depends_on:
      - nginx-proxy
    deploy:
      resources:
        limits:
          memory: 32M
        reservations:
          memory: 16M
    logging:
      driver: json-file
      options:
        max-size: "5m"
        max-file: "3"
COMPOSEEOF
```

### 9.6 Add Nginx Stub Status for Metrics

Add to the Nginx `datnhk252iting.dpdns.org.conf` (inside the server block, before the location blocks):

```nginx
# Add this to each server block in nginx config files:
location /stub_status {
    stub_status;
    allow 172.28.0.0/16;  # Allow Docker network
    deny all;
}
```

Update `/opt/iting/config/nginx/nginx.conf` to include the stub_status module. The `nginx:1.25-alpine` image already includes it.

### 9.7 Start Monitoring Stack and Verify

```bash
cd /opt/iting

# Start monitoring services
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod up -d node-exporter prometheus grafana nginx-exporter

# Wait for startup
sleep 15

# Verify Node Exporter
curl -s http://localhost:9100/metrics | grep node_cpu | head -5

# Verify Prometheus
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {health: .health, job: .labels.job}'

# Verify Grafana
curl -s http://localhost:3000/api/health | jq .

# Check Prometheus targets
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | select(.health != "up") | .labels.job'
# All should be "up" after services are running
```

## Verification

```bash
# All monitoring containers running
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod ps node-exporter prometheus grafana nginx-exporter

# Prometheus targets are up
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | .labels.job + ": " + .health'

# Grafana dashboards provisioned
curl -s -u admin:${GF_ADMIN_PASSWORD} http://localhost:3000/api/dashboards/home | jq .

# Query backend metrics (after backend is deployed)
curl -s 'http://localhost:9090/api/v1/query?query=up{job="iting-backend"}' | jq .

# Access Grafana through Nginx
curl -I https://monitor.datnhk252iting.dpdns.org/ -u admin:${GF_ADMIN_PASSWORD}
```

## Rollback

```bash
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod down node-exporter prometheus grafana nginx-exporter
docker volume rm iting_prometheus_data iting_grafana_data
rm -rf /opt/iting/monitoring/prometheus /opt/iting/monitoring/grafana
```

## References

- `.opencode/skills/monitoring-observability/skills/SKILL.md` - Metrics design, alerting best practices
- `.opencode/skills/monitoring-observability/skills/references/metrics_design.md` - Four Golden Signals, RED/USE methods
- `.opencode/skills/monitoring-observability/skills/assets/templates/prometheus-alerts/webapp-alerts.yml` - Alert templates
- `.opencode/skills/monitoring-observability/scripts/dashboard_generator.py` - Dashboard generation script
