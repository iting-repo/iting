# ==========================================
# Script Deploy Backend trên Windows (PowerShell)
# ==========================================

$IMAGE_NAME = "iting-backend"
$CONTAINER_NAME = "iting-app"
$PORT = 8081

Write-Host "--- 1. Dang dung va xoa container cu (neu co) ---" -ForegroundColor Cyan
docker stop $CONTAINER_NAME 2>$null
docker rm $CONTAINER_NAME 2>$null

Write-Host "--- 2. Build Docker Image moi (co the mat vai phut) ---" -ForegroundColor Cyan
docker build -t $IMAGE_NAME .

Write-Host "--- 3. Run Container moi tren Port $PORT ---" -ForegroundColor Cyan
# Luu y: Script lay cac bien moi truong tu file .env cung cap
docker run -d `
  --name $CONTAINER_NAME `
  -p "$($PORT):8080" `
  --restart unless-stopped `
  --env-file .env `
  -e SPRING_PROFILES_ACTIVE=prod `
  $IMAGE_NAME

Write-Host "--- 4. Kiem tra trang thai ---" -ForegroundColor Cyan
Start-Sleep -Seconds 5
docker ps | Select-String $CONTAINER_NAME

Write-Host "--- 5. Log khoi dong ---" -ForegroundColor Cyan
docker logs $CONTAINER_NAME --tail 20
