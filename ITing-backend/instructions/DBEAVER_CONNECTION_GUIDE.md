# 🔌 Hướng dẫn kết nối DBeaver với ITing PostgreSQL

## Thông số kết nối

| Thông số | Giá trị |
|----------|---------|
| **Host** | `localhost` |
| **Port** | `5433` |
| **Database** | `iting_job_portal` |
| **Username** | `postgres` |
| **Password** | `250904` |
| **Driver** | PostgreSQL |

---

## Các bước kết nối trong DBeaver

### 1. Tạo connection mới
- Mở DBeaver → Click **"New Database Connection"** (hoặc Ctrl+Shift+N)
- Chọn **PostgreSQL** → Click **Next**

### 2. Điền thông tin
```
Host: localhost
Port: 5433
Database: iting_job_portal
Authentication: Database Native
Username: postgres
Password: 250904
```

### 3. Test Connection
- Click **Test Connection**
- Nếu chưa có driver, DBeaver sẽ tự động tải PostgreSQL JDBC driver
- Kết quả: ✅ **"Connected"**

### 4. Finish
- Click **Finish** để lưu connection

---

## Lưu ý quan trọng

### Port 5433 (không phải 5432)
- ITing PostgreSQL chạy trên port **5433** để tránh xung đột với PostgreSQL Docker khác
- Đảm bảo container `iting-postgres` đang chạy:
  ```bash
  docker ps | grep iting-postgres
  ```

### Kiểm tra connection
```bash
# Trong terminal
docker exec -it iting-postgres psql -U postgres -d iting_job_portal

# Liệt kê tables
\dt

# Thoát
\q
```

---

## Schema hiện tại

**Tổng số tables**: 30 bảng

### Core tables
- `account`, `users`, `candidate_profiles`
- `company`, `admin_accounts`
- `job`, `apply_form`, `apply_form_user_to_job`

### Profile components
- `cv`, `education`, `certificate`, `skill`, `experience`
- `social_link`, `portfolio`

### System tables
- `categories`, `static_contents`, `activity_logs`
- `user_reports`, `report_accounts`, `ban_history`
- `vn_location`, `web_info`, `social_network`

### Relationship tables
- `user_follow_company`, `user_contact_company`
- `user_save_job`, `company_upload_job`
- `notification`

---

## Cách import dữ liệu test

### 1. Từ SQL file
```bash
docker exec -i iting-postgres psql -U postgres -d iting_job_portal < your_data.sql
```

### 2. Từ DBeaver
- Right-click table → **Import Data**
- Chọn format: CSV, JSON, SQL, etc.
- Follow wizard

### 3. Script import
```sql
-- Example: Insert sample data
INSERT INTO account (email, password, role, status) 
VALUES ('test@example.com', 'hashed_password', 'CANDIDATE', 'ACTIVE');
```

---

## Troubleshooting

### ❌ Password authentication failed

**Nguyên nhân**: Volume cũ có password khác

**Giải pháp**:
```bash
# Stop và xóa volume cũ
docker-compose down
docker volume rm iting-backend_postgres_data

# Start lại với password mới
docker-compose up -d postgres

# Import schema lại
docker exec -i iting-postgres psql -U postgres -d iting_job_portal < src/main/resources/schema.sql
```

### ❌ Connection refused
**Nguyên nhân**: Container chưa chạy
```bash
cd F:\HK252\ITing\ITing-backend
docker-compose up -d postgres
```

### ❌ Port already in use
**Nguyên nhân**: Port 5433 bị chiếm
- Kiểm tra: `netstat -ano | findstr 5433`
- Đổi port trong `docker-compose.yml` và `.env`

### ❌ Database does not exist
**Nguyên nhân**: Database chưa tạo
```bash
docker exec iting-postgres psql -U postgres -c "CREATE DATABASE iting_job_portal;"
```

### ❌ Tables not found
**Nguyên nhân**: Schema chưa import
```bash
cd F:\HK252\ITing\ITing-backend
docker exec -i iting-postgres psql -U postgres -d iting_job_portal < src/main/resources/schema.sql
```

---

## Chạy backend với database

### 1. Chỉ PostgreSQL (ngoài Docker)
```bash
# Start only database
docker-compose up -d postgres

# Run backend trong IDE hoặc terminal
mvn spring-boot:run
```

### 2. Full stack trong Docker
```bash
# Start both database + backend
docker-compose up -d

# View logs
docker-compose logs -f app

# Access API
curl http://localhost:8081/actuator/health
```

### 3. Backend access
- **API**: http://localhost:8081
- **Swagger**: http://localhost:8081/swagger-ui.html
- **Health**: http://localhost:8081/actuator/health

---

## Backup & Restore

### Backup database
```bash
docker exec iting-postgres pg_dump -U postgres iting_job_portal > backup_$(date +%Y%m%d).sql
```

### Restore database
```bash
docker exec -i iting-postgres psql -U postgres -d iting_job_portal < backup_20260319.sql
```

---

## Docker commands reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart database
docker-compose restart postgres

# Remove volumes (CAUTION: deletes all data)
docker-compose down -v

# Enter PostgreSQL shell
docker exec -it iting-postgres psql -U postgres -d iting_job_portal
```

---

**✅ Kết nối thành công!** Bạn đã sẵn sàng phát triển với ITing local database.
