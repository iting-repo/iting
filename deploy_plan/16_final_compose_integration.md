# Task 16: Final Docker Compose Integration & Smoke Test

## Objective

Assemble the complete `docker-compose.yml` with all services, perform a full deployment smoke test, validate all services are healthy, and ensure end-to-end functionality of the entire ITing platform.

## Prerequisites
- Tasks 01-15 completed (all services individually configured and tested)
- All configuration files in place

## Step-by-Step Instructions

### 16.1 Complete docker-compose.yml

The `docker-compose.yml` has been built incrementally in Tasks 02-15. Verify the complete file:

```bash
ssh -i iting-key-pair.pem ubuntu@$PUBLIC_IP
cd /opt/iting/iting-repo/deploy

# Verify the docker-compose.yml is valid
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod config --quiet
echo "Compose file is valid!"

# Check all services are defined
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod config --services
# Expected output:
# zookeeper
# kafka
# redis
# nginx-proxy
# certbot
# backend
# frontend
# node-exporter
# prometheus
# grafana
# nginx-exporter
# loki
# promtail
# tempo
# otel-collector
# alertmanager
# alertmanager-discord
# portainer
```

### 16.2 Complete the .env File

Verify all environment variables are set:

```bash
# Check for CHANGE_ME placeholders
grep "CHANGE_ME" /opt/iting/.env
# All CHANGE_ME values should be replaced with actual secrets

# Verify required variables
source /opt/iting/.env
required_vars=(
  "DOMAIN" "DB_HOST" "DB_PORT" "DB_NAME" "DB_USERNAME" "DB_PASSWORD"
  "JWT_SECRET" "JWT_REFRESH_SECRET" "REDIS_PASSWORD"
  "AWS_ACCESS_KEY" "AWS_SECRET_KEY"
  "MAIL_USERNAME" "MAIL_PASSWORD"
  "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET"
  "GF_ADMIN_PASSWORD" "PORTAINER_PASSWORD"
  "DISCORD_WEBHOOK_URL"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "ERROR: $var is not set!"
  else
    echo "OK: $var is set"
  fi
done
```

### 16.3 Verify All Configuration Files Exist

```bash
# Check all required configuration files
config_files=(
  "/opt/iting/iting-repo/deploy/config/nginx/nginx.conf"
  "/opt/iting/iting-repo/deploy/config/nginx/api.datnhk252iting.dpdns.org.conf"
  "/opt/iting/iting-repo/deploy/config/nginx/datnhk252iting.dpdns.org.conf"
  "/opt/iting/iting-repo/deploy/config/nginx/monitor.datnhk252iting.dpdns.org.conf"
  "/opt/iting/iting-repo/deploy/config/nginx/ssl-params.conf"
  "/opt/iting/iting-repo/deploy/config/nginx/.htpasswd"
  "/opt/iting/iting-repo/deploy/config/redis/redis.conf"
  "/opt/iting/iting-repo/deploy/config/kafka/server.properties"
  "/opt/iting/iting-repo/deploy/config/otel/otel-collector-config.yaml"
  "/opt/iting/iting-repo/deploy/monitoring/prometheus/prometheus.yml"
  "/opt/iting/iting-repo/deploy/monitoring/prometheus/alerts/iting-alerts.yml"
  "/opt/iting/iting-repo/deploy/monitoring/grafana/provisioning/datasources.yml"
  "/opt/iting/iting-repo/deploy/monitoring/grafana/provisioning/dashboards.yml"
  "/opt/iting/iting-repo/deploy/monitoring/grafana/dashboards/iting-overview.json"
  "/opt/iting/iting-repo/deploy/monitoring/loki/loki-config.yml"
  "/opt/iting/iting-repo/deploy/monitoring/loki/promtail-config.yml"
  "/opt/iting/iting-repo/deploy/monitoring/tempo/tempo-config.yml"
  "/opt/iting/iting-repo/deploy/monitoring/alertmanager/alertmanager.yml"
  "/opt/iting/.env"
  "/opt/iting/.env.prod"
  "/opt/iting/iting-repo/deploy/docker-compose.yml"
)

for file in "${config_files[@]}"; do
  if [ -f "$file" ]; then
    echo "OK: $file"
  else
    echo "MISSING: $file"
  fi
done
```

### 16.4 Full Deployment

```bash
cd /opt/iting/iting-repo/deploy

# Stop all services first
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod down

# Pull all images
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod pull

# Build custom images
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod build alertmanager-discord

# Start all services
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod up -d

# Wait for all services to start
echo "Waiting 60 seconds for all services to initialize..."
sleep 60

# Check status of all services
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod ps
```

### 16.5 Smoke Test - Service Health Checks

```bash
source /opt/iting/.env
PUBLIC_IP=$(cat /opt/iting/infrastructure.env | grep EC2_PUBLIC_IP | cut -d= -f2)

echo "=== ITing Platform Smoke Test ==="
echo ""

# 1. Infrastructure
echo "1. Checking EC2 instance..."
uptime
free -h
df -h /
echo ""

# 2. Docker
echo "2. Checking Docker..."
docker info | grep "Containers:" | head -1
docker info | grep "Server Version:" | head -1
echo ""

# 3. All containers running
echo "3. Checking all containers..."
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""

# 4. Redis
echo "4. Checking Redis..."
docker exec iting-redis redis-cli -a "$REDIS_PASSWORD" ping
echo ""

# 5. Zookeeper + Kafka
echo "5. Checking Zookeeper + Kafka..."
docker exec iting-zookeeper bash -c "echo ruok | nc localhost 2181"
docker exec iting-kafka kafka-topics --bootstrap-server localhost:9092 --list | head -5
echo ""

# 6. RDS PostgreSQL
echo "6. Checking RDS PostgreSQL..."
PGPASSWORD="$DB_PASSWORD" psql --host="$DB_HOST" --username="$DB_USERNAME" --dbname="$DB_NAME" -c "SELECT 1;" 2>/dev/null && echo "RDS: OK" || echo "RDS: FAILED"
echo ""

# 7. Backend health
echo "7. Checking Backend..."
curl -sf http://localhost:8080/actuator/health | jq .status || echo "Backend: FAILED"
echo ""

# 8. Frontend
echo "8. Checking Frontend..."
curl -sf http://localhost/ | head -5 || echo "Frontend: FAILED"
echo ""

# 9. SSL/HTTPS
echo "9. Checking SSL/HTTPS..."
curl -sf https://datnhk252iting.dpdns.org/ -o /dev/null && echo "datnhk252iting.dpdns.org HTTPS: OK" || echo "datnhk252iting.dpdns.org HTTPS: FAILED"
curl -sf https://api.datnhk252iting.dpdns.org/actuator/health -o /dev/null && echo "api.datnhk252iting.dpdns.org HTTPS: OK" || echo "api.datnhk252iting.dpdns.org HTTPS: FAILED"
curl -sf https://monitor.datnhk252iting.dpdns.org/ -o /dev/null && echo "monitor.datnhk252iting.dpdns.org HTTPS: OK" || echo "monitor.datnhk252iting.dpdns.org HTTPS: FAILED"
echo ""

# 10. Prometheus
echo "10. Checking Prometheus..."
curl -sf http://localhost:9090/api/v1/targets | jq '.data.activeTargets | length' 2>/dev/null && echo "Prometheus: OK" || echo "Prometheus: FAILED"
echo ""

# 11. Grafana
echo "11. Checking Grafana..."
curl -sf http://localhost:3000/api/health | jq . || echo "Grafana: FAILED"
echo ""

# 12. Loki
echo "12. Checking Loki..."
curl -sf http://localhost:3100/ready || echo "Loki: FAILED"
echo ""

# 13. Tempo
echo "13. Checking Tempo..."
curl -sf http://localhost:3200/ready || echo "Tempo: FAILED"
echo ""

# 14. Alertmanager
echo "14. Checking Alertmanager..."
curl -sf http://localhost:9093/api/v2/status | jq .cluster || echo "Alertmanager: FAILED"
echo ""

# 15. Portainer
echo "15. Checking Portainer..."
curl -sf http://localhost:9000/api/status | jq . || echo "Portainer: FAILED"
echo ""

echo "=== Smoke Test Complete ==="
```

### 16.6 End-to-End Functional Test

```bash
echo "=== End-to-End Functional Test ==="

# Test 1: User registration (should fail gracefully at API level)
echo "Test 1: API is reachable..."
curl -sf https://api.datnhk252iting.dpdns.org/actuator/health | jq .status

# Test 2: Frontend loads
echo "Test 2: Frontend loads..."
curl -sf https://datnhk252iting.dpdns.org/ | grep -o '<title>.*</title>'

# Test 3: WebSocket endpoint exists
echo "Test 3: WebSocket endpoint..."
curl -sf -o /dev/null -w "%{http_code}" https://api.datnhk252iting.dpdns.org/ws/

# Test 4: Prometheus can scrape backend
echo "Test 4: Prometheus scraping backend..."
curl -s 'http://localhost:9090/api/v1/query?query=up{job="iting-backend"}' | jq '.data.result[0].value'

# Test 5: Logs are flowing to Loki
echo "Test 5: Logs in Loki..."
curl -s 'http://localhost:3100/loki/api/v1/query?query={service="iting-backend"}' | jq '.data.result | length'

# Test 6: Traces are flowing to Tempo
echo "Test 6: Traces in Tempo..."
curl -s "http://localhost:3200/api/traces?service=iting-backend&limit=1" | jq '.traces | length'

# Test 7: Alerts are configured
echo "Test 7: Alert rules loaded..."
curl -s 'http://localhost:9090/api/v1/rules' | jq '.data.groups | length'

# Test 8: Grafana dashboards provisioned
echo "Test 8: Grafana dashboards..."
curl -s -u "admin:$GF_ADMIN_PASSWORD" http://localhost:3000/api/dashboards/home | jq '.meta | length'

echo "=== End-to-End Test Complete ==="
```

### 16.7 Set Up Cron Jobs for Maintenance

```bash
# Verify existing crons
crontab -l

# Should have:
# - Database health check every 5 minutes
# - SSL renewal twice daily
# - Daily backup at 3 AM

# If missing, add:
(crontab -l 2>/dev/null; echo "
# ITing Maintenance
*/5 * * * * /opt/iting/scripts/db-healthcheck.sh >> /var/log/iting-db-health.log 2>&1
0 0,12 * * * /opt/iting/scripts/renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1
0 3 * * * /opt/iting/scripts/backup.sh >> /var/log/iting-backup.log 2>&1
") | crontab -
```

### 16.8 Final Security Hardening

```bash
# Verify only essential ports are open
sudo ss -tlnp | grep -E '(22|80|443|)'
# Expected: Only 22, 80, 443 externally

# Verify firewall (if ufw is installed)
sudo ufw status
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Verify .env file permissions
ls -la /opt/iting/.env
# Expected: -rw------- (600)

# Verify Docker socket permissions
ls -la /var/run/docker.sock
# Expected: srw-rw---- (docker group)

# Check SSL certificate
echo | openssl s_client -connect datnhk252iting.dpdns.org:443 -servername datnhk252iting.dpdns.org 2>/dev/null | openssl x509 -noout -dates

# Verify all Docker services are using memory limits
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}"
```

### 16.9 Save Deployment State

```bash
# Create a deployment manifest
cat > /opt/iting/DEPLOYMENT_INFO.md << 'EOF'
# ITing Deployment Information

## Deployment Date
$(date)

## Infrastructure
- EC2: m7i-flex.large (2 vCPU, 8GB RAM)
- RDS: db.t3.micro PostgreSQL 16
- Region: ap-southeast-1
- Domain: datnhk252iting.dpdns.org

## Services Running
$(docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod ps --format "table {{.Name}}\t{{.Status}}\t{{.Image}}")

## Memory Usage
$(docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}")

## SSL Certificates
$(echo | openssl s_client -connect datnhk252iting.dpdns.org:443 -servername datnhk252iting.dpdns.org 2>/dev/null | openssl x509 -noout -subject -dates)

## Health Status
$(curl -sf http://localhost:8080/actuator/health | jq .)
EOF

echo "Deployment manifest saved to /opt/iting/DEPLOYMENT_INFO.md"
```

### 16.10 Post-Deployment Checklist

```markdown
## Post-Deployment Checklist

### Infrastructure
- [ ] EC2 instance is running and healthy
- [ ] RDS PostgreSQL is accessible
- [ ] Elastic IP is associated
- [ ] DNS records are configured (datnhk252iting.dpdns.org, api.datnhk252iting.dpdns.org, monitor.datnhk252iting.dpdns.org)
- [ ] SSL certificates are valid and auto-renewing

### Core Services
- [ ] Backend is accessible on https://api.datnhk252iting.dpdns.org/actuator/health
- [ ] Frontend is accessible on https://datnhk252iting.dpdns.org/
- [ ] Redis is connected (check backend logs)
- [ ] Kafka is connected (check backend logs)
- [ ] Database is connected (check backend logs)

### Observability
- [ ] Prometheus is scraping all targets (http://localhost:9090/targets)
- [ ] Grafana dashboards are provisioned
- [ ] Logs are flowing to Loki
- [ ] Traces are flowing to Tempo
- [ ] Alertmanager has Discord configured
- [ ] Portainer is accessible at monitor.datnhk252iting.dpdns.org/portainer/

### Security
- [ ] Only ports 22, 80, 443 are externally accessible
- [ ] .env file has 600 permissions
- [ ] All secrets are set (no CHANGE_ME placeholders)
- [ ] SSL certificates are valid
- [ ] Basic Auth is configured for monitoring subdomain
- [ ] Redis has a password set
- [ ] RDS is in a private subnet

### CI/CD
- [ ] GitHub Actions pipeline triggers on tagged releases
- [ ] All CI pipeline jobs pass (build, test, scan)
- [ ] Deployment to EC2 works
- [ ] Discord notifications are working

### Backups
- [ ] RDS automated backups are enabled (7-day retention)
- [ ] Daily config backup cron is set
- [ ] Backup script tested manually
```

### 16.11 Reset EC2 Data (Delete Data/Files Only)

Use this when you want to clear data and generated files on EC2 while keeping Docker, system packages, and base configuration intact.

```bash
ssh -i iting-key-pair.pem ubuntu@$PUBLIC_IP

cd /opt/iting

# 1) Stop all containers
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod down

# 2) Remove application data volumes (keeps docker install/config)
docker volume rm \
  iting_redis_data \
  iting_kafka_data \
  iting_zookeeper_data \
  iting_prometheus_data \
  iting_grafana_data \
  iting_loki_data \
  iting_tempo_data \
  iting_portainer_data \
  iting_certbot_data \
  iting_nginx_ssl \
  iting_nginx_dhparam || true

# 3) Remove generated files and configs
sudo rm -rf /opt/iting/config/*
sudo rm -rf /opt/iting/monitoring/*
sudo rm -rf /opt/iting/backups/*
sudo rm -rf /opt/iting/nginx/ssl/*

# 4) Remove old images to save space (optional)
docker image prune -af

# 5) Keep these files (do NOT delete):
# - /opt/iting/.env
# - /opt/iting/.env.prod
# - /opt/iting/infrastructure.env
# - /opt/iting/iting-repo/
# - /opt/iting/scripts/

echo "EC2 data reset complete. Re-deploy using tag-based CI/CD."
```

## Verification

```bash
# Full platform health check
echo "=== Platform Health Summary ==="
echo ""

# Count healthy containers
HEALTHY=$(docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod ps --format json | jq -s '[.[] | select(.Health=="healthy")] | length')
TOTAL=$(docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod ps --format json | jq 'length')
echo "Containers: $HEALTHY/$TOTAL healthy"

# Check SSL
echo "SSL: $(echo | openssl s_client -connect datnhk252iting.dpdns.org:443 -servername datnhk252iting.dpdns.org 2>/dev/null | openssl x509 -noout -enddate)"

# Check backend
echo "Backend: $(curl -sf http://localhost:8080/actuator/health | jq -r .status)"

# Check key services
echo "Redis: $(docker exec iting-redis redis-cli -a "$REDIS_PASSWORD" ping 2>/dev/null)"
echo "Kafka: $(docker exec iting-kafka kafka-topics --bootstrap-server localhost:9092 --list 2>/dev/null | wc -l) topics"
echo "Prometheus targets: $(curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets | length')"
echo "Grafana: $(curl -sf http://localhost:3000/api/health | jq -r .database)"
echo "Loki: $(curl -sf http://localhost:3100/ready)"
echo "Tempo: $(curl -sf http://localhost:3200/ready)"
echo "Alertmanager: $(curl -sf http://localhost:9093/api/v2/status | jq -r .cluster.name)"

echo ""
echo "=== Platform is LIVE ==="
echo "Frontend:  https://datnhk252iting.dpdns.org"
echo "Backend:   https://api.datnhk252iting.dpdns.org"
echo "Grafana:    https://monitor.datnhk252iting.dpdns.org"
echo "Portainer:  https://monitor.datnhk252iting.dpdns.org/portainer/"
```

## Troubleshooting Guide

### Common Issues

| Issue | Command | Fix |
|-------|---------|-----|
| Container not starting | `docker compose logs <service>` | Check logs for errors |
| Backend won't connect to DB | `docker compose logs backend \| grep -i "datasource"` | Check DB_HOST, DB_PASSWORD in .env |
| SSL certificate errors | `certbot certificates` | Re-run certificate renewal |
| Prometheus can't scrape | `curl http://localhost:9090/api/v1/targets` | Check target health and network |
| Grafana not showing data | `curl http://localhost:3000/api/datasources` | Verify datasource URLs |
| Discord alerts not sending | `curl -X POST http://localhost:9094/alert -d '...'` | Check DISCORD_WEBHOOK_URL |
| High memory usage | `docker stats` | Check memory limits in compose |
| Disk full | `df -h` | Clean up old logs/images |

### Emergency Procedures

```bash
# Restart all services
/opt/iting/scripts/deploy.sh restart

# Restart single service
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod restart backend

# Check all logs
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod logs --tail=100

# Reset everything
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod down
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod up -d

# Emergency database backup
/opt/iting/scripts/backup.sh

# Emergency deployment rollback
docker tag iting-backend:previous iting-backend:latest
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod up -d backend
```

## References

- `ITing-backend/docker-compose.yml` - Original local dev compose
- `ITing-backend/Dockerfile` - Backend container definition
- `ITing-backend/Dockerfile.prod` - Production backend container
- `.opencode/skills/monitoring-observability/skills/SKILL.md` - Comprehensive observability guide
- `.opencode/skills/ci-cd/skills/SKILL.md` - CI/CD pipeline reference
- `.opencode/agents/devops-expert.agent.md` - DevOps Infinity Loop
- `.opencode/rules/devops-core-principles.instructions.md` - DORA metrics and CALMS framework
