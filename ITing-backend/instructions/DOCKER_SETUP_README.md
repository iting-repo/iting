# 🚀 ITing Backend - Docker Setup

## Quick Start

### 1. Start PostgreSQL only
```bash
docker-compose up -d postgres
```

### 2. Verify connection
```bash
bash test-db-connection.sh
```

### 3. Connect with DBeaver
```
Host: localhost
Port: 5433
Database: iting_job_portal
Username: postgres
Password: 250904
```

**📖 Full guide**: See [DBEAVER_CONNECTION_GUIDE.md](DBEAVER_CONNECTION_GUIDE.md)

---

## What Changed?

### ✅ Configured for Local Development

| Before | After |
|--------|-------|
| AWS RDS (remote) | PostgreSQL Docker (local) |
| Port 5432 | Port **5433** (avoid conflict) |
| Database: `postgres` | Database: `iting_job_portal` |
| Password: `violet250904` | Password: `250904` |

### 📁 Files Modified

- **docker-compose.yml** - Added PostgreSQL service
- **.env** - Updated to local credentials
- **application.properties** - Changed to localhost:5433, validate mode
- **DBEAVER_CONNECTION_GUIDE.md** - ✨ New connection guide
- **test-db-connection.sh** - ✨ Test script

---

## Architecture

```
┌─────────────────────────────────────┐
│   Host Machine (Windows)            │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Docker Network              │  │
│  │  (iting-network)             │  │
│  │                              │  │
│  │  ┌────────────────────────┐ │  │
│  │  │  iting-postgres        │ │  │
│  │  │  PostgreSQL 16         │ │  │
│  │  │  Internal: 5432        │ │  │
│  │  │  External: 5433        │←┼──┼─── DBeaver connects here
│  │  └────────────────────────┘ │  │
│  │           ↑                  │  │
│  │           │ (postgres:5432)  │  │
│  │           │                  │  │
│  │  ┌────────────────────────┐ │  │
│  │  │  iting-app (optional)  │ │  │
│  │  │  Spring Boot           │ │  │
│  │  │  Port: 8081            │←┼──┼─── API: localhost:8081
│  │  └────────────────────────┘ │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Key Points**:
- PostgreSQL runs on **port 5433** externally (not 5432)
- Inside Docker network: app connects to `postgres:5432`
- From host machine: DBeaver/psql connects to `localhost:5433`

---

## Database Schema

**30 tables** imported from `src/main/resources/schema.sql`

### Core Authentication
- `account` - User accounts (email, password, role)
- `users` - User profiles
- `admin_accounts` - Admin users
- `company` - Company profiles

### Jobs & Applications
- `job` - Job postings
- `apply_form` - Application forms
- `apply_form_user_to_job` - Job applications
- `company_upload_job` - Job upload tracking
- `user_save_job` - Saved jobs

### Candidate Profiles
- `candidate_profiles` - Candidate info
- `cv` - CV files
- `education` - Education history
- `certificate` - Certifications
- `skill` - Skills
- `experience` - Work experience
- `social_link` - Social media links
- `portfolio` - Portfolio items

### System & Content
- `categories` - Categories/tags
- `static_contents` - CMS content
- `activity_logs` - Activity tracking
- `user_reports` - User reports
- `report_accounts` - Account reports
- `ban_history` - Ban records

### Relationships
- `user_follow_company` - Company followers
- `user_contact_company` - Contact messages
- `notification` - Notifications

### Reference Data
- `vn_location` - Vietnam locations
- `web_info` - Website info
- `social_network` - Social network configs
- `contact_info` - Contact information

---

## Commands Reference

### Docker Commands
```bash
# Start only database
docker-compose up -d postgres

# Start full stack (database + backend)
docker-compose up -d

# Stop all
docker-compose down

# View logs
docker-compose logs -f
docker-compose logs -f postgres
docker-compose logs -f app

# Restart
docker-compose restart postgres

# Remove all (including data)
docker-compose down -v
```

### Database Commands
```bash
# Connect to PostgreSQL shell
docker exec -it iting-postgres psql -U postgres -d iting_job_portal

# Run SQL file
docker exec -i iting-postgres psql -U postgres -d iting_job_portal < myfile.sql

# Backup database
docker exec iting-postgres pg_dump -U postgres iting_job_portal > backup.sql

# Restore database
docker exec -i iting-postgres psql -U postgres -d iting_job_portal < backup.sql

# List tables
docker exec iting-postgres psql -U postgres -d iting_job_portal -c "\dt"

# Count records
docker exec iting-postgres psql -U postgres -d iting_job_portal -c "SELECT COUNT(*) FROM account;"
```

### Test Commands
```bash
# Run connection test
bash test-db-connection.sh

# Test backend health (if running)
curl http://localhost:8081/actuator/health
```

---

## Running Backend

### Option 1: Docker (Full Stack)
```bash
# Build and run both database + backend
docker-compose up -d

# Access API
curl http://localhost:8081/api/...
```

### Option 2: Local Backend + Docker Database
```bash
# Start only database
docker-compose up -d postgres

# Run backend in IDE or terminal
mvn spring-boot:run
# or
gradle bootRun
```

Backend connects to `localhost:5433` automatically (configured in `application.properties`)

---

## Endpoints

When backend is running:

- **API Base**: http://localhost:8081
- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **API Docs**: http://localhost:8081/v3/api-docs
- **Health Check**: http://localhost:8081/actuator/health

---

## Troubleshooting

### Problem: Port 5433 already in use
**Solution**: Change port in `docker-compose.yml` and `application.properties`
```yaml
# docker-compose.yml
ports:
  - "5434:5432"  # Change 5433 to 5434
```

### Problem: Password authentication failed
**Solution**: Reset database volume
```bash
docker-compose down
docker volume rm iting-backend_postgres_data
docker-compose up -d postgres
# Re-import schema
docker exec -i iting-postgres psql -U postgres -d iting_job_portal < src/main/resources/schema.sql
```

### Problem: Tables not found
**Solution**: Import schema
```bash
docker exec -i iting-postgres psql -U postgres -d iting_job_portal < src/main/resources/schema.sql
```

### Problem: Cannot connect from DBeaver
**Checklist**:
1. Container running? `docker ps | grep iting-postgres`
2. Port correct? Should be **5433** not 5432
3. Password correct? Should be **250904**
4. Database exists? `docker exec iting-postgres psql -U postgres -l`

---

## Environment Variables

### .env file
```env
DB_HOST=postgres
DB_PORT=5433
DB_NAME=iting_job_portal
DB_USER=postgres
DB_PASSWORD=250904
APP_ENV=development
```

### application.properties
```properties
spring.datasource.url=jdbc:postgresql://localhost:5433/iting_job_portal
spring.datasource.username=postgres
spring.datasource.password=250904
spring.jpa.hibernate.ddl-auto=validate
spring.sql.init.mode=never
```

**Note**: Docker overrides these with environment variables from `docker-compose.yml`

---

## Data Import

You mentioned you have test data. Import it like this:

```bash
# SQL file
docker exec -i iting-postgres psql -U postgres -d iting_job_portal < your_data.sql

# CSV file (example for 'users' table)
docker cp your_data.csv iting-postgres:/tmp/
docker exec iting-postgres psql -U postgres -d iting_job_portal -c "\COPY users FROM '/tmp/your_data.csv' CSV HEADER;"
```

Or use DBeaver's import wizard:
1. Right-click table → **Import Data**
2. Select format (CSV, JSON, SQL)
3. Follow wizard

---

## Next Steps

1. ✅ Database is running
2. ✅ Schema imported (30 tables)
3. 🔄 **Import your test data**
4. 🔄 **Connect DBeaver** using credentials above
5. 🔄 **Run backend** and test API

---

## Support Files

- **DBEAVER_CONNECTION_GUIDE.md** - Detailed DBeaver setup guide
- **test-db-connection.sh** - Connection test script
- **.env** - Environment configuration
- **docker-compose.yml** - Docker services definition

---

**✅ Setup Complete!** You're ready to develop with ITing local database.
