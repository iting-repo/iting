# Task 03: RDS PostgreSQL Configuration

## Objective

Configure the existing RDS PostgreSQL instance (`jobweb.cbkcwwk8ug43.ap-southeast-1.rds.amazonaws.com`): create an application database user with limited privileges, apply schema migrations, set up Flyway, and verify connectivity from the EC2 instance.

> **Important:** The RDS instance and S3 bucket (`datn-jobweb`) already exist in the project. We are configuring them to work with the new deployment infrastructure, NOT creating new ones.

## Prerequisites

- Task 01 completed (RDS security group configured for EC2 access)
- Task 02 completed (EC2 instance accessible, .env file created)
- Existing RDS endpoint: `jobweb.cbkcwwk8ug43.ap-southeast-1.rds.amazonaws.com`
- Existing S3 bucket: `datn-jobweb`

## Step-by-Step Instructions

### 3.1 Create Application Database User

The existing RDS uses the default `postgres` admin user. We'll create a dedicated application user with limited privileges for production security.

```bash
# SSH into EC2
SSH_KEY="iting-key-pair.pem"
PUBLIC_IP="<from-task-01>"
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP

# Install PostgreSQL client (Ubuntu uses apt)
sudo apt-get update -y && sudo apt-get install -y postgresql-client

# Source environment variables
source /opt/iting/.env

# Connect to the existing RDS as the postgres admin user
# The existing RDS endpoint is: jobweb.cbkcwwk8ug43.ap-southeast-1.rds.amazonaws.com
PGPASSWORD='<existing-db-password>' psql \
  --host=jobweb.cbkcwwk8ug43.ap-southeast-1.rds.amazonaws.com \
  --username=postgres \
  --dbname=iting_job_portal \
  --port=5432

# Inside psql, run the following SQL:
-- Create a dedicated application user (limit privileges for security)
CREATE USER iting_app WITH ENCRYPTED PASSWORD 'CHANGE_ME_STRONG_PASSWORD';

-- Grant connection privilege
GRANT CONNECT ON DATABASE iting_job_portal TO iting_app;

-- Create the application schema
CREATE SCHEMA IF NOT EXISTS testdb AUTHORIZATION iting_app;

-- Grant schema privileges
GRANT ALL PRIVILEGES ON SCHEMA testdb TO iting_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA testdb TO iting_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA testdb TO iting_app;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA testdb 
  GRANT ALL PRIVILEGES ON TABLES TO iting_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA testdb 
  GRANT ALL PRIVILEGES ON SEQUENCES TO iting_app;

-- Also grant access to the public schema tables (if using default schema)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO iting_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO iting_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT ALL PRIVILEGES ON TABLES TO iting_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT ALL PRIVILEGES ON SEQUENCES TO iting_app;

-- Verify
\du iting_app
\dn

\q
```

### 3.2 Apply Database Schema

```bash
# Copy schema files from the project repository to EC2
# Option A: Clone repository on EC2 (recommended)
cd /opt/iting
git clone https://github.com/YOUR_ORG/ITing.git iting-repo

# Option B: SCP from local machine (avoid for ongoing changes)
scp -i $SSH_KEY \
  /path/to/ITing/schema.sql \
  /path/to/ITing/setup-database.sql \
  ubuntu@$PUBLIC_IP:/opt/iting/config/

# Apply schema
source /opt/iting/.env

PGPASSWORD=$DB_PASSWORD psql \
  --host=$DB_HOST \
  --username=$DB_USERNAME \
  --dbname=$DB_NAME \
  --port=$DB_PORT \
  -v ON_ERROR_STOP=1 \
  -f /opt/iting/config/schema.sql

# Apply setup/seed data if exists
PGPASSWORD=$DB_PASSWORD psql \
  --host=$DB_HOST \
  --username=$DB_USERNAME \
  --dbname=$DB_NAME \
  --port=$DB_PORT \
  -v ON_ERROR_STOP=1 \
  -f /opt/iting/config/setup-database.sql

# If there are Flyway migrations in the backend project
PGPASSWORD=$DB_PASSWORD psql \
  --host=$DB_HOST \
  --username=$DB_USERNAME \
  --dbname=$DB_NAME \
  --port=$DB_PORT \
  -v ON_ERROR_STOP=1 \
  -f /opt/iting/iting-repo/ITing-backend/init-db.sql
```

### 3.3 Verify Database Connectivity

```bash
# Test connection with application user
source /opt/iting/.env

PGPASSWORD=$DB_PASSWORD psql \
  --host=$DB_HOST \
  --username=$DB_USERNAME \
  --dbname=$DB_NAME \
  --port=$DB_PORT \
  -c "SELECT version();"

# Expected: PostgreSQL 16.x

# Verify schema
PGPASSWORD=$DB_PASSWORD psql \
  --host=$DB_HOST \
  --username=$DB_USERNAME \
  --dbname=$DB_NAME \
  --port=$DB_PORT \
  -c "\dt testdb.*"

# Verify schema exists
PGPASSWORD=$DB_PASSWORD psql \
  --host=$DB_HOST \
  --username=$DB_USERNAME \
  --dbname=$DB_NAME \
  --port=$DB_PORT \
  -c "SELECT table_name FROM information_schema.tables WHERE table_schema='testdb' LIMIT 10;"

# Verify Flyway will use the correct schema
PGPASSWORD=$DB_PASSWORD psql \
  --host=$DB_HOST \
  --username=$DB_USERNAME \
  --dbname=$DB_NAME \
  --port=$DB_PORT \
  -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name='testdb';"
```

### 3.4 Configure RDS for Production

```bash
# Apply production settings to RDS
aws rds modify-db-instance \
  --db-instance-identifier iting-db \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --enable-performance-insights \
  --performance-insights-retention-period 7 \
  --cloudwatch-logs-export-configuration '{"EnableLogTypes":["postgresql","upgrade"]}' \
  --apply-immediately \
  --region ap-southeast-1

# Wait for modification
aws rds wait db-instance-available --db-instance-identifier iting-db --region ap-southeast-1
```

### 3.5 Add Database Health Check Cron

```bash
cat > /opt/iting/scripts/db-healthcheck.sh << 'DBHEOF'
#!/bin/bash
source /opt/iting/.env

PGPASSWORD=$DB_PASSWORD psql \
  --host=$DB_HOST \
  --username=$DB_USERNAME \
  --dbname=$DB_NAME \
  --port=$DB_PORT \
  -c "SELECT 1;" > /dev/null 2>&1

EXIT_CODE=$?
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

if [ $EXIT_CODE -ne 0 ]; then
  echo "$TIMESTAMP: Database health check FAILED" >> /var/log/iting-db-health.log
  exit 1
else
  echo "$TIMESTAMP: Database health check OK" >> /var/log/iting-db-health.log
  exit 0
fi
DBHEOF

chmod +x /opt/iting/scripts/db-healthcheck.sh

# Add cron for health check every 5 minutes
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/iting/scripts/db-healthcheck.sh") | crontab -
```

### 3.6 Configure Backend for RDS

The Spring Boot backend needs to be configured to connect to RDS instead of the local PostgreSQL. This is handled via environment variables in docker-compose.yml:

```yaml
# The following environment variables will be set in docker-compose.yml
# (defined in Task 07 - Backend Deployment)

environment:
  SPRING_DATASOURCE_URL: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?currentSchema=${DB_SCHEMA}
  SPRING_DATASOURCE_USERNAME: ${DB_USERNAME}
  SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
  SPRING_FLYWAY_ENABLED: true
  SPRING_FLYWAY_DEFAULT_SCHEMA: testdb
  SPRING_FLYWAY_URL: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?currentSchema=testdb
  SPRING_FLYWAY_USER: ${DB_USERNAME}
  SPRING_FLYWAY_PASSWORD: ${DB_PASSWORD}
```

Add `DB_SCHEMA=testdb` to `/opt/iting/.env`:

```bash
echo "" >> /opt/iting/.env
echo "# ---- Database Schema ----" >> /opt/iting/.env
echo "DB_SCHEMA=testdb" >> /opt/iting/.env
```

## Verification

```bash
# Verify database is accessible
source /opt/iting/.env
PGPASSWORD=$DB_PASSWORD psql --host=$DB_HOST --username=$DB_USERNAME --dbname=$DB_NAME -c "SELECT version();"

# Verify schema exists
PGPASSWORD=$DB_PASSWORD psql --host=$DB_HOST --username=$DB_USERNAME --dbname=$DB_NAME -c "\dn testdb"

# Verify tables were created
PGPASSWORD=$DB_PASSWORD psql --host=$DB_HOST --username=$DB_USERNAME --dbname=$DB_NAME -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='testdb';"

# Verify health check script works
/opt/iting/scripts/db-healthcheck.sh && echo "DB Health: OK" || echo "DB Health: FAILED"
```

## Rollback

```bash
# Drop schema and user (destructive)
PGPASSWORD='<admin-password>' psql --host=$DB_HOST --username=iting_admin --dbname=iting_job_portal << 'SQL'
DROP SCHEMA IF EXISTS testdb CASCADE;
REVOKE ALL PRIVILEGES ON DATABASE iting_job_portal FROM iting_app;
DROP USER IF EXISTS iting_app;
SQL

# Restore from RDS snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier iting-db-restored \
  --db-snapshot-identifier iting-db-snapshot \
  --region ap-southeast-1
```

## References

- `schema.sql` - Database schema definition
- `setup-database.sql` - Database setup script
- `ITing-backend/docker-compose.yml` - Local PostgreSQL config for reference
- `ITing-backend/init-db.sql/` - Flyway migration scripts
- `.opencode/skills/rds/` - AWS RDS skill reference
