# 🔐 RBAC VALIDATION RULES & BUSINESS LOGIC

## 📋 MỤC LỤC

- [Validation Rules](#validation-rules)
- [Business Logic Rules](#business-logic-rules)
- [Security Rules](#security-rules)
- [Data Access Rules](#data-access-rules)
- [Permission Checks](#permission-checks)
- [Testing Scenarios](#testing-scenarios)

---

## 🛡️ VALIDATION RULES

### **1. Authentication Validation**
```java
// Login validation
public class LoginValidation {
    // ✅ Required fields
    - email: required, valid email format
    - password: required, min 6 characters
    
    // ✅ Account status check
    - Account must be ACTIVE
    - Account must not be BANNED
    - Account must not be DEACTIVATED
    
    // ✅ Password verification
    - Use BCrypt for password comparison
    - Track failed login attempts
    - Lock account after 5 failed attempts
}

// Token validation
public class TokenValidation {
    // ✅ JWT token checks
    - Token must not be expired
    - Token signature must be valid
    - Token issuer must match system
    - Token must contain valid user ID
    
    // ✅ Session management
    - Track active tokens
    - Invalidate old tokens on password change
    - Support token refresh
}
```

### **2. User Management Validation**
```java
// User creation validation
public class UserCreationValidation {
    // ✅ Required fields
    - email: required, unique, valid format
    - password: required, min 8 chars, contains uppercase, lowercase, number, special
    - firstName: required, min 2 chars, max 50 chars
    - lastName: required, min 2 chars, max 50 chars
    - phone: optional, valid phone format if provided
    
    // ✅ Business rules
    - Email must be unique across all accounts
    - Password must be hashed before storage
    - Default role assignment based on registration type
    - Account status defaults to PENDING for email verification
}

// Profile update validation
public class ProfileUpdateValidation {
    // ✅ Own profile updates
    - User can only update their own profile
    - Email changes require email verification
    - Password changes require current password confirmation
    
    // ✅ Admin profile updates
    - Admin can update any user profile
    - Admin can change user roles
    - Admin can change user status
}
```

### **3. Company Validation**
```java
// Company creation validation
public class CompanyValidation {
    // ✅ Required fields
    - name: required, unique, min 2 chars, max 100 chars
    - description: required, min 10 chars, max 1000 chars
    - website: optional, valid URL if provided
    - address: required, min 10 chars, max 200 chars
    - size: required, valid CompanySize enum
    - industry: required, valid industry list
    
    // ✅ Business rules
    - Only EMPLOYER role can create company
    - Each employer can only have one company
    - Company must be verified before posting jobs
    - Company logo must be valid image format and size
}

// Company update validation
public class CompanyUpdateValidation {
    // ✅ Ownership validation
    - Only company owner can update
    - Admin can update any company
    
    // ✅ Field validation
    - Name changes require admin approval
    - Website must be accessible
    - Logo upload size limit: 2MB
    - Logo formats: JPG, PNG, SVG
}
```

### **4. Job Validation**
```java
// Job creation validation
public class JobCreationValidation {
    // ✅ Required fields
    - position: required, min 3 chars, max 100 chars
    - description: required, min 50 chars, max 5000 chars
    - requirements: required, min 20 chars, max 2000 chars
    - location: required, min 3 chars, max 100 chars
    - jobType: required, valid JobType enum
    - experienceLevel: required, valid ExperienceLevel enum
    - minSalary: optional, positive number if provided
    - maxSalary: optional, >= minSalary if provided
    - dueDate: required, must be future date
    
    // ✅ Business rules
    - Only EMPLOYER with verified company can post jobs
    - Company must be ACTIVE status
    - Due date must be within 90 days
    - Salary ranges must be reasonable for position
    - Job content must not contain inappropriate content
}

// Job update validation
public class JobUpdateValidation {
    // ✅ Ownership validation
    - Only job owner can update
    - Admin can update any job
    
    // ✅ Status validation
    - Jobs with applications cannot be deleted
    - Closed jobs cannot be reopened by owner
    - Only admin can approve/reject jobs
    - Published jobs cannot change critical fields
}
```

### **5. Application Validation**
```java
// Application creation validation
public class ApplicationValidation {
    // ✅ Required fields
    - jobId: required, must exist and be ACTIVE
    - coverLetter: required, min 20 chars, max 2000 chars
    - expectedSalary: optional, reasonable range
    - resumeFile: required, valid format, max 5MB
    
    // ✅ Business rules
    - Only CANDIDATE role can apply
    - Candidate can only apply once per job
    - Candidate must have complete profile
    - Job must be accepting applications
    - Resume must be uploaded
    - Application limit: 50 applications per day per candidate
}

// Application status validation
public class ApplicationStatusValidation {
    // ✅ Status transitions
    - PENDING → REVIEWING (Employer)
    - REVIEWING → ACCEPTED/REJECTED (Employer)
    - PENDING/REVIEWING → WITHDRAWN (Candidate)
    - ACCEPTED → SCHEDULE_INTERVIEW (Employer)
    
    // ✅ Business rules
    - Only job owner can change status
    - Candidate can only withdraw their own applications
    - Cannot change status of withdrawn applications
    - Status changes must be logged
}
```

---

## 🏢 BUSINESS LOGIC RULES

### **1. Role Assignment Rules**
```java
public class RoleAssignmentRules {
    // ✅ Admin role assignment
    - Only existing ADMIN can assign ADMIN role
    - ADMIN role requires email verification
    - ADMIN role requires background check
    - Maximum 5 ADMIN accounts per system
    
    // ✅ Employer role assignment
    - EMPLOYER role requires company verification
    - EMPLOYER role requires business license
    - Each company can have multiple EMPLOYER accounts
    - EMPLOYER accounts must be linked to company
    
    // ✅ Candidate role assignment
    - CANDIDATE role is default for new registrations
    - CANDIDATE role requires basic profile completion
    - CANDIDATE role requires resume upload
    - No limit on CANDIDATE accounts
}
```

### **2. Resource Ownership Rules**
```java
public class OwnershipRules {
    // ✅ Job ownership
    - Jobs belong to company, not individual employer
    - All EMPLOYER accounts in company can manage jobs
    - Company deletion removes all associated jobs
    - Job applications remain after job closure
    
    // ✅ Application ownership
    - Applications belong to candidate
    - Employers can view applications for their jobs
    - Candidates can only see their own applications
    - Admin can view all applications
    
    // ✅ Company ownership
    - Company belongs to primary employer
    - Multiple employers can be added to company
    - Company transfer requires admin approval
    - Company deletion affects all employers
}
```

### **3. Data Access Rules**
```java
public class DataAccessRules {
    // ✅ Read access
    - Jobs: Public read access for all authenticated users
    - Companies: Public read access for basic info
    - Applications: Restricted to owner and job owner
    - User profiles: Public basic info, private details to owner
    
    // ✅ Write access
    - Jobs: Only company employers
    - Applications: Only candidates (create), employers (status)
    - Companies: Only company employers
    - User profiles: Only owner, admin for all
    
    // ✅ Delete access
    - Jobs: Only employers (if no applications), admin (always)
    - Applications: Only candidates (if pending), admin (always)
    - Companies: Only admin
    - User accounts: Only admin
}
```

---

## 🔒 SECURITY RULES

### **1. Authentication Security**
```java
public class AuthSecurityRules {
    // ✅ Password security
    - Minimum 8 characters
    - Must contain uppercase, lowercase, number, special character
    - Password history: Cannot reuse last 5 passwords
    - Password expiry: 90 days
    - Account lockout: 5 failed attempts, 30 minutes lock
    
    // ✅ Session security
    - JWT token expiry: 24 hours
    - Refresh token expiry: 7 days
    - Max concurrent sessions: 3 per user
    - Session invalidation on password change
    - IP-based session validation
}
```

### **2. Authorization Security**
```java
public class AuthzSecurityRules {
    // ✅ Permission checks
    - Every API endpoint must have permission check
    - Permission checks must be at method level
    - Permission checks must be logged
    - Permission denied responses must be generic
    
    // ✅ Role hierarchy
    - ADMIN > EMPLOYER > CANDIDATE
    - Higher roles inherit lower role permissions
    - Role escalation requires admin approval
    - Role changes must be audited
}
```

### **3. Data Security**
```java
public class DataSecurityRules {
    // ✅ Sensitive data
    - Passwords: Always hashed, never in logs
    - Email addresses: Masked in logs
    - Phone numbers: Masked in logs
    - Resume files: Encrypted at rest
    - Personal data: GDPR compliant
    
    // ✅ Data access
    - SQL injection prevention
    - XSS prevention in user inputs
    - CSRF protection for state-changing operations
    - Rate limiting per user/IP
    - Input validation and sanitization
}
```

---

## 🔍 PERMISSION CHECKS

### **1. Method-Level Security**
```java
// Example permission check implementation
@PreAuthorize("hasPermission(#jobId, 'JOB', 'UPDATE_OWN')")
public Job updateJob(Long jobId, JobUpdateRequest request) {
    // Verify ownership
    Job job = jobRepository.findById(jobId)
        .orElseThrow(() -> new ResourceNotFoundException());
    
    // Check if user owns the job
    if (!job.getCompanyId().equals(getCurrentUserCompanyId())) {
        throw new AccessDeniedException("You can only update your own jobs");
    }
    
    return jobRepository.save(job);
}

// Example with multiple permissions
@PreAuthorize("hasAnyRole('ADMIN') or hasPermission(#companyId, 'COMPANY', 'VIEW_OWN')")
public Company getCompany(Long companyId) {
    return companyRepository.findById(companyId)
        .orElseThrow(() -> new ResourceNotFoundException());
}
```

### **2. Custom Permission Evaluators**
```java
@Component
public class CustomPermissionEvaluator implements PermissionEvaluator {
    
    @Override
    public boolean hasPermission(Authentication authentication, 
                                 Object targetDomainObject, 
                                 Object permission) {
        // Custom permission logic
        if (targetDomainObject instanceof Job) {
            return checkJobPermission(authentication, (Job) targetDomainObject, permission);
        }
        return false;
    }
    
    private boolean checkJobPermission(Authentication auth, Job job, Object permission) {
        String permissionStr = permission.toString();
        User currentUser = (User) auth.getPrincipal();
        
        switch (permissionStr) {
            case "UPDATE_OWN":
                return job.getCompanyId().equals(currentUser.getCompanyId());
            case "VIEW_APPLICANTS_OWN":
                return job.getCompanyId().equals(currentUser.getCompanyId());
            default:
                return false;
        }
    }
}
```

### **3. API Endpoint Security**
```java
@RestController
@RequestMapping("/api/jobs")
public class JobController {
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYER', 'CANDIDATE')")
    public ResponseEntity<Page<JobResponse>> getJobs(
            @RequestParam(required = false) Long companyId,
            Pageable pageable) {
        // Public access for all authenticated users
        return ResponseEntity.ok(jobService.getJobs(companyId, pageable));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<JobResponse> createJob(@Valid @RequestBody CreateJobRequest request) {
        // Only employers can create jobs
        return ResponseEntity.ok(jobService.createJob(request));
    }
    
    @PutMapping("/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER') and @jobSecurity.isOwner(#jobId, authentication.name)")
    public ResponseEntity<JobResponse> updateJob(
            @PathVariable Long jobId, 
            @Valid @RequestBody UpdateJobRequest request) {
        // Only job owners can update
        return ResponseEntity.ok(jobService.updateJob(jobId, request));
    }
    
    @PostMapping("/{jobId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> approveJob(@PathVariable Long jobId) {
        // Only admins can approve jobs
        jobService.approveJob(jobId);
        return ResponseEntity.ok().build();
    }
}
```

---

## 🧪 TESTING SCENARIOS

### **1. Positive Test Cases**
```java
// Test successful operations
@Test
public void testEmployerCanCreateJob() {
    // Given: Employer with verified company
    User employer = createEmployerWithVerifiedCompany();
    
    // When: Create job request
    CreateJobRequest request = createValidJobRequest();
    
    // Then: Job should be created successfully
    ResponseEntity<JobResponse> response = jobController.createJob(request);
    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertNotNull(response.getBody().getId());
}

@Test
public void testCandidateCanApplyToJob() {
    // Given: Candidate and active job
    Candidate candidate = createCandidateWithProfile();
    Job job = createActiveJob();
    
    // When: Apply to job
    ApplicationRequest request = createValidApplicationRequest();
    
    // Then: Application should be created successfully
    ResponseEntity<ApplicationResponse> response = 
        applicationController.applyToJob(job.getId(), request);
    assertEquals(HttpStatus.CREATED, response.getStatusCode());
}
```

### **2. Negative Test Cases**
```java
// Test permission violations
@Test
public void testCandidateCannotCreateJob() {
    // Given: Candidate user
    User candidate = createCandidate();
    
    // When: Try to create job
    CreateJobRequest request = createValidJobRequest();
    
    // Then: Should be forbidden
    assertThrows(AccessDeniedException.class, 
        () -> jobController.createJob(request));
}

@Test
public void testEmployerCannotUpdateOtherCompanyJob() {
    // Given: Employer and other company's job
    User employer = createEmployer();
    Job otherJob = createJobForOtherCompany();
    
    // When: Try to update other job
    UpdateJobRequest request = createValidUpdateRequest();
    
    // Then: Should be forbidden
    assertThrows(AccessDeniedException.class, 
        () -> jobController.updateJob(otherJob.getId(), request));
}
```

### **3. Edge Cases**
```java
// Test boundary conditions
@Test
public void testJobApplicationLimit() {
    // Given: Candidate with 50 applications today
    Candidate candidate = createCandidateWith50ApplicationsToday();
    
    // When: Try to apply to another job
    ApplicationRequest request = createValidApplicationRequest();
    
    // Then: Should be rate limited
    assertThrows(RateLimitExceededException.class, 
        () -> applicationController.applyToJob(job.getId(), request));
}

@Test
public void testExpiredJobApplication() {
    // Given: Expired job
    Job expiredJob = createExpiredJob();
    
    // When: Try to apply
    ApplicationRequest request = createValidApplicationRequest();
    
    // Then: Should be rejected
    assertThrows(JobExpiredException.class, 
        () -> applicationController.applyToJob(expiredJob.getId(), request));
}
```

---

## 📊 VALIDATION SUMMARY

### **Permission Matrix Summary**
| **Role** | **Total Permissions** | **Key Capabilities** |
|----------|----------------------|---------------------|
| **ADMIN** | 134 | Full system access, user management, system administration |
| **EMPLOYER** | 35 | Job management, application review, company management |
| **CANDIDATE** | 18 | Job search, application submission, profile management |

### **Security Levels**
| **Level** | **Description** | **Implementation** |
|-----------|----------------|-------------------|
| **Level 1** | Basic authentication | JWT tokens, password validation |
| **Level 2** | Role-based access control | Method-level security, permission checks |
| **Level 3** | Data ownership validation | Custom permission evaluators |
| **Level 4** | Advanced security | Rate limiting, audit logging, encryption |

### **Validation Categories**
- ✅ **Input Validation**: Format, length, required fields
- ✅ **Business Logic Validation**: Ownership, status, relationships
- ✅ **Security Validation**: Authentication, authorization, data protection
- ✅ **Performance Validation**: Rate limiting, resource usage
- ✅ **Compliance Validation**: GDPR, data retention, audit trails

---

**Last Updated**: 2026-02-15  
**Version**: 1.0  
**Author**: Senior Backend Team
