# Task 12: Alertmanager + Discord Notifications

## Objective

Deploy Alertmanager to handle alerts from Prometheus and route them to Discord via webhooks. This enables real-time notifications for critical infrastructure and application issues.

## Prerequisites
- Task 09 completed (Prometheus with alert rules configured)

## Step-by-Step Instructions

### 12.1 Create Alertmanager Configuration

```bash
ssh -i iting-key-pair.pem ubuntu@$PUBLIC_IP

cat > ./deploy/monitoring/alertmanager/alertmanager.yml << 'AMEOF'
# ITing Alertmanager Configuration
global:
  resolve_timeout: 5m

# Route configuration
route:
  group_by: ['alertname', 'service', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'discord'
  
  # Route critical alerts immediately
  routes:
    - match:
        severity: critical
      receiver: 'discord'
      group_wait: 10s
      group_interval: 1m
      repeat_interval: 30m
    
    - match:
        severity: warning
      receiver: 'discord'
      group_wait: 30s
      group_interval: 5m
      repeat_interval: 4h

# Receivers
receivers:
  - name: 'discord'
    webhook_configs:
      - url: 'http://alertmanager-discord:9094/alert'
        send_resolved: true

# Inhibition rules (suppress lower-severity alerts when higher-severity alert fires)
inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'service']
AMEOF

chmod 640 /opt/iting/monitoring/alertmanager/alertmanager.yml
```

### 12.2 Create Discord Webhook Bridge

We need a small bridge service to convert Alertmanager notifications to Discord format:

```bash
mkdir -p /opt/iting/config/alertmanager-discord

cat > ./deploy/config/alertmanager-discord/Dockerfile << 'DISCORDEOF'
FROM python:3.12-alpine

RUN pip install --no-cache-dir requests flask

COPY app.py /app/app.py

WORKDIR /app
EXPOSE 9094

CMD ["python", "/app/app.py"]
DISCORDEOF

cat > ./deploy/config/alertmanager-discord/app.py << 'PYEOF'
import json
import os
import requests
from flask import Flask, request

app = Flask(__name__)

DISCORD_WEBHOOK_URL = os.environ.get('DISCORD_WEBHOOK_URL', '')

SEVERITY_COLORS = {
    'critical': 0xFF0000,    # Red
    'warning': 0xFFA500,    # Orange
    'info': 0x0088FF,        # Blue
}

SEVERITY_EMOJI = {
    'critical': '🚨',
    'warning': '⚠️',
    'info': 'ℹ️',
}

def format_discord_message(alert_data):
    messages = []
    
    if request.method == 'POST':
        data = request.get_json(force=True)
    else:
        data = alert_data
    
    status = data.get('status', 'unknown')
    alerts = data.get('alerts', [])
    
    for alert in alerts:
        labels = alert.get('labels', {})
        annotations = alert.get('annotations', {})
        severity = labels.get('severity', 'info')
        alert_name = labels.get('alertname', 'Unknown')
        service = labels.get('service', 'Unknown')
        summary = annotations.get('summary', 'No summary')
        description = annotations.get('description', '')
        
        emoji = SEVERITY_EMOJI.get(severity, '❓')
        color = SEVERITY_COLORS.get(severity, 0x888888)
        
        if status == 'resolved':
            emoji = '✅'
            color = 0x00FF00
        
        embed = {
            'title': f'{emoji} [{status.upper()}] {alert_name}',
            'description': description or summary,
            'color': color,
            'fields': [
                {'name': 'Service', 'value': service, 'inline': True},
                {'name': 'Severity', 'value': severity, 'inline': True},
                {'name': 'Status', 'value': status, 'inline': True},
            ],
            'footer': {'text': 'ITing Alerting System'},
            'timestamp': alert.get('startsAt', ''),
        }
        
        messages.append(embed)
    
    return messages

@app.route('/alert', methods=['POST'])
def receive_alert():
    if not DISCORD_WEBHOOK_URL:
        return {'error': 'DISCORD_WEBHOOK_URL not configured'}, 500
    
    try:
        embeds = format_discord_message(None)
        
        payload = {
            'username': 'ITing Alerts',
            'avatar_url': 'https://cdn-icons-png.flaticon.com/512/2991/2991106.png',
            'embeds': embeds[:10],  # Discord max 10 embeds per message
        }
        
        response = requests.post(
            DISCORD_WEBHOOK_URL,
            json=payload,
            timeout=10
        )
        
        if response.status_code == 204:
            return {'status': 'ok'}, 200
        else:
            return {'error': f'Discord API error: {response.status_code}'}, 500
    
    except Exception as e:
        return {'error': str(e)}, 500

@app.route('/health', methods=['GET'])
def health():
    return {'status': 'ok', 'webhook_configured': bool(DISCORD_WEBHOOK_URL)}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9094)
PYEOF
```

### 12.3 Add Alertmanager and Discord Bridge to docker-compose.yml

```bash
cat >> ./deploy/docker-compose.yml << 'COMPOSEEOF'

  # ========================================
  # Alertmanager - Alert Routing
  # ========================================
  alertmanager:
    image: prom/alertmanager:v0.26.0
    container_name: iting-alertmanager
    restart: unless-stopped
    networks:
      - iting-net
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
      - '--web.listen-address=:9093'
      - '--web.external-url=https://monitor.datnhk252iting.dpdns.org/alertmanager'
    healthcheck:
      test: ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:9093/-/healthy || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 64M
        reservations:
          memory: 32M
    logging:
      driver: json-file
      options:
        max-size: "5m"
        max-file: "3"

  # ========================================
  # Alertmanager-Discord Bridge
  # ========================================
  alertmanager-discord:
    build:
      context: /opt/iting/config/alertmanager-discord
      dockerfile: Dockerfile
    container_name: iting-alertmanager-discord
    restart: unless-stopped
    networks:
      - iting-net
    environment:
      DISCORD_WEBHOOK_URL: ${DISCORD_WEBHOOK_URL}
    depends_on:
      - alertmanager
    healthcheck:
      test: ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:9094/health || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
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
COMPOSEEOF
```

### 12.4 Update Prometheus Configuration for Alertmanager

The Prometheus configuration from Task 09 already references Alertmanager. Verify:

```bash
# Verify alertmanager config in prometheus.yml
grep -A3 "alerting:" /opt/iting/monitoring/prometheus/prometheus.yml
# Should show:
#   alerting:
#     alertmanagers:
#       - static_configs:
#           - targets: ['alertmanager:9093']
```

### 12.5 Add Alertmanager to Nginx (Monitoring Subdomain)

Add to `/opt/iting/config/nginx/monitor.datnhk252iting.dpdns.org.conf`, inside the HTTPS server block:

```nginx
# Alertmanager
location /alertmanager/ {
    proxy_pass http://alertmanager:9093/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 12.6 Start Alertmanager and Verify

```bash
cd /opt/iting

# Build the Discord bridge image
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod build alertmanager-discord

# Start Alertmanager and bridge
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod up -d alertmanager alertmanager-discord

# Reload Prometheus to pick up Alertmanager
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod restart prometheus

# Wait for startup
sleep 10

# Verify Alertmanager
curl -s http://localhost:9093/api/v2/status | jq .

# Verify Discord bridge
curl -s http://localhost:9094/health | jq .

# Verify Prometheus sees Alertmanager
curl -s http://localhost:9090/api/v1/alertmanagers | jq .

# Test alert notification (create a test alert)
curl -X POST http://localhost:9093/api/v1/alerts -H "Content-Type: application/json" -d '[
  {
    "labels": {
      "alertname": "TestAlert",
      "severity": "info",
      "service": "testing"
    },
    "annotations": {
      "summary": "This is a test alert from ITing deployment",
      "description": "If you see this in Discord, alerting is working!"
    }
  }
]'

# Check if alert was received
curl -s http://localhost:9093/api/v2/alerts | jq .

# Verify Discord received the notification (check your Discord channel)
```

## Verification

```bash
# Alertmanager is running
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod ps alertmanager alertmanager-discord

# Alertmanager is healthy
curl -s http://localhost:9093/api/v2/status | jq '.cluster'

# Discord bridge is healthy
curl -s http://localhost:9094/health | jq .

# Prometheus connected to Alertmanager
curl -s http://localhost:9090/api/v1/alertmanagers | jq '.data.activeAlertmanagers'

# Check alert rules are loaded
curl -s http://localhost:9090/api/v1/rules | jq '.data.groups[].name'

# Trigger test alert
curl -X POST http://localhost:9093/api/v1/alerts -H "Content-Type: application/json" -d '[{"labels":{"alertname":"TestAlert","severity":"info"},"annotations":{"summary":"Test alert from ITing"}}]'

# Verify on Discord channel
```

## Rollback

```bash
docker compose -f /opt/iting/iting-repo/deploy/docker-compose.yml --env-file /opt/iting/.env --env-file /opt/iting/.env.prod down alertmanager alertmanager-discord
rm -rf /opt/iting/monitoring/alertmanager /opt/iting/config/alertmanager-discord

# Remove alertmanager reference from prometheus.yml
# Remove alerting section and rule_files section
```

## References

- `.opencode/skills/monitoring-observability/skills/SKILL.md` - Alert design section
- `.opencode/skills/monitoring-observability/skills/references/alerting_best_practices.md` - Alerting patterns
- `.opencode/skills/monitoring-observability/skills/assets/templates/prometheus-alerts/webapp-alerts.yml` - Alert templates
