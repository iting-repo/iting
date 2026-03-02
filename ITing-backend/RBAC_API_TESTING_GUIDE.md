# 🧪 RBAC API Testing Guide

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Role-Based Testing](#role-based-testing)
- [API Endpoints Matrix](#api-endpoints-matrix)
- [Test Scenarios](#test-scenarios)
- [Negative Testing](#negative-testing)
- [Database Verification](#database-verification)
- [Performance Testing](#performance-testing)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## 🎯 Overview

This guide provides comprehensive testing instructions for the Role-Based Access Control (RBAC) API implementation. The system supports three main roles:

- **ADMIN**: Full system access
- **EMPLOYER**: Job management and company operations
- **CANDIDATE**: Job search and application management

## ⚙️ Prerequisites

### Required Tools
```bash
# API Testing Tools
- Postman (Recommended) or Insomnia
- curl (Command line)
- JWT Decoder (Browser plugin)

# Database Tools
- DBeaver or PGAdmin (PostgreSQL)
- psql command line

# Development Tools
- Java 17+
- Spring Boot 3.2.1+
- PostgreSQL 14+
```

### Environment Setup
```bash
# 1. Start PostgreSQL
docker run --name postgres-rbac -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14

# 2. Start Application
./gradlew bootRun

# 3. Verify Health Check
curl http://localhost:8080/actuator/health
```

## 🚀 Quick Start

### 1. Login and Get JWT Token
```bash
# Admin Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@iting.com",
    "password": "123456"
  }'

# Response Example
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBpdGluZy5jb20iLCJyb2xlcyI6WyJBRE1JTiJdLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNDY1NDI5MH0.signature",
  "type": "Bearer",
  "userId": 1,
  "email": "admin@iting.com",
  "role": "ADMIN"
}
```

### 2. Store Token for Testing
```bash
# Set environment variables
export ADMIN_TOKEN="eyJhbGciOiJIUzI1NiJ9..."
export EMPLOYER_TOKEN="eyJhbGciOiJIUzI1NiJ9..."
export CANDIDATE_TOKEN="eyJhbGciOiJIUzI1NiJ9..."
```

## 🔐 Authentication

### Login Endpoints
```bash
# Admin User
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@iting.com", "password": "123456"}'

# Employer User
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "employer1@company.com", "password": "123456"}'

# Candidate User
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "candidate1@gmail.com", "password": "123456"}'
```

### JWT Token Structure
```json
{
  "sub": "admin@iting.com",
  "roles": ["ADMIN"],
  "permissions": [
    "USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DELETE",
    "JOB_VIEW", "JOB_CREATE", "JOB_UPDATE", "JOB_DELETE", "JOB_APPROVE",
    "COMPANY_VIEW", "COMPANY_CREATE", "COMPANY_UPDATE", "COMPANY_DELETE",
    "SYSTEM_CONFIG", "SYSTEM_LOGS"
  ],
  "iat": 1634567890,
  "exp": 1634654290
}
```

## 🎭 Role-Based Testing

### 👑 ADMIN Role Tests

#### ✅ Should Succeed
```bash
# Get all users
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get dashboard statistics
curl -X GET http://localhost:8080/api/admin/dashboard/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Create category
curl -X POST http://localhost:8080/api/admin/categories \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INDUSTRY",
    "name": "Công nghệ thông tin",
    "nameEn": "Information Technology",
    "description": "Các công ty công nghệ",
    "icon": "fas fa-laptop-code"
  }'

# Approve job
curl -X POST http://localhost:8080/api/admin/jobs/1/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get activity logs
curl -X GET http://localhost:8080/api/admin/activity-logs \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 🏢 EMPLOYER Role Tests

#### ✅ Should Succeed
```bash
# Get my jobs
curl -X GET http://localhost:8080/api/jobs/my \
  -H "Authorization: Bearer $EMPLOYER_TOKEN"

# Create job
curl -X POST http://localhost:8080/api/jobs \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "position": "Senior Java Developer",
    "description": "Chúng tôi đang tìm kiếm Senior Java Developer có kinh nghiệm",
    "requirements": "5+ năm kinh nghiệm Java, Spring Boot",
    "techRequired": "Java, Spring Boot, PostgreSQL, Microservices",
    "location": "Hồ Chí Minh",
    "jobType": "FULL_TIME",
    "experienceLevel": "SENIOR",
    "minSalary": 25000000,
    "maxSalary": 35000000,
    "dueDate": "2024-12-31"
  }'

# Update my job
curl -X PUT http://localhost:8080/api/jobs/1 \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "position": "Senior Java Developer (Updated)",
    "description": "Updated description"
  }'

# Get applications for my jobs
curl -X GET http://localhost:8080/api/applications/my-jobs \
  -H "Authorization: Bearer $EMPLOYER_TOKEN"
```

#### ❌ Should Fail
```bash
# Access admin endpoints (403 Forbidden)
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $EMPLOYER_TOKEN"

# Access other employer's jobs (403 Forbidden)
curl -X PUT http://localhost:8080/api/jobs/999 \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"position": "Hacked"}'
```

### 👤 CANDIDATE Role Tests

#### ✅ Should Succeed
```bash
# Get all jobs
curl -X GET http://localhost:8080/api/jobs \
  -H "Authorization: Bearer $CANDIDATE_TOKEN"

# Get job details
curl -X GET http://localhost:8080/api/jobs/1 \
  -H "Authorization: Bearer $CANDIDATE_TOKEN"

# Search jobs
curl -X GET "http://localhost:8080/api/jobs/search?keyword=java&location=Hồ%20Chí%20Minh" \
  -H "Authorization: Bearer $CANDIDATE_TOKEN"

# Apply to job
curl -X POST http://localhost:8080/api/applications \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": 1,
    "coverLetter": "Tôi rất quan tâm đến vị trí này và có kinh nghiệm phù hợp",
    "expectedSalary": 30000000
  }'

# Get my applications
curl -X GET http://localhost:8080/api/applications/my \
  -H "Authorization: Bearer $CANDIDATE_TOKEN"

# Update profile
curl -X PUT http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Nguyễn",
    "lastName": "Văn A",
    "phone": "0901234567",
    "address": "Hồ Chí Minh",
    "skills": ["Java", "Spring Boot", "PostgreSQL"],
    "experience": "5 năm",
    "education": "Đại học Bách Khoa TPHCM"
  }'
```

#### ❌ Should Fail
```bash
# Access admin endpoints (403 Forbidden)
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $CANDIDATE_TOKEN"

# Create job (403 Forbidden)
curl -X POST http://localhost:8080/api/jobs \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"position": "Fake Job"}'

# Update other's job (403 Forbidden)
curl -X PUT http://localhost:8080/api/jobs/1 \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"position": "Hacked"}'
```

## 📊 API Endpoints Matrix

| Endpoint | Method | ADMIN | EMPLOYER | CANDIDATE | Description |
|----------|--------|-------|----------|-----------|-------------|
| `/api/auth/login` | POST | ✅ | ✅ | ✅ | User authentication |
| `/api/admin/users` | GET | ✅ | ❌ | ❌ | Get all users |
| `/api/admin/dashboard/stats` | GET | ✅ | ❌ | ❌ | Dashboard statistics |
| `/api/admin/categories` | GET | ✅ | ❌ | ❌ | Get categories |
| `/api/admin/categories` | POST | ✅ | ❌ | ❌ | Create category |
| `/api/jobs` | GET | ✅ | ✅ | ✅ | Get jobs (filtered by role) |
| `/api/jobs` | POST | ✅ | ✅ | ❌ | Create job |
| `/api/jobs/my` | GET | ✅ | ✅ | ❌ | Get my jobs |
| `/api/jobs/{id}` | PUT | ✅ | ✅* | ❌ | Update job (*owner only) |
| `/api/applications` | POST | ✅ | ❌ | ✅ | Apply to job |
| `/api/applications/my` | GET | ✅ | ✅ | ✅ | Get my applications |
| `/api/users/profile` | GET | ✅ | ✅ | ✅ | Get profile |
| `/api/users/profile` | PUT | ✅ | ✅ | ✅ | Update profile |

## 🧪 Test Scenarios

### Scenario 1: Complete User Flow
```bash
#!/bin/bash
# complete_flow_test.sh

echo "=== Complete RBAC User Flow Test ==="

# 1. Candidate registers and applies for job
echo "1. Candidate Login..."
CANDIDATE_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "candidate1@gmail.com", "password": "123456"}' | \
  jq -r '.token')

echo "2. Browse Jobs..."
curl -s -X GET http://localhost:8080/api/jobs \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" | \
  jq '.[0:3] | .[] | {id, position, company}'

echo "3. Apply to Job..."
curl -s -X POST http://localhost:8080/api/applications \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobId": 1, "coverLetter": "Interested in this position"}'

# 4. Employer reviews applications
echo "4. Employer Login..."
EMPLOYER_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "employer1@company.com", "password": "123456"}' | \
  jq -r '.token')

echo "5. Review Applications..."
curl -s -X GET http://localhost:8080/api/applications/my-jobs \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" | \
  jq '.[0:3] | .[] | {id, job, candidate, status}'

# 5. Admin monitors system
echo "6. Admin Dashboard..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@iting.com", "password": "123456"}' | \
  jq -r '.token')

curl -s -X GET http://localhost:8080/api/admin/dashboard/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN" | \
  jq '{totalUsers, totalJobs, totalApplications}'
```

### Scenario 2: Permission Boundary Testing
```bash
#!/bin/bash
# permission_boundary_test.sh

echo "=== Permission Boundary Testing ==="

# Test cross-role access attempts
echo "1. Employer trying to access admin endpoints..."
curl -s -w "\nStatus: %{http_code}\n" -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $EMPLOYER_TOKEN"

echo "2. Candidate trying to create job..."
curl -s -w "\nStatus: %{http_code}\n" -X POST http://localhost:8080/api/jobs \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"position": "Unauthorized Job"}'

echo "3. Employer trying to modify other employer's job..."
curl -s -w "\nStatus: %{http_code}\n" -X PUT http://localhost:8080/api/jobs/999 \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"position": "Hacked Job"}'
```

## 🚫 Negative Testing

### Unauthorized Access
```bash
# No authentication
curl -X GET http://localhost:8080/api/admin/users
# Expected: 401 Unauthorized

# Invalid token
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer invalid_token"
# Expected: 401 Unauthorized

# Expired token
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer expired_token"
# Expected: 401 Unauthorized
```

### Invalid Input
```bash
# Invalid JSON
curl -X POST http://localhost:8080/api/jobs \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "json"}'
# Expected: 400 Bad Request

# Missing required fields
curl -X POST http://localhost:8080/api/jobs \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 400 Bad Request

# Invalid enum values
curl -X POST http://localhost:8080/api/jobs \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobType": "INVALID_TYPE"}'
# Expected: 400 Bad Request
```

## 🗄️ Database Verification

### Check RBAC Data
```sql
-- Connect to PostgreSQL
psql -h localhost -U postgres -d iting_job_portal

-- 1. Verify users and roles
SELECT 
    a.id,
    a.email,
    a.status,
    r.name as role_name,
    a.created_at
FROM accounts a
JOIN account_roles ar ON a.id = ar.account_id
JOIN roles r ON ar.role_id = r.id
ORDER BY a.id;

-- 2. Check permissions per role
SELECT 
    r.name as role,
    p.code as permission,
    p.name as permission_name,
    p.module,
    p.action
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.module, p.action;

-- 3. Verify user permissions
SELECT 
    a.email,
    r.name as role,
    COUNT(p.code) as permission_count
FROM accounts a
JOIN account_roles ar ON a.id = ar.account_id
JOIN roles r ON ar.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
GROUP BY a.email, r.name
ORDER BY a.email;

-- 4. Check recent activity
SELECT 
    action,
    description,
    admin_id,
    created_at
FROM activity_logs
ORDER BY created_at DESC
LIMIT 10;
```

### Data Consistency Checks
```sql
-- Verify no duplicate role assignments
SELECT account_id, role_id, COUNT(*)
FROM account_roles
GROUP BY account_id, role_id
HAVING COUNT(*) > 1;

-- Verify all users have at least one role
SELECT a.id, a.email
FROM accounts a
LEFT JOIN account_roles ar ON a.id = ar.account_id
WHERE ar.account_id IS NULL;

-- Verify all permissions are assigned to roles
SELECT p.*
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.permission_id IS NULL;
```

## ⚡ Performance Testing

### Load Testing Script
```bash
#!/bin/bash
# performance_test.sh

echo "=== RBAC API Performance Testing ==="

# Test job listing endpoint (most accessed)
echo "1. Load testing /api/jobs endpoint..."
ab -n 1000 -c 50 -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  http://localhost:8080/api/jobs

# Test authentication endpoint
echo "2. Load testing /api/auth/login endpoint..."
ab -n 500 -c 25 -p login_data.json -T application/json \
  http://localhost:8080/api/auth/login

# Test admin dashboard (complex queries)
echo "3. Load testing /api/admin/dashboard/stats endpoint..."
ab -n 200 -c 10 -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8080/api/admin/dashboard/stats
```

### Database Performance
```sql
-- Check slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE query LIKE '%account%' OR query LIKE '%role%'
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN ('accounts', 'roles', 'permissions', 'account_roles', 'role_permissions')
ORDER BY idx_scan DESC;
```

## 🔧 Troubleshooting

### Common Issues

#### 1. 401 Unauthorized
```bash
# Check token validity
echo $TOKEN | jq -R 'split(".") | .[1] | @base64d | fromjson'

# Check token expiration
echo $TOKEN | jq -R 'split(".") | .[1] | @base64d | fromjson | .exp'

# Verify server time
curl -s http://localhost:8080/actuator/info | jq '.timestamp'
```

#### 2. 403 Forbidden
```bash
# Check user roles
curl -s -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer $TOKEN" | jq '.roles'

# Check required permissions
# Look at @PreAuthorize annotations in controller methods
```

#### 3. Database Connection Issues
```bash
# Check database connectivity
psql -h localhost -U postgres -d iting_job_portal -c "SELECT 1;"

# Check application logs
tail -f logs/application.log | grep -i "database\|connection"

# Verify RBAC data exists
psql -h localhost -U postgres -d iting_job_portal -c "SELECT COUNT(*) FROM roles;"
```

#### 4. Permission Mapping Issues
```sql
-- Verify role-permission mappings exist
SELECT r.name, COUNT(p.code) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
GROUP BY r.name;

-- Check if user has expected permissions
SELECT DISTINCT p.code
FROM accounts a
JOIN account_roles ar ON a.id = ar.account_id
JOIN roles r ON ar.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE a.email = 'admin@iting.com';
```

## 📈 Best Practices

### Testing Strategy
1. **Test Early**: Start testing during development
2. **Test Often**: Automated tests in CI/CD pipeline
3. **Test Edge Cases**: Don't just test happy paths
4. **Test Performance**: Load test critical endpoints
5. **Test Security**: Verify authorization boundaries

### Code Quality
```bash
# Use meaningful test data
# Test with realistic user scenarios
# Verify error messages don't leak sensitive information
# Test with different user combinations
```

### Monitoring
```bash
# Monitor authentication success/failure rates
# Track authorization decisions
# Monitor database query performance
# Set up alerts for suspicious activity
```

### Documentation
- Keep API documentation updated
- Document test scenarios
- Maintain test data scripts
- Record performance benchmarks

## 🏆 Success Criteria

- ✅ All roles can authenticate successfully
- ✅ Each role can access only authorized endpoints
- ✅ Unauthorized access attempts are properly rejected
- ✅ JWT tokens work correctly with proper expiration
- ✅ Database RBAC data is consistent
- ✅ Performance meets requirements (<200ms for most endpoints)
- ✅ Error handling is appropriate and secure
- ✅ Logging provides adequate audit trail

## 📞 Support

For issues with RBAC testing:

1. Check application logs: `logs/application.log`
2. Verify database connectivity and data
3. Validate JWT token format and content
4. Review role-permission mappings
5. Test with different user combinations

---

**Last Updated**: 2026-02-15  
**Version**: 1.0  
**Author**: Senior Backend Team
