#!/bin/bash
# ==========================================
# ITing EC2 Setup Script (Run ONCE)
# ==========================================
# This script initializes the EC2 instance for deployment.
# Run this after EC2 is launched and before first deployment.
#
# Usage: ssh -i key.pem ubuntu@IP "bash -s" < setup-ec2.sh

set -e

echo "=== ITing EC2 Setup ==="

# 1. Verify Docker
echo "[1/6] Verifying Docker..."
docker --version || { echo "Docker not installed!"; exit 1; }
docker compose version || { echo "Docker Compose not installed!"; exit 1; }

# 2. Create directory structure
echo "[2/6] Creating directory structure..."
sudo mkdir -p /opt/iting/{scripts,backups,nginx/ssl}
sudo chown -R ubuntu:ubuntu /opt/iting

# 3. Clone repository
echo "[3/6] Cloning repository..."
if [ ! -d "/opt/iting/iting-repo" ]; then
  cd /opt/iting
  git clone https://github.com/YOUR_GITHUB_ORG/ITing.git iting-repo
  echo "Repository cloned."
else
  echo "Repository already exists. Pulling latest..."
  cd /opt/iting/iting-repo
  git pull
fi

# 4. Create Docker network
echo "[4/6] Creating Docker network..."
docker network inspect iting-net >/dev/null 2>&1 || \
  docker network create \
    --driver bridge \
    --subnet 172.28.0.0/16 \
    --gateway 172.28.0.1 \
    iting-net
echo "Network ready."

# 5. Create Docker volumes
echo "[5/6] Creating Docker volumes..."
volumes=(
  iting_redis_data
  iting_kafka_data
  iting_zookeeper_data
  iting_prometheus_data
  iting_grafana_data
  iting_loki_data
  iting_tempo_data
  iting_portainer_data
  iting_certbot_data
  iting_nginx_ssl
  iting_nginx_dhparam
)

for vol in "${volumes[@]}"; do
  docker volume inspect "$vol" >/dev/null 2>&1 || docker volume create "$vol"
done
echo "Volumes ready."

# 6. Verify .env file
echo "[6/6] Checking .env file..."
if [ -f "/opt/iting/.env" ]; then
  echo ".env file exists. Checking for CHANGE_ME values..."
  grep "CHANGE_ME" /opt/iting/.env && echo "⚠️  WARNING: Replace all CHANGE_ME values in /opt/iting/.env!" || echo ".env looks good."
else
  echo "⚠️  WARNING: /opt/iting/.env not found! Create it before deploying."
fi

if [ -f "/opt/iting/.env.prod" ]; then
  echo ".env.prod file exists."
else
  echo "Creating default .env.prod..."
  echo "DEPLOY_ENV=prod" > /opt/iting/.env.prod
fi

echo ""
echo "=== EC2 Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Fill in /opt/iting/.env with your actual secrets"
echo "  2. Create a tag: git tag v1.0.0 && git push origin v1.0.0"
echo "  3. GitHub Actions will deploy automatically"
