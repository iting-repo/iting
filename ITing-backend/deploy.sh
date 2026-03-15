#!/bin/bash
# ==========================================
# Deploy Script for AWS EC2
# Run this on your EC2 instance
# ==========================================

set -e

# Configuration
IMAGE_NAME="iting-app"
CONTAINER_NAME="iting-app"
REGISTRY="${ECR_REGISTRY:-localhost:5000}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-iting_job_web}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"

echo "=== Building Docker Image ==="
docker build -t ${IMAGE_NAME}:latest .

echo "=== Stopping existing container (if any) ==="
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true

echo "=== Starting container with AWS RDS ==="
docker run -d \
  --name ${CONTAINER_NAME} \
  -p 8080:8080 \
  --restart unless-stopped \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \
  -e SPRING_DATASOURCE_USERNAME="${DB_USER}" \
  -e SPRING_DATASOURCE_PASSWORD="${DB_PASSWORD}" \
  -e SPRING_JPA_HIBERNATE_DDL_AUTO=update \
  -e SPRING_PROFILES_ACTIVE=prod \
  ${IMAGE_NAME}:latest

echo "=== Checking health ==="
sleep 10
curl -f http://localhost:8080/actuator/health || echo "Health check failed!"

echo "=== Deployment complete ==="
docker logs ${CONTAINER_NAME} --tail 20
