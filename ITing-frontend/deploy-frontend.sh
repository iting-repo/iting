#!/bin/bash
# ==========================================
# Script Deploy Frontend lên S3
# ==========================================

# Thay đổi tên bucket của bạn tại đây
BUCKET_NAME="iting-frontend" 
REGION="ap-southeast-2"

echo "--- 1. Dang build Frontend (Production mode) ---"
npm run build

echo "--- 2. Dang upload file len S3 ---"
# Lenh nay se sync thu muc dist voi S3, tu dong upload file moi
aws s3 sync dist/ s3://$BUCKET_NAME --acl public-read --region $REGION

echo "--- DEPLOY HOAN TAT! ---"
echo "URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
