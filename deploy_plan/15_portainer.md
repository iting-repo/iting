# Task 15: Portainer (Container Management)

## Objective

Deploy Portainer CE (Community Edition) as a web UI for managing Docker containers, images, volumes, and networks on the EC2 instance. Portainer provides an intuitive interface for container management accessible via `monitor.iting.vn/portainer/`.

## Prerequisites
- Task 02 completed (Docker foundation, iting-net network)
- Task 06 completed (Nginx proxy for monitor.iting.vn)

## Step-by-Step Instructions

### 15.1 Add Portainer to docker-compose.yml

```bash
ssh -i iting-key-pair.pem ubuntu@$PUBLIC_IP

cat >> /opt/iting/docker-compose.yml << 'COMPOSEEOF'

  # ========================================
  # Portainer - Container Management UI
  # ========================================
  portainer:
    image: portainer/portainer-ce:2.19.4
    container_name: iting-portainer
    restart: unless-stopped
    networks:
      - iting-net
    command: --admin-password='$$2y$$5$$HASHED_PASSWORD' --host=tcp://docker.sock:2375
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - iting_portainer_data:/data
    healthcheck:
      test: ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:9000/api/status || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 30s
    deploy:
      resources:
        limits:
          memory: 128M
        reservations:
          memory: 64M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
COMPOSEEOF
```

### 15.2 Generate Portainer Admin Password Hash

```bash
# Generate the admin password hash
# First, set the password in .env:
echo "PORTAINER_PASSWORD=$(openssl rand -base64 16 | tr -d '=/+')" >> /opt/iting/.env

# Generate bcrypt hash for Portainer (it uses $$ for escaping in compose)
# Run this on the EC2 instance:
docker run --rm httpd:alpine htpasswd -nbB admin "$PORTAINER_PASSWORD" | cut -d: -f2

# Take the output hash and replace $$ for $ in Docker Compose format
# Example output: $2y$05$xKz7Gq2b5Fz4BXVN3J0k2ejWRTqa5mhDhgP4SJGsFvkoO
# In compose it becomes: $$2y$$05$$xKz7Gq2b5Fz4BXVN3J0k2ejWRTqa5mhDhgP4SJGsFvkoO

# Alternative: Set up Portainer without password in compose, then set via UI on first visit
# Remove the --admin-password flag from the command and set password via web UI
```

### 15.3 Start Portainer

```bash
cd /opt/iting

# Start Portainer
docker compose --env-file .env up -d portainer

# Wait for startup
sleep 15

# Verify Portainer is running
docker compose --env-file .env ps portainer

# Portainer is accessible at:
# - Direct: http://localhost:9000
# - Via Nginx: https://monitor.iting.vn/portainer/
```

### 15.4 Initial Portainer Setup

After starting Portainer for the first time:

1. Navigate to `https://monitor.iting.vn/portainer/`
2. Log in with the Basic Auth credentials (from Task 06)
3. Create the Portainer admin user:
   - Username: `admin`
   - Password: (from `PORTAINER_PASSWORD` in .env)
4. Select "Docker" as the environment
5. The Docker socket is already mounted, so it auto-detects

### 15.5 Configure Portainer Settings

After initial setup, configure these settings in Portainer UI:

**Settings → Configuration:**
- Enable "Toggle feature" for edge compute if needed
- Set rollout timeout: 300 seconds

**Settings → Authentication:**
- Keep Basic Auth (already behind Nginx Basic Auth)

**Environments → Docker:**
- Name: `ITing Production`
- URL: `unix:///var/run/docker.sock`
- TLS: Disabled

**Settings → SSL:**
- Portainer is behind Nginx SSL proxy, so no additional SSL needed

### 15.6 Verify Portainer Dashboard

```bash
# Check Portainer API status
curl -s http://localhost:9000/api/status | jq .

# Verify Portainer can see all containers
curl -s -u admin:$PORTAINER_PASSWORD http://localhost:9000/api/endpoints/1/docker/containers/json | jq '.[].Names'

# Verify Portainer can see Docker networks
curl -s -u admin:$PORTAINER_PASSWORD http://localhost:9000/api/endpoints/1/docker/networks | jq '.[].Name'

# Verify Portainer can see Docker volumes
curl -s -u admin:$PORTAINER_PASSWORD http://localhost:9000/api/endpoints/1/docker/volumes | jq '.Volumes[].Name'

# Access Portainer UI
# Open browser: https://monitor.iting.vn/portainer/
```

## Verification

```bash
# Portainer container is running
docker compose --env-file .env ps portainer

# Portainer health check
curl -s http://localhost:9000/api/status | jq .status

# All containers visible in Portainer
docker ps --format '{{.Names}}' | wc -l
# Should match the number in Portainer dashboard

# Verify Nginx proxy is working
curl -I https://monitor.iting.vn/portainer/ -u admin:$MONITOR_PASSWORD
# Expected: 200 OK or 302 redirect

# Check Portainer logs
docker compose --env-file .env logs portainer --tail=20
```

## Rollback

```bash
# Stop and remove Portainer
docker compose --env-file .env down portainer

# Remove Portainer data (destructive - loses all Portainer configuration)
docker volume rm iting_portainer_data

# Remove Portainer configuration from docker-compose.yml
# Edit /opt/iting/docker-compose.yml and remove the portainer service block
```

## References

- `.opencode/skills/monitoring-observability/skills/SKILL.md` - Container monitoring patterns
- `.opencode/skills/ecs/SKILL.md` - Container orchestration reference