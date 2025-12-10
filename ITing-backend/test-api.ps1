# ========================================
# ITING JOB PORTAL - API TEST SCRIPT
# ========================================

$BASE_URL = "http://localhost:8080"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ITING JOB PORTAL - API TEST" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ========================================
# 1. TEST LOGIN
# ========================================
Write-Host "1. TEST LOGIN" -ForegroundColor Yellow
Write-Host "----------------------------------------"

# Login as Candidate
Write-Host "   Login as CANDIDATE (ungvien1@gmail.com)..." -ForegroundColor Gray
try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"ungvien1@gmail.com","password":"123456"}'
    $candidateToken = $loginResponse.token
    Write-Host "   [OK] Login successful! UserID: $($loginResponse.userId), Role: $($loginResponse.role)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Login failed: $_" -ForegroundColor Red
    exit 1
}

# Login as Employer
Write-Host "   Login as EMPLOYER (hr@fpt.com)..." -ForegroundColor Gray
try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"hr@fpt.com","password":"123456"}'
    $employerToken = $loginResponse.token
    Write-Host "   [OK] Login successful! UserID: $($loginResponse.userId), Role: $($loginResponse.role)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Login failed: $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# 2. TEST REGISTER
# ========================================
Write-Host "2. TEST REGISTER" -ForegroundColor Yellow
Write-Host "----------------------------------------"

$randomEmail = "testuser_$(Get-Random)@gmail.com"
Write-Host "   Registering new user: $randomEmail..." -ForegroundColor Gray
try {
    $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/register" -Method POST -ContentType "application/json" -Body "{`"email`":`"$randomEmail`",`"password`":`"123456`",`"role`":`"CANDIDATE`"}"
    Write-Host "   [OK] Registration successful! UserID: $($registerResponse.id)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Registration failed: $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# 3. TEST USER PROFILE APIs
# ========================================
Write-Host "3. TEST USER PROFILE APIs" -ForegroundColor Yellow
Write-Host "----------------------------------------"

$headers = @{Authorization = "Bearer $candidateToken"}

# Get Skills
Write-Host "   GET /api/user/profile/skills..." -ForegroundColor Gray
try {
    $skills = Invoke-RestMethod -Uri "$BASE_URL/api/user/profile/skills" -Method GET -Headers $headers
    Write-Host "   [OK] Found $($skills.Count) skills" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] $_" -ForegroundColor Red
}

# Get Educations
Write-Host "   GET /api/user/profile/educations..." -ForegroundColor Gray
try {
    $educations = Invoke-RestMethod -Uri "$BASE_URL/api/user/profile/educations" -Method GET -Headers $headers
    Write-Host "   [OK] Found $($educations.Count) educations" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] $_" -ForegroundColor Red
}

# Get Social Links
Write-Host "   GET /api/user/profile/social..." -ForegroundColor Gray
try {
    $socials = Invoke-RestMethod -Uri "$BASE_URL/api/user/profile/social" -Method GET -Headers $headers
    Write-Host "   [OK] Found $($socials.Count) social links" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] $_" -ForegroundColor Red
}

# Get Portfolio
Write-Host "   GET /api/user/profile/portfolio..." -ForegroundColor Gray
try {
    $portfolio = Invoke-RestMethod -Uri "$BASE_URL/api/user/profile/portfolio" -Method GET -Headers $headers
    Write-Host "   [OK] Found $($portfolio.Count) portfolio items" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] $_" -ForegroundColor Red
}

# Get CVs
Write-Host "   GET /api/user/profile/cv..." -ForegroundColor Gray
try {
    $cvs = Invoke-RestMethod -Uri "$BASE_URL/api/user/profile/cv" -Method GET -Headers $headers
    Write-Host "   [OK] Found $($cvs.Count) CVs" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# 4. TEST ADD SKILL
# ========================================
Write-Host "4. TEST ADD NEW SKILL" -ForegroundColor Yellow
Write-Host "----------------------------------------"

Write-Host "   POST /api/user/profile/skills (Python - Intermediate)..." -ForegroundColor Gray
try {
    $newSkill = Invoke-RestMethod -Uri "$BASE_URL/api/user/profile/skills" -Method POST -ContentType "application/json" -Headers $headers -Body '{"skill":"Python","level":"Intermediate"}'
    Write-Host "   [OK] Skill added! ID: $($newSkill.id)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# 5. TEST ADD EDUCATION
# ========================================
Write-Host "5. TEST ADD NEW EDUCATION" -ForegroundColor Yellow
Write-Host "----------------------------------------"

Write-Host "   POST /api/user/profile/education..." -ForegroundColor Gray
try {
    $newEducation = Invoke-RestMethod -Uri "$BASE_URL/api/user/profile/education" -Method POST -ContentType "application/json" -Headers $headers -Body '{"school":"MIT Online","degree":"Certificate in AI","startDate":"2024-01-01","endDate":"2024-06-30","description":"Completed AI course"}'
    Write-Host "   [OK] Education added! ID: $($newEducation.id)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# 6. TEST ADD CERTIFICATE
# ========================================
Write-Host "6. TEST ADD NEW CERTIFICATE" -ForegroundColor Yellow
Write-Host "----------------------------------------"

Write-Host "   POST /api/user/profile/certificates..." -ForegroundColor Gray
try {
    $newCert = Invoke-RestMethod -Uri "$BASE_URL/api/user/profile/certificates" -Method POST -ContentType "application/json" -Headers $headers -Body '{"name":"Docker Certified Associate","organization":"Docker Inc","date":"2024-12-01"}'
    Write-Host "   [OK] Certificate added! ID: $($newCert.id)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# 7. TEST ADD EXPERIENCE
# ========================================
Write-Host "7. TEST ADD NEW EXPERIENCE" -ForegroundColor Yellow
Write-Host "----------------------------------------"

Write-Host "   POST /api/user/profile/experience..." -ForegroundColor Gray
try {
    $newExp = Invoke-RestMethod -Uri "$BASE_URL/api/user/profile/experience" -Method POST -ContentType "application/json" -Headers $headers -Body '{"company":"Google","role":"Software Engineer Intern","startDate":"2024-06-01","endDate":"2024-08-31","description":"Summer internship at Google"}'
    Write-Host "   [OK] Experience added! ID: $($newExp.id)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# 8. TEST ADD SOCIAL LINK
# ========================================
Write-Host "8. TEST ADD NEW SOCIAL LINK" -ForegroundColor Yellow
Write-Host "----------------------------------------"

Write-Host "   POST /api/user/profile/social..." -ForegroundColor Gray
try {
    $newSocial = Invoke-RestMethod -Uri "$BASE_URL/api/user/profile/social" -Method POST -ContentType "application/json" -Headers $headers -Body '{"platform":"Twitter","url":"https://twitter.com/testuser"}'
    Write-Host "   [OK] Social link added! ID: $($newSocial.id)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# 9. TEST ADD PORTFOLIO LINK
# ========================================
Write-Host "9. TEST ADD PORTFOLIO LINK" -ForegroundColor Yellow
Write-Host "----------------------------------------"

Write-Host "   POST /api/user/profile/portfolio/link..." -ForegroundColor Gray
try {
    $newPortfolio = Invoke-RestMethod -Uri "$BASE_URL/api/user/profile/portfolio/link" -Method POST -ContentType "application/json" -Headers $headers -Body '{"url":"https://github.com/testuser/awesome-project","description":"My awesome open source project"}'
    Write-Host "   [OK] Portfolio link added! ID: $($newPortfolio.id)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# 10. TEST COMPANY APIs
# ========================================
Write-Host "10. TEST COMPANY APIs" -ForegroundColor Yellow
Write-Host "----------------------------------------"

# Get Company Info
Write-Host "   GET /api/companies/4 (FPT Software)..." -ForegroundColor Gray
try {
    $company = Invoke-RestMethod -Uri "$BASE_URL/api/companies/4" -Method GET
    Write-Host "   [OK] Company: $($company.name), Industry: $($company.industry)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] $_" -ForegroundColor Red
}

# Get VNG
Write-Host "   GET /api/companies/5 (VNG)..." -ForegroundColor Gray
try {
    $company = Invoke-RestMethod -Uri "$BASE_URL/api/companies/5" -Method GET
    Write-Host "   [OK] Company: $($company.name), Industry: $($company.industry)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# SUMMARY
# ========================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST COMPLETED!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor Magenta
Write-Host ""

