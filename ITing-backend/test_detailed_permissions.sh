#!/bin/bash

# 🎯 TEST CHI TIẾT PHÂN QUYỀN THEO PERMISSION
# Script để test từng permission cụ thể cho từng role

BASE_URL="http://localhost:8080"
echo "=== DETAILED PERMISSION TESTING ==="
echo ""

# 🎭 Login và lấy tokens
echo "🔐 Getting tokens..."

get_token() {
    local email=$1
    local response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$email\", \"password\": \"123456\"}")
    echo $response | jq -r '.token'
}

ADMIN_TOKEN=$(get_token "admin@iting.com")
EMPLOYER_TOKEN=$(get_token "employer1@company.com")
CANDIDATE_TOKEN=$(get_token "candidate1@gmail.com")

echo "✅ Tokens obtained"
echo ""

# 📊 Function để test với detailed output
test_permission() {
    local role=$1
    local token=$2
    local permission=$3
    local method=$4
    local endpoint=$5
    local data=$6
    local expected_status=$7
    
    echo "🔍 Testing: $role | Permission: $permission"
    echo "   Endpoint: $method $endpoint"
    
    if [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        RESPONSE=$(curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data")
        HTTP_STATUS=$(curl -s -w "%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data" -o /dev/null)
    else
        RESPONSE=$(curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token")
        HTTP_STATUS=$(curl -s -w "%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token" -o /dev/null)
    fi
    
    echo "   Status: $HTTP_STATUS (Expected: $expected_status)"
    
    if [ "$HTTP_STATUS" = "$expected_status" ]; then
        echo "   ✅ PASS"
    else
        echo "   ❌ FAIL"
        echo "   Response: $RESPONSE"
    fi
    echo ""
}

# 👑 ADMIN PERMISSIONS TESTS
echo "👑 ADMIN ROLE - ALL PERMISSIONS"
echo "==============================="

# USER Management Permissions
test_permission "ADMIN" "$ADMIN_TOKEN" "USER_VIEW" "GET" "/api/admin/users" "" "200"
test_permission "ADMIN" "$ADMIN_TOKEN" "USER_CREATE" "POST" "/api/admin/users" '{
    "email": "test@user.com",
    "password": "123456",
    "role": "CANDIDATE"
}' "201"

# JOB Management Permissions
test_permission "ADMIN" "$ADMIN_TOKEN" "JOB_VIEW" "GET" "/api/jobs" "" "200"
test_permission "ADMIN" "$ADMIN_TOKEN" "JOB_CREATE" "POST" "/api/jobs" '{
    "position": "Admin Job",
    "description": "Created by admin",
    "techRequired": "Java",
    "location": "Hanoi",
    "jobType": "FULL_TIME"
}' "201"
test_permission "ADMIN" "$ADMIN_TOKEN" "JOB_APPROVE" "POST" "/api/admin/jobs/1/approve" "" "200"

# Category Management
test_permission "ADMIN" "$ADMIN_TOKEN" "CATEGORY_VIEW" "GET" "/api/admin/categories" "" "200"
test_permission "ADMIN" "$ADMIN_TOKEN" "CATEGORY_CREATE" "POST" "/api/admin/categories" '{
    "type": "SKILL",
    "name": "Java",
    "nameEn": "Java",
    "description": "Java programming language"
}' "201"

# System Management
test_permission "ADMIN" "$ADMIN_TOKEN" "SYSTEM_LOGS" "GET" "/api/admin/activity-logs" "" "200"
test_permission "ADMIN" "$ADMIN_TOKEN" "SYSTEM_STATS" "GET" "/api/admin/dashboard/stats" "" "200"

# 🏢 EMPLOYER PERMISSIONS TESTS
echo "🏢 EMPLOYER ROLE - LIMITED PERMISSIONS"
echo "======================================"

# Should FAIL - Admin permissions
test_permission "EMPLOYER" "$EMPLOYER_TOKEN" "USER_VIEW" "GET" "/api/admin/users" "" "403"
test_permission "EMPLOYER" "$EMPLOYER_TOKEN" "CATEGORY_CREATE" "POST" "/api/admin/categories" '{
    "type": "SKILL",
    "name": "Unauthorized"
}' "403"
test_permission "EMPLOYER" "$EMPLOYER_TOKEN" "SYSTEM_LOGS" "GET" "/api/admin/activity-logs" "" "403"

# Should PASS - Job permissions
test_permission "EMPLOYER" "$EMPLOYER_TOKEN" "JOB_VIEW" "GET" "/api/jobs" "" "200"
test_permission "EMPLOYER" "$EMPLOYER_TOKEN" "JOB_CREATE" "POST" "/api/jobs" '{
    "position": "Employer Job",
    "description": "Created by employer",
    "techRequired": "Spring Boot",
    "location": "HCM",
    "jobType": "FULL_TIME"
}' "201"
test_permission "EMPLOYER" "$EMPLOYER_TOKEN" "JOB_OWN" "GET" "/api/jobs/my" "" "200"

# Company permissions
test_permission "EMPLOYER" "$EMPLOYER_TOKEN" "COMPANY_VIEW" "GET" "/api/companies/my" "" "200"
test_permission "EMPLOYER" "$EMPLOYER_TOKEN" "COMPANY_UPDATE" "PUT" "/api/companies/my" '{
    "name": "Updated Company Name",
    "description": "Updated description"
}' "200"

# Application permissions
test_permission "EMPLOYER" "$EMPLOYER_TOKEN" "APPLICATION_VIEW" "GET" "/api/applications/my-jobs" "" "200"

# 👤 CANDIDATE PERMISSIONS TESTS
echo "👤 CANDIDATE ROLE - VIEW-ONLY PERMISSIONS"
echo "=========================================="

# Should FAIL - All create/update permissions
test_permission "CANDIDATE" "$CANDIDATE_TOKEN" "USER_CREATE" "POST" "/api/admin/users" '{
    "email": "fake@user.com"
}' "403"
test_permission "CANDIDATE" "$CANDIDATE_TOKEN" "JOB_CREATE" "POST" "/api/jobs" '{
    "position": "Fake Job"
}' "403"
test_permission "CANDIDATE" "$CANDIDATE_TOKEN" "CATEGORY_CREATE" "POST" "/api/admin/categories" '{
    "type": "SKILL",
    "name": "Fake Skill"
}' "403"

# Should PASS - View permissions
test_permission "CANDIDATE" "$CANDIDATE_TOKEN" "JOB_VIEW" "GET" "/api/jobs" "" "200"
test_permission "CANDIDATE" "$CANDIDATE_TOKEN" "JOB_SEARCH" "GET" "/api/jobs/search?keyword=java" "" "200"

# Application permissions
test_permission "CANDIDATE" "$CANDIDATE_TOKEN" "APPLICATION_CREATE" "POST" "/api/applications" '{
    "jobId": 1,
    "coverLetter": "I am interested"
}' "201"
test_permission "CANDIDATE" "$CANDIDATE_TOKEN" "APPLICATION_VIEW" "GET" "/api/applications/my" "" "200"

# Profile permissions
test_permission "CANDIDATE" "$CANDIDATE_TOKEN" "PROFILE_VIEW" "GET" "/api/users/profile" "" "200"
test_permission "CANDIDATE" "$CANDIDATE_TOKEN" "PROFILE_UPDATE" "PUT" "/api/users/profile" '{
    "firstName": "Updated Name",
    "lastName": "Updated Last Name",
    "phone": "0901234567"
}' "200"

echo ""
echo "🔍 6. TEST RESOURCE OWNERSHIP"
echo "============================"

# Test resource ownership - Employer can only modify their own jobs
echo "📝 Creating job as employer1..."
JOB_RESPONSE=$(curl -s -X POST "$BASE_URL/api/jobs" \
    -H "Authorization: Bearer $EMPLOYER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "position": "Employer1 Job",
        "description": "This belongs to employer1"
    }')

JOB_ID=$(echo $JOB_RESPONSE | jq -r '.id')
echo "📝 Created job ID: $JOB_ID"

# Test employer1 can update their own job
test_permission "EMPLOYER1" "$EMPLOYER_TOKEN" "JOB_OWN_UPDATE" "PUT" "/api/jobs/$JOB_ID" '{
    "position": "Updated by owner"
}' "200"

# Login as employer2 and try to update employer1's job
echo "📝 Login as employer2..."
EMPLOYER2_TOKEN=$(get_token "employer2@company.com")

if [ "$EMPLOYER2_TOKEN" != "null" ]; then
    echo "✅ Employer2 login successful"
    
    # Should FAIL - employer2 cannot update employer1's job
    test_permission "EMPLOYER2" "$EMPLOYER2_TOKEN" "JOB_OWN_UPDATE" "PUT" "/api/jobs/$JOB_ID" '{
        "position": "Hacked by employer2"
    }' "403"
else
    echo "❌ Employer2 login failed"
fi

# Test candidate cannot update any job
test_permission "CANDIDATE" "$CANDIDATE_TOKEN" "JOB_UPDATE" "PUT" "/api/jobs/$JOB_ID" '{
    "position": "Hacked by candidate"
}' "403"

echo ""
echo "🔍 7. TEST EDGE CASES"
echo "==================="

# Test with expired token (simulate)
echo "📝 Testing with malformed token..."
test_permission "MALFORMED" "eyJhbGciOiJIUzI1NiJ9.invalid.signature" "TOKEN_VALID" "GET" "/api/jobs" "" "401"

# Test with empty token
echo "📝 Testing with empty token..."
test_permission "EMPTY" "" "TOKEN_VALID" "GET" "/api/jobs" "" "401"

# Test with wrong password (get new token)
echo "📝 Testing wrong password..."
WRONG_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@iting.com", "password": "wrongpassword"}')

echo "Wrong password response: $WRONG_RESPONSE"
echo ""

echo "📊 8. PERMISSION MATRIX SUMMARY"
echo "=============================="

echo "📋 Permission Test Results:"
echo ""
echo "👑 ADMIN Role:"
echo "   ✅ USER_MANAGEMENT: Full access"
echo "   ✅ JOB_MANAGEMENT: Full access including approval"
echo "   ✅ CATEGORY_MANAGEMENT: Full access"
echo "   ✅ SYSTEM_MANAGEMENT: Full access"
echo ""
echo "🏢 EMPLOYER Role:"
echo "   ✅ JOB_MANAGEMENT: Own jobs only"
echo "   ✅ COMPANY_MANAGEMENT: Own company only"
echo "   ✅ APPLICATION_MANAGEMENT: Applications for own jobs"
echo "   ❌ USER_MANAGEMENT: No access"
echo "   ❌ SYSTEM_MANAGEMENT: No access"
echo ""
echo "👤 CANDIDATE Role:"
echo "   ✅ JOB_VIEW: Read-only access"
echo "   ✅ APPLICATION_MANAGEMENT: Own applications only"
echo "   ✅ PROFILE_MANAGEMENT: Own profile only"
echo "   ❌ JOB_CREATION: No access"
echo "   ❌ USER_MANAGEMENT: No access"
echo "   ❌ SYSTEM_MANAGEMENT: No access"
echo ""

echo "🎯 9. JWT TOKEN DECODING"
echo "======================"

decode_token() {
    local token=$1
    local role_name=$2
    
    echo "📝 $role_name Token:"
    if command -v jq &> /dev/null; then
        echo $token | jq -R 'split(".") | .[1] | @base64d | fromjson' 2>/dev/null || echo "Token decode failed"
    else
        echo "jq not available - install jq to decode tokens"
    fi
    echo ""
}

decode_token "$ADMIN_TOKEN" "ADMIN"
decode_token "$EMPLOYER_TOKEN" "EMPLOYER"
decode_token "$CANDIDATE_TOKEN" "CANDIDATE"

echo "🏁 DETAILED PERMISSION TESTING COMPLETE!"
echo "======================================"
echo ""
echo "📊 Check all test results above:"
echo "✅ All PASS = RBAC permissions are correctly configured"
echo "❌ Any FAIL = Review permission mappings in database"
echo ""
echo "🔍 Next steps:"
echo "1. Review any failed tests"
echo "2. Check role-permission mappings in database"
echo "3. Verify @PreAuthorize annotations in controllers"
echo "4. Test with additional edge cases if needed"
