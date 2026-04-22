# 🚀 HƯỚNG DẪN DEPLOY ITING JOB PORTAL LÊN AWS (EC2 + RDS)

## 📋 Mục lục
1. [Yêu cầu](#yêu-cầu)
2. [Bước 1: Chuẩn bị AWS RDS PostgreSQL](#bước-1-chuẩn-bị-aws-rds-postgresql)
3. [Bước 2: Chuẩn bị EC2 Instance](#bước-2-chuẩn-bị-ec2-instance)
4. [Bước 3: Cấu hình Security Groups](#bước-3-cấu-hình-security-groups)
5. [Bước 4: Deploy lên EC2](#bước-4-deploy-lên-ec2)
6. [Bước 5: Cấu hình Environment Variables](#bước-5-cấu-hình-environment-variables)
7. [Bước 6: Khởi tạo Database](#bước-6-khởi-tạo-database)
8. [Tối ưu hóa và Monitoring](#tối-ưu-hóa-và-monitoring)
9. [Troubleshooting](#troubleshooting)

---

## 📌 Yêu cầu

- Tài khoản [AWS](https://aws.amazon.com) (có thể dùng Free Tier)
- Docker Desktop (cho build local)
- Git
- AWS CLI v2 (khuyến nghị cho deploy tự động)

---

## 🗄️ Bước 1: Chuẩn bị AWS RDS PostgreSQL

### 1.1 Tạo RDS Instance

1. Đăng nhập [AWS Console](https://console.aws.amazon.com)
2. Vào **RDS** → **Create database**
3. Cấu hình:

| Setting | Value |
|---------|-------|
| **Choose a database creation method** | Standard create |
| **Engine options** | PostgreSQL |
| **Version** | PostgreSQL 15.x (latest) |
| **Templates** | Free Tier (hoặc Dev/Test) |
| **DB instance identifier** | `iting-job-web` |
| **Master username** | `postgres` |
| **Master password** | `YourSecurePassword123!` |
| **Confirm password** | `YourSecurePassword123!` |
| **Instance configuration** | db.t3.micro (Free Tier) |
| **Storage** | 20 GB, gp3 |
| **Public access** | Yes (để EC2 có thể kết nối) |

4. Click **Create database**

### 1.2 Lấy thông tin kết nối

Sau khi tạo xong (5-10 phút), vào **DB Identifier** → **Connectivity & security**:

```
Endpoint: iting-job-web.xxxx.ap-southeast-1.rds.amazonaws.com
Port: 5432
```

**Connection String (JDBC):**
```
jdbc:postgresql://iting-job-web.xxxx.ap-southeast-1.rds.amazonaws.com:5432/iting_job_web
```

---

## 🖥️ Bước 2: Chuẩn bị EC2 Instance

### 2.1 Tạo EC2 Instance

1. Vào **EC2** → **Launch Instance**
2. Cấu hình:

| Setting | Value |
|---------|-------|
| **Name** | `iting-app-server` |
| **Amazon Machine Image** | Amazon Linux 2023 AMI |
| **Instance type** | t3.micro (Free Tier) |
| **Key pair** | Create new hoặc existing |
| **Network settings** | Default VPC |
| **Subnet** | Public subnet |
| **Auto-assign public IP** | Enable |
| **Storage** | 8 GB (gp3) |

3. Click **Launch Instance**

### 2.2 Cài đặt Docker trên EC2

Sau khi SSH vào EC2:

```bash
# Update
sudo yum update -y

# Install Docker
sudo amazon-linux-extras install docker -y

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

### 2.3 Cấu hình Docker Compose (Optional - Alternative to manual)

Tạo file `/home/ec2-user/docker-compose.yml` trên EC2:

```yaml
version: '3.8'

services:
  app:
    image: iting-app:latest
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:postgresql://ITING-RDS-ENDPOINT:5432/iting_job_web
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=YourSecurePassword123!
      - SPRING_JPA_HIBERNATE_DDL_AUTO=update
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 45s
```

---

## 🔒 Bước 3: Cấu hình Security Groups

### 3.1 RDS Security Group

1. Vào **RDS** → **Databases** → Chọn instance
2. Click **VPC security groups** → **Edit inbound rules**
3. Thêm rule:

| Type | Protocol | Port | Source |
|------|----------|------|--------|
| PostgreSQL | TCP | 5432 | EC2 Security Group |

### 3.2 EC2 Security Group

1. Vào **EC2** → **Security Groups**
2. Inbound Rules:

| Type | Protocol | Port | Source |
|------|----------|------|--------|
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |
| SSH | TCP | 22 | Your IP |

---

## 📦 Bước 4: Deploy lên EC2

### Cách 1: Deploy với Docker (Recommended)

#### 4.1 Build Docker Image Local

```bash
cd ITing-backend

# Build image
docker build -t iting-app:latest .

# Hoặc với docker-compose
docker-compose build
```

#### 4.2 Push lên ECR (Elastic Container Registry) - Optional

```bash
# Tạo ECR repository
aws ecr create-repository --repository-name iting-app

# Login to ECR
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com

# Tag và push
docker tag iting-app:latest ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/iting-app:latest
docker push ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/iting-app:latest
```

#### 4.3 Deploy trên EC2

```bash
# SSH vào EC2
ssh -i your-key.pem ec2-user@EC2_PUBLIC_IP

# Tạo thư mục project
mkdir -p iting-app && cd iting-app

# Tạo .env file
cat > .env << 'EOF'
DB_HOST=iting-job-web.xxxx.ap-southeast-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=iting_job_web
DB_USER=postgres
DB_PASSWORD=YourSecurePassword123!
EOF

# Pull image (nếu dùng ECR)
docker pull ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/iting-app:latest

# Hoặc copy files và build trực tiếp trên EC2
# Copy project files via SCP
scp -i your-key.pem -r ITing-backend/* ec2-user@EC2_PUBLIC_IP:~/iting-app/

# Build trên EC2
docker build -t iting-app:latest .

# Run container
docker run -d \
  --name iting-app \
  -p 8080:8080 \
  --restart unless-stopped \
  --env-file .env \
  iting-app:latest
```

### Cách 2: Sử dụng Deploy Script

```bash
# Chạy script có sẵn
chmod +x deploy.sh
./deploy.sh
```

---

## ⚙️ Bước 5: Cấu hình Environment Variables

### 5.1 Các biến môi trường cần thiết

| Key | Value | Description |
|-----|-------|-------------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Active profile |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://HOST:5432/iting_job_web` | JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Database user |
| `SPRING_DATASOURCE_PASSWORD` | `YourSecurePassword123!` | Database password |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` | Auto create tables |
| `JWT_SECRET` | `your-256-bit-secret-key-at-least-32-characters` | JWT secret |
| `SERVER_PORT` | `8080` | Server port |

### 5.2 Cấu hình trong docker-compose.yml

```yaml
environment:
  - SPRING_PROFILES_ACTIVE=prod
  - SPRING_DATASOURCE_URL=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
  - SPRING_DATASOURCE_USERNAME=${DB_USER}
  - SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}
  - SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

---

## 🗃️ Bước 6: Khởi tạo Database

### 6.1 Sử dụng Schema SQL (Recommended)

```bash
# Copy schema.sql lên EC2
scp -i your-key.pem schema.sql ec2-user@EC2_PUBLIC_IP:~/iting-app/

# Kết nối RDS và chạy schema
psql -h iting-job-web.xxxx.ap-southeast-1.rds.amazonaws.com -U postgres -d iting_job_web -f schema.sql
```

### 6.2 Sử dụng Hibernate (Tự động)

Đảm bảo `application-prod.properties` có:
```properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

Hibernate sẽ tự tạo tables khi app khởi động.

### 6.3 Import dữ liệu mẫu

```bash
# Import data.sql
psql -h iting-job-web.xxxx.ap-southeast-1.rds.amazonaws.com -U postgres -d iting_job_web -f data.sql
```

---

## ⏱️ Tối ưu hóa và Monitoring

### Docker Optimizations (Đã tích hợp trong Dockerfile)

| Feature | Benefit |
|---------|---------|
| Layered JAR extraction | ~30% faster startup |
| ZGC garbage collector | Low-latency GC |
| Alpine JRE | Smaller image (~150MB) |
| Parallel Gradle builds | Faster compilation |
| Health check với actuator | Faster failure detection |

### Monitoring

```bash
# Xem logs
docker logs iting-app -f

# Xem resource usage
docker stats iting-app

# Restart nếu cần
docker restart iting-app
```

### Setup CloudWatch Monitoring (Optional)

```bash
# Install CloudWatch agent
sudo yum install -y amazon-cloudwatch-agent

# Configure monitoring
sudo cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'EOF'
{
  "metrics": {
    "namespace": "ITingApp",
    "metrics_collected": {
      "docker": {
        "metrics_collection_interval": 60
      }
    }
  }
}
```

---

## 🔧 Troubleshooting

### ❌ Lỗi: "Connection refused" đến RDS

**Nguyên nhân**: Security Group chưa mở port
**Giải pháp**: 
- Kiểm tra RDS Security Group → Inbound Rules → PostgreSQL (5432) từ EC2 SG

### ❌ Lỗi: "Password authentication failed"

**Nguyên nhân**: Sai password hoặc user
**Giải pháp**: 
- Kiểm tra lại `DB_USER` và `DB_PASSWORD`
- Verify RDS master username là `postgres`

### ❌ Lỗi: "Database does not exist"

**Nguyên nhân**: Database chưa được tạo
**Giải pháp**: 
- Tạo database: `CREATE DATABASE iting_job_web;`

### ❌ Lỗi: "Build failed" trên EC2

**Nguyên nhân**: Thiếu Docker build tools
**Giải pháp**: 
```bash
# Install Gradle
sudo yum install -y gradle

# Hoặc build local và chỉ push image
```

### ❌ App khởi động chậm

**Nguyên nhân**: 
- Thiếu memory
- Cold start lần đầu

**Giải pháp**: 
- Tăng `-Xmx512m` trong JAVA_OPTS
- Sử dụng ZGC (đã cấu hình)

### ❌ Health check fails

**Nguyên nhân**: Actuator endpoint không accessible
**Giải pháp**: 
```bash
# Kiểm tra logs
docker logs iting-app

# Test thủ công
curl http://localhost:8080/actuator/health
```

---

## 📊 Kiến trúc Deploy

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   GitHub Repo   │────▶│   EC2 (Docker)  │────▶│ AWS RDS         │
│                 │     │                 │     │ PostgreSQL      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                   Web Service             Database
    Source Code            (Spring Boot)          (Cloud SQL)
    (Manual/CI/CD)        Containerized          Managed
                                              (Auto backups)
```

---

## 🔗 URLs sau khi Deploy

| Service | URL |
|---------|-----|
| **API Base** | `http://EC2_PUBLIC_IP:8080` |
| **Swagger UI** | `http://EC2_PUBLIC_IP:8080/swagger-ui.html` |
| **API Docs** | `http://EC2_PUBLIC_IP:8080/api-docs` |
| **Health Check** | `http://EC2_PUBLIC_IP:8080/actuator/health` |

---

## 📝 Checklist Deploy

- [ ] Đã tạo RDS PostgreSQL instance
- [ ] Đã lấy RDS endpoint
- [ ] Đã tạo EC2 Instance
- [ ] Đã cài đặt Docker trên EC2
- [ ] Đã cấu hình Security Groups
- [ ] Đã build Docker image
- [ ] Đã deploy lên EC2
- [ ] Đã cấu hình Environment Variables
- [ ] Đã kiểm tra app hoạt động qua /actuator/health
- [ ] Đã test API qua Swagger UI

---

## 🚀 Optional: CI/CD với GitHub Actions

Tạo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t iting-app:latest .
      
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd iting-app
            docker-compose pull
            docker-compose up -d
```

---

## 🎉 Hoàn tất!

Sau khi hoàn thành các bước trên, ứng dụng ITing Job Portal của bạn đã được deploy thành công lên AWS!

---

*Cập nhật: March 2026*
