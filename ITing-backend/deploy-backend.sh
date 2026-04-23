#!/bin/bash
# ==========================================
# Script Deploy Backend lên EC2 (Port 8081)
# ==========================================

IMAGE_NAME="iting-backend"
CONTAINER_NAME="iting-app"
PORT=8081

echo "--- 1. Dang dung va xoa container cu (neu co) ---"
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

echo "--- 2. Build Docker Image moi (co the mat vai phut) ---"
docker build -t $IMAGE_NAME .

echo "--- 3. Run Container moi tren Port $PORT ---"
# Luu y: Script lay cac bien moi truong tu file .env cung cap
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:8080 \
  --restart unless-stopped \
  --env-file .env \
  -e SPRING_PROFILES_ACTIVE=prod \
  $IMAGE_NAME

echo "--- 4. Kiem tra trang thai ---"
sleep 5
docker ps | grep $CONTAINER_NAME

echo "--- 5. Log khoi dong ---"
docker logs $CONTAINER_NAME --tail 20
