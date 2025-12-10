# 🚀 HƯỚNG DẪN DEPLOY ITING JOB PORTAL LÊN RENDER + AIVEN

## 📋 Mục lục
1. [Yêu cầu](#yêu-cầu)
2. [Bước 1: Chuẩn bị Aiven PostgreSQL](#bước-1-chuẩn-bị-aiven-postgresql)
3. [Bước 2: Đẩy code lên GitHub](#bước-2-đẩy-code-lên-github)
4. [Bước 3: Deploy lên Render](#bước-3-deploy-lên-render)
5. [Bước 4: Cấu hình Environment Variables](#bước-4-cấu-hình-environment-variables)
6. [Bước 5: Khởi tạo Database](#bước-5-khởi-tạo-database)
7. [Kiểm tra và Troubleshooting](#kiểm-tra-và-troubleshooting)

---

## 📌 Yêu cầu

- Tài khoản [GitHub](https://github.com)
- Tài khoản [Render](https://render.com) (miễn phí)
- Tài khoản [Aiven](https://aiven.io) (miễn phí 30 ngày trial)

---

## 🗄️ Bước 1: Chuẩn bị Aiven PostgreSQL

### 1.1 Đăng ký Aiven (nếu chưa có)
1. Truy cập https://console.aiven.io/signup
2. Đăng ký bằng email hoặc GitHub

### 1.2 Tạo PostgreSQL Service
1. Đăng nhập vào Aiven Console
2. Click **Create Service**
3. Chọn **PostgreSQL**
4. Chọn plan **Free** (hoặc Hobbyist)
5. Chọn cloud region gần Việt Nam (Singapore)
6. Đặt tên service: `iting-postgres`
7. Click **Create Service**

### 1.3 Lấy thông tin kết nối
Sau khi service được tạo (chờ 1-2 phút), vào tab **Overview**:

```
Host:     pg-xxx.aivencloud.com
Port:     23388
Database: defaultdb
User:     avnadmin
Password: AVNS_xxxxxxxxxxxx
```

**Connection String (JDBC):**
```
jdbc:postgresql://pg-xxx.aivencloud.com:23388/defaultdb?sslmode=require
```

> ⚠️ **Lưu ý**: SSL là bắt buộc với Aiven. Đảm bảo có `?sslmode=require` trong URL.

---

## 📤 Bước 2: Đẩy code lên GitHub

### 2.1 Tạo Repository trên GitHub
1. Truy cập https://github.com/new
2. Tạo repository mới: `iting-job-portal`
3. **KHÔNG** chọn "Initialize with README"

### 2.2 Push code lên GitHub
Mở terminal trong thư mục dự án và chạy:

```bash
# Khởi tạo Git (nếu chưa có)
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit - ITing Job Portal"

# Thêm remote origin (thay YOUR_USERNAME bằng tên GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/iting-job-portal.git

# Push lên GitHub
git branch -M main
git push -u origin main
```

---

## 🌐 Bước 3: Deploy lên Render

### 3.1 Đăng ký Render
1. Truy cập https://render.com
2. Đăng ký bằng GitHub (recommended)

### 3.2 Tạo Web Service

#### Cách 1: Deploy thủ công (Recommended cho lần đầu)

1. Đăng nhập Render Dashboard
2. Click **New +** → **Web Service**
3. Chọn **Connect a Git Repository**
4. Chọn repository `iting-job-portal`
5. Cấu hình:

| Setting | Value |
|---------|-------|
| **Name** | `iting-job-portal` |
| **Region** | Singapore |
| **Branch** | `main` |
| **Runtime** | Docker |
| **Dockerfile Path** | `./Dockerfile` |
| **Instance Type** | Free |

6. Click **Create Web Service**

#### Cách 2: Deploy bằng Blueprint (render.yaml)
1. Đăng nhập Render Dashboard
2. Click **New +** → **Blueprint**
3. Chọn repository chứa file `render.yaml`
4. Render sẽ tự động đọc cấu hình

---

## ⚙️ Bước 4: Cấu hình Environment Variables

### 4.1 Thêm Environment Variables trong Render

1. Vào **Dashboard** → Chọn service `iting-job-portal`
2. Click tab **Environment**
3. Thêm các biến sau:

| Key | Value | Description |
|-----|-------|-------------|
| `DATABASE_URL` | `jdbc:postgresql://pg-xxx.aivencloud.com:23388/defaultdb?sslmode=require` | JDBC URL từ Aiven |
| `DATABASE_USERNAME` | `avnadmin` | Username Aiven |
| `DATABASE_PASSWORD` | `AVNS_xxxxxxxxxxxx` | Password Aiven |
| `JWT_SECRET` | `your-256-bit-secret-key-at-least-32-characters` | Secret key cho JWT |
| `SPRING_PROFILES_ACTIVE` | `prod` | Active profile |

4. Click **Save Changes**

### 4.2 Lấy thông tin Aiven chính xác
Vào Aiven Console → Service của bạn → Tab **Overview**:
- **Service URI** chứa host, port, user, password
- Copy và thay thế vào các biến trên

---

## 🗃️ Bước 5: Khởi tạo Database

### 5.1 Khởi tạo Schema (Lần đầu tiên)

Có 2 cách:

#### Cách 1: Dùng Hibernate tự tạo tables
File `application-prod.properties` đã cấu hình:
```properties
spring.jpa.hibernate.ddl-auto=update
```
Hibernate sẽ tự tạo tables khi app khởi động.

#### Cách 2: Chạy data.sql thủ công (Recommended)
1. Tải **DBeaver** hoặc **pgAdmin**
2. Kết nối đến Aiven PostgreSQL
3. Chạy nội dung file `src/main/resources/data.sql`

### 5.2 Để App tự insert dữ liệu mẫu (Chỉ lần đầu)

**Bước 1**: Sửa tạm `application-prod.properties`:
```properties
spring.sql.init.mode=always
spring.jpa.hibernate.ddl-auto=create
```

**Bước 2**: Deploy lại
```bash
git add .
git commit -m "Enable data initialization"
git push origin main
```

**Bước 3**: Đợi Render deploy xong, sau đó đổi lại:
```properties
spring.sql.init.mode=never
spring.jpa.hibernate.ddl-auto=update
```

**Bước 4**: Push lại để tránh reset data mỗi lần deploy
```bash
git add .
git commit -m "Disable data initialization"
git push origin main
```

---

## ✅ Kiểm tra và Troubleshooting

### Kiểm tra API hoạt động

Sau khi deploy thành công, Render sẽ cung cấp URL dạng:
```
https://iting-job-portal.onrender.com
```

Test các endpoint:

```bash
# Health check
curl https://iting-job-portal.onrender.com/actuator/health

# API endpoint
curl https://iting-job-portal.onrender.com/api/jobs

# Swagger UI
# Mở trình duyệt: https://iting-job-portal.onrender.com/swagger-ui.html
```

### Xem Logs
1. Vào Render Dashboard → Service
2. Click tab **Logs**
3. Xem realtime logs

### Các lỗi thường gặp

#### ❌ Lỗi: "Connection refused" hoặc "FATAL: password authentication failed"
**Nguyên nhân**: Sai thông tin kết nối database
**Giải pháp**: 
- Kiểm tra lại `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- Đảm bảo có `?sslmode=require` trong URL

#### ❌ Lỗi: "Build failed"
**Nguyên nhân**: Lỗi compile Maven
**Giải pháp**: 
```bash
# Test build local trước
mvn clean package -DskipTests
```

#### ❌ Lỗi: "Port already in use" hoặc "Address already in use"
**Nguyên nhân**: App không dùng PORT từ Render
**Giải pháp**: Đảm bảo `application-prod.properties` có:
```properties
server.port=${PORT:8080}
```

#### ❌ Lỗi: "Table does not exist"
**Nguyên nhân**: Hibernate chưa tạo tables
**Giải pháp**: 
- Kiểm tra `spring.jpa.hibernate.ddl-auto=update`
- Hoặc chạy `data.sql` thủ công

#### ❌ App khởi động chậm / Timeout
**Nguyên nhân**: Free tier Render sleep sau 15 phút không hoạt động
**Giải pháp**: 
- Đợi 30-60 giây cho cold start
- Upgrade lên paid plan nếu cần performance

---

## 📊 Kiến trúc Deploy

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   GitHub Repo   │────▶│  Render (Docker)│────▶│ Aiven PostgreSQL│
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
    Source Code            Web Service              Database
    (Auto Deploy)        (Spring Boot)           (Cloud SQL)
```

---

## 🔗 URLs sau khi Deploy

| Service | URL |
|---------|-----|
| **API Base** | `https://iting-job-portal.onrender.com` |
| **Swagger UI** | `https://iting-job-portal.onrender.com/swagger-ui.html` |
| **API Docs** | `https://iting-job-portal.onrender.com/api-docs` |
| **Health Check** | `https://iting-job-portal.onrender.com/actuator/health` |

---

## 📝 Checklist Deploy

- [ ] Đã tạo Aiven PostgreSQL service
- [ ] Đã lấy connection string từ Aiven
- [ ] Đã push code lên GitHub
- [ ] Đã tạo Render Web Service
- [ ] Đã cấu hình Environment Variables trên Render
- [ ] Đã kiểm tra app hoạt động qua /actuator/health
- [ ] Đã test API qua Swagger UI

---

## 🎉 Hoàn tất!

Sau khi hoàn thành các bước trên, ứng dụng ITing Job Portal của bạn đã được deploy thành công!

Mỗi khi push code mới lên branch `main`, Render sẽ tự động build và deploy lại.

---

*Cập nhật: December 2024*

