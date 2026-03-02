#!/bin/bash

# 🧪 TEST PHÂN QUYỀN ROLE KHÁC NHAU
# Script để test phân quyền cho ADMIN, EMPLOYER, CANDIDATE

BASE_URL="http://localhost:8080"
echo "=== TEST PHÂN QUYỀN ROLE ==="
echo "Base URL: $BASE_URL"
echo ""

# 🎭 1. LOGIN LẤY TOKEN CHO TỪNG ROLE
echo "🔐 1. Đăng nhập và lấy JWT tokens..."

# Admin Login
echo "📝 Admin login..."
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@iting.com", "password": "123456"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.token')
ADMIN_USER_ID=$(echo $ADMIN_RESPONSE | jq -r '.userId')

if [ "$ADMIN_TOKEN" != "null" ]; then
    echo "✅ Admin login successful - User ID: $ADMIN_USER_ID"
else
    echo "❌ Admin login failed"
    exit 1
fi

# Employer Login
echo "📝 Employer login..."
EMPLOYER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "employer1@company.com", "password": "123456"}')

EMPLOYER_TOKEN=$(echo $EMPLOYER_RESPONSE | jq -r '.token')
EMPLOYER_USER_ID=$(echo $EMPLOYER_RESPONSE | jq -r '.userId')

if [ "$EMPLOYER_TOKEN" != "null" ]; then
    echo "✅ Employer login successful - User ID: $EMPLOYER_USER_ID"
else
    echo "❌ Employer login failed"
    exit 1
fi

# Candidate Login
echo "📝 Candidate login..."
CANDIDATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "candidate1@gmail.com", "password": "123456"}')

CANDIDATE_TOKEN=$(echo $CANDIDATE_RESPONSE | jq -r '.token')
CANDIDATE_USER_ID=$(echo $CANDIDATE_RESPONSE | jq -r '.userId')

if [ "$CANDIDATE_TOKEN" != "null" ]; then
    echo "✅ Candidate login successful - User ID: $CANDIDATE_USER_ID"
else
    echo "❌ Candidate login failed"
    exit 1
fi

echo ""
echo "🎯 2. TEST PHÂN QUYỀN THEO TỪNG ROLE"
echo "=================================="

# 📊 Function để test endpoint
test_endpoint() {
    local role=$1
    local token=$2
    local method=$3
    local endpoint=$4
    local data=$5
    local expected_status=$6
    
    echo "🔍 Testing: $role | $method $endpoint"
    
    if [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        HTTP_STATUS=$(curl -s -w "%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data" -o /dev/null)
    else
        HTTP_STATUS=$(curl -s -w "%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token" -o /dev/null)
    fi
    
    if [ "$HTTP_STATUS" = "$expected_status" ]; then
        echo "✅ PASS - Status: $HTTP_STATUS (Expected: $expected_status)"
    else
        echo "❌ FAIL - Status: $HTTP_STATUS (Expected: $expected_status)"
    fi
}

# 👑 ADMIN ROLE TESTS - Full Access
echo ""
echo "👑 ADMIN ROLE - Full Access Tests"
echo "--------------------------------"

# Admin should have access to everything
test_endpoint "ADMIN" "$ADMIN_TOKEN" "GET" "/api/admin/users" "" "200"
test_endpoint "ADMIN" "$ADMIN_TOKEN" "GET" "/api/admin/dashboard/stats" "" "200"
test_endpoint "ADMIN" "$ADMIN_TOKEN" "GET" "/api/admin/categories" "" "200"
test_endpoint "ADMIN" "$ADMIN_TOKEN" "POST" "/api/admin/categories" '{
    "type": "INDUSTRY",
    "name": "Test Category",
    "nameEn": "Test Category",
    "description": "Test description"
}' "201"
test_endpoint "ADMIN" "$ADMIN_TOKEN" "GET" "/api/jobs" "" "200"
test_endpoint "ADMIN" "$ADMIN_TOKEN" "POST" "/api/jobs" '{
    "position": "Admin Test Job",
    "description": "Job created by admin",
    "requirements": "Test requirements",
    "techRequired": "Java",
    "location": "Hanoi",
    "jobType": "FULL_TIME",
    "experienceLevel": "MID"
}' "201"
test_endpoint "ADMIN" "$ADMIN_TOKEN" "GET" "/api/applications/my" "" "200"

# 🏢 EMPLOYER ROLE TESTS - Limited Access
echo ""
echo "🏢 EMPLOYER ROLE - Limited Access Tests"
echo "---------------------------------------"

# Employer should NOT access admin endpoints
test_endpoint "EMPLOYER" "$EMPLOYER_TOKEN" "GET" "/api/admin/users" "" "403"
test_endpoint "EMPLOYER" "$EMPLOYER_TOKEN" "GET" "/api/admin/dashboard/stats" "" "403"
test_endpoint "EMPLOYER" "$EMPLOYER_TOKEN" "POST" "/api/admin/categories" '{
    "type": "INDUSTRY",
    "name": "Unauthorized Category"
}' "403"

# Employer SHOULD access job management
test_endpoint "EMPLOYER" "$EMPLOYER_TOKEN" "GET" "/api/jobs" "" "200"
test_endpoint "EMPLOYER" "$EMPLOYER_TOKEN" "GET" "/api/jobs/my" "" "200"
test_endpoint "EMPLOYER" "$EMPLOYER_TOKEN" "POST" "/api/jobs" '{
    "position": "Employer Test Job",
    "description": "Job created by employer",
    "requirements": "Java, Spring Boot",
    "techRequired": "Java, Spring Boot",
    "location": "Ho Chi Minh",
    "jobType": "FULL_TIME",
    "experienceLevel": "SENIOR",
    "minSalary": 25000000,
    "maxSalary": 35000000
}' "201"

# Employer SHOULD access applications for their jobs
test_endpoint "EMPLOYER" "$EMPLOYER_TOKEN" "GET" "/api/applications/my-jobs" "" "200"

# 👤 CANDIDATE ROLE TESTS - Read-only Access
echo ""
echo "👤 CANDIDATE ROLE - Read-only Access Tests"
echo "-----------------------------------------"

# Candidate should NOT access admin endpoints
test_endpoint "CANDIDATE" "$CANDIDATE_TOKEN" "GET" "/api/admin/users" "" "403"
test_endpoint "CANDIDATE" "$CANDIDATE_TOKEN" "GET" "/api/admin/dashboard/stats" "" "403"
test_endpoint "CANDIDATE" "$CANDIDATE_TOKEN" "POST" "/api/admin/categories" '{
    "type": "INDUSTRY",
    "name": "Unauthorized Category"
}' "403"

# Candidate should NOT create jobs
test_endpoint "CANDIDATE" "$CANDIDATE_TOKEN" "POST" "/api/jobs" '{
    "position": "Unauthorized Job",
    "description": "This should fail"
}' "403"

# Candidate SHOULD access job viewing
test_endpoint "CANDIDATE" "$CANDIDATE_TOKEN" "GET" "/api/jobs" "" "200"
test_endpoint "CANDIDATE" "$CANDIDATE_TOKEN" "GET" "/api/jobs/1" "" "200"

# Candidate SHOULD apply for jobs
test_endpoint "CANDIDATE" "$CANDIDATE_TOKEN" "POST" "/api/applications" '{
    "jobId": 1,
    "coverLetter": "I am interested in this position",
    "expectedSalary": 30000000
}' "201"

# Candidate SHOULD access their applications
test_endpoint "CANDIDATE" "$CANDIDATE_TOKEN" "GET" "/api/applications/my" "" "200"

echo ""
echo "🚫 3. TEST CROSS-ROLE ACCESS VIOLATIONS"
echo "======================================"

# Test employer trying to access other employer's jobs
echo "🔍 Testing cross-role access violations..."

# Create a job as employer1
JOB_RESPONSE=$(curl -s -X POST "$BASE_URL/api/jobs" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "position": "Protected Job",
    "description": "This job should only be editable by owner"
  }')

JOB_ID=$(echo $JOB_RESPONSE | jq -r '.id')
echo "📝 Created job with ID: $JOB_ID"

# Try to update with different employer (employer2)
echo "📝 Login as employer2..."
EMPLOYER2_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "employer2@company.com", "password": "123456"}')

EMPLOYER2_TOKEN=$(echo $EMPLOYER2_RESPONSE | jq -r '.token')

if [ "$EMPLOYER2_TOKEN" != "null" ]; then
    echo "✅ Employer2 login successful"
    
    # Try to update job created by employer1
    test_endpoint "EMPLOYER2" "$EMPLOYER2_TOKEN" "PUT" "/api/jobs/$JOB_ID" '{
        "position": "Hacked by Employer2"
    }' "403"  # Should fail with 403
    
    # Try to delete job created by employer1
    test_endpoint "EMPLOYER2" "$EMPLOYER2_TOKEN" "DELETE" "/api/jobs/$JOB_ID" "" "403"  # Should fail with 403
else
    echo "❌ Employer2 login failed"
fi

# Test candidate trying to update job
test_endpoint "CANDIDATE" "$CANDIDATE_TOKEN" "PUT" "/api/jobs/$JOB_ID" '{
    "position": "Hacked by Candidate"
}' "403"  # Should fail with 403

echo ""
echo "🔍 4. TEST UNAUTHORIZED ACCESS"
echo "============================="

# Test without token
echo "🔍 Testing without authentication..."
test_endpoint "NO_TOKEN" "" "GET" "/api/admin/users" "" "401"
test_endpoint "NO_TOKEN" "" "GET" "/api/jobs" "" "401"

# Test with invalid token
echo "🔍 Testing with invalid token..."
test_endpoint "INVALID_TOKEN" "invalid_token" "GET" "/api/admin/users" "" "401"
test_endpoint "INVALID_TOKEN" "invalid_token" "GET" "/api/jobs" "" "401"

echo ""
echo "📊 5. SUMMARY REPORT"
echo "==================="

echo "✅ Tests completed!"
echo ""
echo "📋 Expected Results:"
echo "👑 ADMIN: Full access to all endpoints (200 OK)"
echo "🏢 EMPLOYER: Job management only, no admin access (200/403)"
echo "👤 CANDIDATE: Read-only access, no create/update (200/403)"
echo "🚫 Cross-role access: Should be blocked (403)"
echo "🔓 No authentication: Should be blocked (401)"
echo ""
echo "🔍 Check the results above for any FAIL status"
echo "📝 All PASS = RBAC is working correctly!"
echo "❌ Any FAIL = RBAC configuration needs review"

echo ""
echo "🎯 6. JWT TOKEN ANALYSIS"
echo "======================"

echo "📝 Admin Token Info:"
echo $ADMIN_TOKEN | jq -R 'split(".") | .[1] | @base64d | fromjson' 2>/dev/null || echo "Token decode failed"

echo ""
echo "📝 Employer Token Info:"
echo $EMPLOYER_TOKEN | jq -R 'split(".") | .[1] | @base64d | fromjson' 2>/dev/null || echo "Token decode failed"

echo ""
echo "📝 Candidate Token Info:"
echo $CANDIDATE_TOKEN | jq -R 'split(".") | .[1] | @base64d | fromjson' 2>/dev/null || echo "Token decode failed"

echo ""
echo "🏁 TEST COMPLETE!"
echo "================="
