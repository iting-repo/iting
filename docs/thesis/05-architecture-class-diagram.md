# Class Diagram Tổng Quát Hệ Thống ITing Job Portal

## 1. Tổng Quan Kiến Trúc Hệ Thống

Hệ thống **ITing Job Portal** được xây dựng trên nền tảng **Spring Boot 3.2.1** với **Java 17**, sử dụng kiến trúc phân lớp (layered architecture) theo mô hình **Controller – Service – Repository**. Hệ thống hỗ trợ ba vai trò người dùng chính: **Ứng viên (Candidate)**, **Nhà tuyển dụng (Employer/Hr)** và **Quản trị viên (Admin)**.

Các thành phần chính:

| Tầng (Layer) | Mô tả |
|---|---|
| **Controller** | Xử lý request HTTP, phân quyền theo vai trò, định nghĩa REST API endpoints |
| **Service** | Logic nghiệp vụ, giao tiếp liên module, tích hợp AI/ML |
| **Repository** | Truy xuất dữ liệu qua Spring Data JPA, query động với JPA Criteria API |
| **Entity** | Đối tượng domain, quan hệ JPA, audit fields |
| **DTO** | Data Transfer Object cho request/response |

---

## 2. Sơ Đồ Package (Package Diagram)

```
com.iting.jobportal
├── auth                        # Xác thực, phân quyền
│   ├── controller
│   ├── dto / request
│   ├── dto / response
│   ├── entity                  # Account, RefreshToken, OtpCode, BanHistory
│   ├── enums                   # Role, AccountStatus
│   ├── repository
│   ├── security               # SecurityConfig, JwtAuthFilter, JwtTokenUtil, AuthUser
│   └── service                # AuthService, AccountService, RefreshTokenService
│
├── job                         # Quản lý tin tuyển dụng
│   ├── controller              # EmployerJobController, UserJobController, AiController
│   ├── dto / request
│   ├── dto / response
│   ├── entity                  # Job, UserSaveJob, JobReviewHistory
│   ├── enums                   # JobType, JobStatus, ExperienceLevel
│   ├── repository             # JobRepository, JobSpecification
│   └── service                # JobService, JobEmbeddingService, VectorSearchService
│
├── application                 # Quản lý hồ sơ ứng tuyển
│   ├── controller              # CandidateApplicationController, HrPipelineController
│   ├── dto / request
│   ├── dto / response
│   ├── entity                  # ApplyForm, ApplicationStageHistory, HrEmailTemplate
│   ├── enums                   # ApplicationStatus
│   ├── repository
│   └── service                # CandidateApplicationService, MatchScoreService
│
├── company                     # Quản lý công ty
│   ├── controller              # CompanyController, CompanyReviewController
│   ├── dto / request
│   ├── dto / response
│   ├── entity                  # Company, CompanyReview, CompanyHrAffiliation
│   ├── enums                   # VerificationLevel, SubmissionStatus
│   ├── repository
│   └── service                # CompanyService, AffiliationService
│
├── userprofile                 # Hồ sơ ứng viên
│   ├── controller              # UserProfileController, CVController
│   ├── dto / request
│   ├── dto / response
│   ├── entity                  # UserProfile, CV, Experience, Education, Certificate
│   ├── enums                   # CvStatus, EducationLevel
│   ├── repository
│   └── service                # UserProfileService, CVService, EmbeddingClient
│
├── admin                       # Quản trị hệ thống
│   ├── controller              # AdminController, AdminDashboardController
│   ├── dto / request
│   ├── dto / response
│   ├── entity                  # Admin, ActivityLog, Banner, Blog, UserReport
│   ├── enums                   # AdminLevel, ReportType
│   ├── repository
│   └── service
│
├── notification                # Thông báo
│   ├── controller
│   ├── entity                  # Notification
│   ├── enums                   # NotificationType
│   ├── repository
│   └── service                # NotificationService, WebSocketNotificationService
│
├── recommendation              # Hệ thống gợi ý
│   ├── controller
│   ├── dto / request
│   ├── dto / response
│   ├── entity                  # UserJobInteraction, SavedSearch, UserSearchHistory
│   ├── enums                   # InteractionType
│   ├── repository
│   └── service                # RecommendationService, InteractionService
│
├── messaging                   # Nhắn tin real-time
│   ├── controller
│   ├── entity                  # Conversation, Message
│   ├── enums                   # ConversationType, SenderType
│   ├── repository
│   └── service                # MessageService, ConversationService
│
├── payment                     # Thanh toán, đăng ký gói dịch vụ
│   ├── controller
│   ├── entity                  # PaymentOrder, HrSubscription, Invoice
│   ├── enums
│   ├── repository
│   └── service                # SubscriptionService, SepayPaymentService
│
├── common                      # Tiện ích dùng chung
│   ├── entity                  # AuditEntity (base class), Referral, NewsletterSubscription
│   ├── exception               # GlobalExceptionHandler, ApiException, ResourceNotFoundException
│   ├── config                  # RedisConfig, WebMvcConfig, OpenAPIConfig, S3Config
│   ├── security               # RateLimitInterceptor, RateLimitAspect
│   ├── service                # EmailService, GeminiService, S3Service
│   └── util                   # ExcelHelper, StringListConverter, ApplicationMapperUtil
│
└── file                        # Upload file lên S3
    └── service                # S3Service
```

---

## 3. Class Diagram Tổng Quát

### 3.1. Tầng Entity – Các Entity Chính và Quan Hệ

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                     auth.entity                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «enum» Role                                                                              │
│   CANDIDATE                                                                           │
│   EMPLOYER                                                                           │
│   ADMIN                                                                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «enum» AccountStatus                                                                   │
│   PENDING, ACTIVE, BANNED, DELETED, SUSPENDED, PENDING_APPROVAL                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» Account                                                                       │
│   ─ id: Long                                                                          │
│   ─ email: String                                                                      │
│   ─ passwordHash: String                                                               │
│   ─ role: Role                                                                         │
│   ─ status: AccountStatus                                                              │
│   ─ failedLoginAttempts: Integer                                                       │
│   ─ lockTime: LocalDateTime                                                           │
│   ─ premiumSubscriptionExpiry: LocalDateTime                                          │
│   ─ lastLoginAt: LocalDateTime                                                        │
│   ─ marketingAttribution: String                                                       │
│   ─ createdAt: LocalDateTime                                                           │
│   ─ updatedAt: LocalDateTime                                                           │
│   ─ refreshTokens: List<RefreshToken>  ◆──OneToMany──► RefreshToken                    │
│   ─ banHistories: List<BanHistory>   ◆──OneToMany──► BanHistory                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» RefreshToken                                                                   │
│   ─ id: Long                                                                          │
│   ─ account: Account  ●────► Account                                                   │
│   ─ token: String                                                                   │
│   ─ expiresAt: LocalDateTime                                                          │
│   ─ createdAt: LocalDateTime                                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» BanHistory                                                                     │
│   ─ id: Long                                                                          │
│   ─ account: Account  ●────► Account                                                   │
│   ─ bannedBy: Long                                                                   │
│   ─ reason: String                                                                   │
│   ─ bannedAt: LocalDateTime                                                           │
│   ─ expiresAt: LocalDateTime                                                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                      job.entity                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «enum» JobType, JobStatus, ExperienceLevel, WorkingDays, SalaryType                      │
│   FULL_TIME, PART_TIME, INTERNSHIP, CONTRACT                                          │
│   DRAFT, PENDING_REVIEW, APPROVED, REJECTED, EXPIRED                                   │
│   FRESH_GRAD, JUNIOR, MIDDLE, SENIOR, LEAD, MANAGER                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» Job                                                                           │
│   ─ id: Long                                                                          │
│   ─ company: Company  ●────► Company                                                  │
│   ─ title: String                                                                     │
│   ─ skills: String  (StringListConverter – comma-separated)                            │
│   ─ jobType: JobType                                                                  │
│   ─ experienceLevel: ExperienceLevel                                                  │
│   ─ workingDays: WorkingDays                                                          │
│   ─ salaryMin: Long                                                                   │
│   ─ salaryMax: Long                                                                   │
│   ─ salaryType: SalaryType                                                            │
│   ─ location: String                                                                  │
│   ─ description: String (TEXT)                                                        │
│   ─ benefits: String                                                                  │
│   ─ requirements: String                                                              │
│   ─ reviewStatus: JobReviewStatus                                                     │
│   ─ aiEmbedding: float[]  (Vector – AI job embedding)                                 │
│   ─ isFeatured: Boolean                                                               │
│   ─ viewCount: Integer                                                                 │
│   ─ applicationCount: Integer                                                         │
│   ─ createdAt: LocalDateTime                                                          │
│   ─ updatedAt: LocalDateTime                                                          │
│   ─ savedByUsers: List<UserSaveJob> ◆──OneToMany──► UserSaveJob                       │
│   ─ reviewHistories: List<JobReviewHistory> ◆──OneToMany──► JobReviewHistory           │
│   ─ sentToJobs: List<ApplyFormSentToJob> ◆──OneToMany──► ApplyFormSentToJob            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» UserSaveJob                                                                    │
│   ─ id: UserSaveJobId (composite key)                                                 │
│   ─ account: Account  ●────► Account                                                   │
│   ─ job: Job  ●────► Job                                                              │
│   ─ savedAt: LocalDateTime                                                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» JobReviewHistory                                                               │
│   ─ id: Long                                                                          │
│   ─ job: Job  ●────► Job                                                              │
│   ─ adminId: Long                                                                    │
│   ─ action: JobReviewAction                                                           │
│   ─ note: String                                                                      │
│   ─ createdAt: LocalDateTime                                                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                  application.entity                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «enum» ApplicationStatus                                                               │
│   APPLIED, VIEWED, SHORTLISTED, INTERVIEWING, OFFERED, REJECTED, WITHDRAWN             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» ApplyForm                                                                     │
│   ─ id: Long                                                                          │
│   ─ account: Account  ●────► Account                                                   │
│   ─ cv: CV  ●────► CV                                                                 │
│   ─ applicantName: String                                                              │
│   ─ introduction: String                                                                │
│   ─ matchScore: Float  (AI-calculated)                                                 │
│   ─ currentStage: String                                                               │
│   ─ status: ApplicationStatus                                                          │
│   ─ createdAt: LocalDateTime                                                          │
│   ─ updatedAt: LocalDateTime                                                           │
│   ─ sentToJobs: List<ApplyFormSentToJob> ◆──OneToMany──► ApplyFormSentToJob           │
│   ─ stageHistories: List<ApplicationStageHistory> ◆──OneToMany──►                     │
│       ApplicationStageHistory                                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» ApplyFormSentToJob  (many-to-many join table)                                │
│   ─ id: Long                                                                          │
│   ─ applyForm: ApplyForm  ●────► ApplyForm                                             │
│   ─ job: Job  ●────► Job                                                              │
│   ─ appliedAt: LocalDateTime                                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» ApplicationStageHistory                                                       │
│   ─ id: Long                                                                          │
│   ─ applyForm: ApplyForm  ●────► ApplyForm                                             │
│   ─ previousStage: String                                                             │
│   ─ newStage: String                                                                  │
│   ─ changedBy: Long                                                                   │
│   ─ changedAt: LocalDateTime                                                          │
│   ─ note: String                                                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» HrEmailTemplate                                                               │
│   ─ id: Long                                                                          │
│   ─ company: Company  ●────► Company                                                    │
│   ─ stageName: String                                                                 │
│   ─ subject: String                                                                   │
│   ─ body: String                                                                      │
│   ─ createdAt: LocalDateTime                                                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    company.entity                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «enum» VerificationLevel, BusinessDocumentType, SubmissionStatus,                         │
│         DocumentReviewStatus, CompanyReviewStatus, CompanyAuditAction,                   │
│         AffiliationStatus                                                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» Company                                                                       │
│   ─ id: Long                                                                          │
│   ─ name: String                                                                      │
│   ─ slug: String                                                                       │
│   ─ logo: String                                                                      │
│   ─ coverImage: String                                                                 │
│   ─ website: String                                                                   │
│   ─ industry: String                                                                  │
│   ─ size: String                                                                      │
│   ─ description: String                                                                │
│   ─ location: String                                                                  │
│   ─ verificationLevel: VerificationLevel                                               │
│   ─ taxCode: String                                                                   │
│   ─ businessType: String                                                              │
│   ─ foundedYear: Integer                                                              │
│   ─ averageRating: Float                                                              │
│   ─ reviewCount: Integer                                                              │
│   ─ followerCount: Integer                                                            │
│   ─ createdAt: LocalDateTime                                                          │
│   ─ updatedAt: LocalDateTime                                                           │
│   ─ jobs: List<Job> ◆──OneToMany──► Job                                               │
│   ─ reviews: List<CompanyReview> ◆──OneToMany──► CompanyReview                        │
│   ─ affiliations: List<CompanyHrAffiliation> ◆──OneToMany──► CompanyHrAffiliation     │
│   ─ followers: List<UserFollowCompany> ◆──OneToMany──► UserFollowCompany               │
│   ─ hrEmailTemplates: List<HrEmailTemplate> ◆──OneToMany──► HrEmailTemplate           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» CompanyReview                                                                 │
│   ─ id: Long                                                                          │
│   ─ company: Company  ●────► Company                                                  │
│   ─ account: Account  ●────► Account                                                   │
│   ─ rating: Integer                                                                  │
│   ─ title: String                                                                      │
│   ─ content: String                                                                    │
│   ─ status: CompanyReviewStatus                                                       │
│   ─ upvoteCount: Integer                                                              │
│   ─ downvoteCount: Integer                                                           │
│   ─ createdAt: LocalDateTime                                                          │
│   ─ updatedAt: LocalDateTime                                                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» CompanyHrAffiliation  (Employer ↔ Company many-to-many)                     │
│   ─ id: Long                                                                          │
│   ─ account: Account  ●────► Account                                                   │
│   ─ company: Company  ●────► Company                                                  │
│   ─ status: AffiliationStatus                                                         │
│   ─ requestedAt: LocalDateTime                                                        │
│   ─ approvedAt: LocalDateTime                                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» UserFollowCompany                                                            │
│   ─ id: Long                                                                          │
│   ─ account: Account  ●────► Account                                                   │
│   ─ company: Company  ●────► Company                                                  │
│   ─ followedAt: LocalDateTime                                                        │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   userprofile.entity                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «enum» CvStatus, EducationLevel, SocialPlatform                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» UserProfile                                                                  │
│   ─ id: Long                                                                          │
│   ─ account: Account  ●────► Account (OneToOne)                                       │
│   ─ fullName: String                                                                  │
│   ─ headline: String                                                                  │
│   ─ avatar: String                                                                    │
│   ─ phone: String                                                                     │
│   ─ dateOfBirth: LocalDate                                                            │
│   ─ gender: String                                                                    │
│   ─ address: String                                                                   │
│   ─ bio: String                                                                       │
│   ─ website: String                                                                   │
│   ─ linkedin: String                                                                  │
│   ─ createdAt: LocalDateTime                                                          │
│   ─ updatedAt: LocalDateTime                                                           │
│   ─ cvs: List<CV> ◆──OneToMany──► CV                                                  │
│   ─ experiences: List<Experience> ◆──OneToMany──► Experience                          │
│   ─ educations: List<Education> ◆──OneToMany──► Education                              │
│   ─ certificates: List<Certificate> ◆──OneToMany──► Certificate                       │
│   ─ skills: List<Skill> ◆──OneToMany──► Skill                                         │
│   ─ portfolios: List<Portfolio> ◆──OneToMany──► Portfolio                             │
│   ─ socialLinks: List<SocialLink> ◆──OneToMany──► SocialLink                          │
│   ─ contactInfo: ContactInfo  ●────► ContactInfo (OneToOne)                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» CV                                                                            │
│   ─ id: Long                                                                          │
│   ─ userProfile: UserProfile  ●────► UserProfile                                      │
│   ─ fileName: String                                                                  │
│   ─ fileUrl: String                                                                   │
│   ─ originalFileName: String                                                          │
│   ─ fileSize: Long                                                                    │
│   ─ mimeType: String                                                                  │
│   ─ status: CvStatus                                                                  │
│   ─ createdAt: LocalDateTime                                                          │
│   ─ updatedAt: LocalDateTime                                                           │
│   ─ applyForms: List<ApplyForm> ◆──OneToMany──► ApplyForm                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» Experience / Education / Certificate / Skill / Portfolio / SocialLink          │
│   ─ id: Long                                                                          │
│   ─ userProfile: UserProfile  ●────► UserProfile                                      │
│   (các trường riêng cho từng entity – xem chi tiết bên dưới)                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» ContactInfo                                                                   │
│   ─ id: Long                                                                          │
│   ─ userProfile: UserProfile  ●────► UserProfile (OneToOne)                           │
│   ─ email: String                                                                     │
│   ─ phone: String                                                                     │
│   ─ address: String                                                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                 recommendation.entity                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «enum» InteractionType                                                                  │
│   VIEW, SAVE, APPLY, UNSAVE, UNAPPLY                                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» UserJobInteraction                                                             │
│   ─ id: Long                                                                          │
│   ─ account: Account  ●────► Account                                                   │
│   ─ job: Job  ●────► Job                                                             │
│   ─ interactionType: InteractionType                                                   │
│   ─ interactionTime: LocalDateTime                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» SavedSearch                                                                    │
│   ─ id: Long                                                                          │
│   ─ account: Account  ●────► Account                                                   │
│   ─ searchCriteria: String                                                            │
│   ─ alertEnabled: Boolean                                                            │
│   ─ createdAt: LocalDateTime                                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» UserSearchHistory                                                             │
│   ─ id: Long                                                                          │
│   ─ account: Account  ●────► Account                                                   │
│   ─ keyword: String                                                                   │
│   ─ searchedAt: LocalDateTime                                                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                  notification.entity                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «enum» NotificationType, RecipientType                                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» Notification                                                                  │
│   ─ id: Long                                                                          │
│   ─ recipient: Account  ●────► Account                                                 │
│   ─ type: NotificationType                                                             │
│   ─ title: String                                                                      │
│   ─ message: String                                                                    │
│   ─ targetUrl: String                                                                 │
│   ─ isRead: Boolean                                                                   │
│   ─ createdAt: LocalDateTime                                                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    messaging.entity                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «enum» ConversationType, SenderType, ReceiverType                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» Conversation                                                                  │
│   ─ id: Long                                                                          │
│   ─ type: ConversationType                                                            │
│   ─ participantAccountId: Long                                                        │
│   ─ participantCompanyId: Long                                                         │
│   ─ lastMessage: String                                                                │
│   ─ lastMessageAt: LocalDateTime                                                       │
│   ─ createdAt: LocalDateTime                                                           │
│   ─ messages: List<Message> ◆──OneToMany──► Message                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» Message                                                                        │
│   ─ id: Long                                                                          │
│   ─ conversation: Conversation  ●────► Conversation                                   │
│   ─ senderType: SenderType                                                             │
│   ─ senderId: Long                                                                    │
│   ─ content: String                                                                    │
│   ─ sentAt: LocalDateTime                                                              │
│   ─ readAt: LocalDateTime                                                              │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                     payment.entity                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» PaymentOrder                                                                  │
│   ─ id: Long                                                                          │
│   ─ account: Account  ●────► Account                                                   │
│   ─ amount: Long                                                                     │
│   ─ currency: String                                                                  │
│   ─ paymentMethod: String                                                             │
│   ─ status: String                                                                    │
│   ─ transactionId: String                                                              │
│   ─ createdAt: LocalDateTime                                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» HrSubscription                                                                │
│   ─ id: Long                                                                          │
│   ─ account: Account  ●────► Account                                                   │
│   ─ company: Company  ●────► Company                                                  │
│   ─ tier: String                                                                      │
│   ─ startDate: LocalDate                                                              │
│   ─ endDate: LocalDate                                                                │
│   ─ status: String                                                                    │
│   ─ createdAt: LocalDateTime                                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» Invoice                                                                        │
│   ─ id: Long                                                                          │
│   ─ account: Account  ●────► Account                                                   │
│   ─ invoiceNumber: String                                                             │
│   ─ amount: Long                                                                      │
│   ─ status: String                                                                    │
│   ─ paidAt: LocalDateTime                                                             │
│   ─ createdAt: LocalDateTime                                                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                      admin.entity                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «enum» AdminLevel, ReportType                                                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» Admin                                                                          │
│   ─ id: Long                                                                          │
│   ─ account: Account  ●────► Account (OneToOne)                                       │
│   ─ level: AdminLevel                                                                 │
│   ─ createdAt: LocalDateTime                                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» ActivityLog                                                                    │
│   ─ id: Long                                                                          │
│   ─ adminId: Long                                                                    │
│   ─ action: String                                                                    │
│   ─ targetType: String                                                                │
│   ─ targetId: Long                                                                   │
│   ─ details: String                                                                   │
│   ─ ipAddress: String                                                                  │
│   ─ createdAt: LocalDateTime                                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» Banner / Blog / StaticContent / SystemConfig                                   │
│   ─ id: Long                                                                          │
│   ─ (các trường metadata riêng cho từng entity)                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» UserReport / ReportAccount                                                     │
│   ─ id: Long                                                                          │
│   ─ reporterId: Long                                                                 │
│   ─ reportedAccountId: Long                                                            │
│   ─ reason: String                                                                    │
│   ─ status: String                                                                    │
│   ─ createdAt: LocalDateTime                                                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                     common.entity                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «abstract» AuditEntity  (base class – extend tất cả entities)                          │
│   ─ createdAt: LocalDateTime                                                          │
│   ─ updatedAt: LocalDateTime                                                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» Referral                                                                       │
│   ─ id: Long                                                                          │
│   ─ referrer: Account  ●────► Account                                                 │
│   ─ referred: Account  ●────► Account                                                 │
│   ─ referralCode: String                                                               │
│   ─ rewardStatus: String                                                              │
│   ─ createdAt: LocalDateTime                                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «entity» NewsletterSubscription                                                         │
│   ─ id: Long                                                                          │
│   ─ email: String                                                                     │
│   ─ subscribedAt: LocalDateTime                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Tầng Service – Interface và Implementation Chính

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              auth.service (Interface)                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» AuthService                                                                  │
│   + login(LoginRequest): AuthResponse                                                 │
│   + register(RegisterRequest): AuthResponse                                           │
│   + googleAuth(GoogleAuthRequest): AuthResponse                                       │
│   + refreshToken(String token): AuthResponse                                          │
│   + forgotPassword(ForgotPasswordRequest): void                                        │
│   + resetPassword(ResetPasswordRequest): void                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» AccountService                                                              │
│   + findByEmail(String email): Account                                                │
│   + createAccount(Account account): Account                                            │
│   + updateAccount(Long id, Account account): Account                                  │
│   + lockAccount(Long id): void                                                        │
│   + unlockAccount(Long id): void                                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» RefreshTokenService                                                        │
│   + createRefreshToken(Account account): RefreshToken                                  │
│   + validateRefreshToken(String token): RefreshToken                                    │
│   + deleteByAccountId(Long accountId): void                                            │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                job.service (Interface)                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» JobService                                                                  │
│   + createJob(Long employerId, CreateJobRequest): Job                                  │
│   + updateJob(Long jobId, UpdateJobRequest): Job                                       │
│   + deleteJob(Long jobId): void                                                       │
│   + searchJobs(SearchJobRequest): Page<JobResponse>                                    │
│   + getLatestJobs(int page, int size): Page<JobResponse>                              │
│   + getHotJobs(int limit): List<JobResponse>                                           │
│   + getJobById(Long jobId): JobResponse                                                │
│   + approveJob(Long jobId): void                                                      │
│   + rejectJob(Long jobId, String reason): void                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» JobEmbeddingService                                                        │
│   + generateEmbedding(Job job): float[]                                                │
│   + updateJobEmbedding(Long jobId): void                                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» VectorSearchService                                                        │
│   + findSimilarJobs(float[] embedding, int limit): List<Long>                          │
│   + findSimilarCandidates(float[] embedding, int limit): List<Long>                    │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            application.service (Interface)                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» CandidateApplicationService                                                │
│   + applyToJob(Long candidateId, ApplyRequest): ApplyForm                             │
│   + withdrawApplication(Long applicationId): void                                     │
│   + getMyApplications(Long candidateId, Pageable): Page<ApplicationResponse>         │
│   + getApplicationDetail(Long applicationId): ApplicationDetailResponse                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» EmployerApplicationService                                                 │
│   + getReceivedApplications(Long employerId, Pageable): Page<ApplicationResponse>      │
│   + updateApplicationStage(Long applicationId, UpdateStageRequest): void              │
│   + bulkUpdateStage(List<Long> applicationIds, String newStage): void                 │
│   + sendEmailTemplate(Long applicationId, Long templateId): void                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» MatchScoreService                                                          │
│   + calculateMatchScore(ApplyForm applyForm, Job job): Float                           │
│   + batchCalculateScores(List<Long> applicationIds): void                             │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              company.service (Interface)                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» CompanyService                                                               │
│   + createCompany(CreateCompanyRequest): Company                                       │
│   + updateCompany(Long companyId, UpdateCompanyRequest): Company                       │
│   + getCompanyById(Long companyId): CompanyResponse                                   │
│   + submitKyb(Long companyId, KybSubmitRequest): void                                  │
│   + approveKyb(Long companyId, KybApproveRequest): void                               │
│   + followCompany(Long accountId, Long companyId): void                               │
│   + unfollowCompany(Long accountId, Long companyId): void                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» CompanyReviewService                                                       │
│   + createReview(Long accountId, CreateReviewRequest): CompanyReview                   │
│   + voteReview(Long reviewId, Boolean isUpvote): void                                  │
│   + getCompanyReviews(Long companyId, Pageable): Page<ReviewResponse>                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            userprofile.service (Interface)                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» UserProfileService                                                         │
│   + getProfile(Long accountId): UserProfileResponse                                    │
│   + updateProfile(Long accountId, UpdateProfileRequest): UserProfile                   │
│   + uploadAvatar(Long accountId, MultipartFile file): String                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» CVService                                                                  │
│   + uploadCV(Long accountId, MultipartFile file): CV                                   │
│   + updateCVStatus(Long cvId, CvStatus status): CV                                     │
│   + getCvsByAccountId(Long accountId): List<CvResponse>                                │
│   + deleteCV(Long cvId): void                                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» EmployerCandidateSearchService                                             │
│   + searchCandidates(SearchCandidateRequest): Page<CandidateProfileResponse>          │
│   + getCandidateProfile(Long candidateId): CandidateDetailResponse                    │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          recommendation.service (Interface)                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» RecommendationService                                                      │
│   + getJobRecommendations(Long accountId): List<JobResponse>                          │
│   + getCandidateRecommendations(Long jobId): List<CandidateResponse>                   │
│   + refreshRecommendations(Long accountId): void                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» InteractionService                                                         │
│   + recordInteraction(Long accountId, Long jobId, InteractionType): void               │
│   + getInteractionStats(Long accountId): InteractionStatsResponse                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              common.service (Interface)                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» EmailService                                                               │
│   + sendSimpleEmail(String to, String subject, String content): void                   │
│   + sendHtmlEmail(String to, String subject, String htmlContent): void                │
│   + sendTemplateEmail(String to, String templateId, Map<String, Object> variables): void│
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» NotificationService                                                        │
│   + createNotification(Long recipientId, NotificationType, String title, String msg): void│
│   + getUserNotifications(Long accountId, Pageable): Page<NotificationResponse>        │
│   + markAsRead(Long notificationId): void                                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» WebSocketNotificationService                                               │
│   + sendRealTimeNotification(Long accountId, NotificationResponse): void              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» DistributedLockService                                                     │
│   + executeWithLock(String lockKey, long ttlSeconds, Runnable task): void             │
│   + tryLock(String lockKey, long ttlSeconds): Boolean                                 │
│   + unlock(String lockKey): void                                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interface» RedisRateLimitingService                                                   │
│   + isAllowed(String key, int permits, long windowSeconds): Boolean                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.3. Tầng Controller – Các Controller Chính

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                  auth.controller                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» AuthController                                                                  │
│   POST /api/auth/login → AuthService.login()                                          │
│   POST /api/auth/register → AuthService.register()                                    │
│   POST /api/auth/google → AuthService.googleAuth()                                   │
│   POST /api/auth/refresh → AuthService.refreshToken()                                │
│   POST /api/auth/forgot-password → AuthService.forgotPassword()                       │
│   POST /api/auth/reset-password → AuthService.resetPassword()                         │
│   GET  /api/auth/me → Account (protected)                                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» RefreshTokenController                                                          │
│   POST /api/auth/logout → RefreshTokenService.deleteByAccountId()                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    job.controller                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» EmployerJobController  (ROLE_EMPLOYER)                                         │
│   POST   /api/employer/jobs → JobService.createJob()                                  │
│   PUT    /api/employer/jobs/{id} → JobService.updateJob()                            │
│   DELETE /api/employer/jobs/{id} → JobService.deleteJob()                            │
│   GET    /api/employer/jobs → JobService.getMyJobs()                                  │
│   POST   /api/employer/jobs/{id}/feature → JobService.featureJob()                   │
│   GET    /api/employer/jobs/{id}/analytics → (view count, application count)          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» UserJobController  (public + authenticated)                                    │
│   GET /api/jobs/search → JobService.searchJobs()                                      │
│   GET /api/jobs/latest → JobService.getLatestJobs()                                   │
│   GET /api/jobs/hot → JobService.getHotJobs()                                         │
│   GET /api/jobs/{id} → JobService.getJobById()                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» UserSavedJobController  (ROLE_CANDIDATE)                                       │
│   POST   /api/user/saved-jobs/{jobId} → UserSavedJobService.saveJob()                 │
│   DELETE /api/user/saved-jobs/{jobId} → UserSavedJobService.unsaveJob()               │
│   GET    /api/user/saved-jobs → UserSavedJobService.getSavedJobs()                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» AiController  (public)                                                          │
│   POST /api/ai/analyze-job → AiService.analyzeJob()                                   │
│   GET  /api/ai/cover-letter → AiCoverLetterController.generate()                     │
│   GET  /api/ai/job-embedding/{jobId} → JobEmbeddingService.getEmbedding()             │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                 application.controller                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» CandidateApplicationController  (ROLE_CANDIDATE)                               │
│   POST /api/candidate/applications → CandidateApplicationService.applyToJob()        │
│   DELETE /api/candidate/applications/{id} → withdrawApplication()                     │
│   GET  /api/candidate/applications → getMyApplications()                              │
│   GET  /api/candidate/applications/{id} → getApplicationDetail()                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» HrApplicationController  (ROLE_EMPLOYER)                                       │
│   GET  /api/hr/applications → EmployerApplicationService.getReceivedApplications()    │
│   PATCH /api/hr/applications/{id}/stage → updateApplicationStage()                    │
│   POST /api/hr/applications/bulk-stage → bulkUpdateStage()                           │
│   POST /api/hr/applications/{id}/email → sendEmailTemplate()                         │
│   GET  /api/hr/applications/{id}/match-score → MatchScoreService.getScore()           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» HrPipelineController  (ROLE_EMPLOYER)                                          │
│   GET  /api/hr/pipeline/{jobId} → (kanban view of pipeline stages)                    │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                  company.controller                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» CompanyController  (ROLE_EMPLOYER)                                             │
│   POST /api/companies → CompanyService.createCompany()                               │
│   PUT  /api/companies/{id} → CompanyService.updateCompany()                          │
│   POST /api/companies/{id}/kyb/submit → submitKyb()                                   │
│   POST /api/companies/{id}/follow → followCompany()                                 │
│   DELETE /api/companies/{id}/follow → unfollowCompany()                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» PublicCompanyController  (public)                                               │
│   GET /api/companies/{id} → CompanyService.getCompanyById()                          │
│   GET /api/companies/{id}/jobs → (company's public job listings)                      │
│   GET /api/companies/{id}/reviews → CompanyReviewService.getCompanyReviews()         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» CompanyReviewController  (ROLE_CANDIDATE)                                      │
│   POST /api/companies/{id}/reviews → CompanyReviewService.createReview()             │
│   POST /api/companies/reviews/{id}/vote → CompanyReviewService.voteReview()          │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                 userprofile.controller                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» UserProfileController  (authenticated)                                         │
│   GET  /api/user/profile → UserProfileService.getProfile()                            │
│   PUT  /api/user/profile → UserProfileService.updateProfile()                        │
│   POST /api/user/profile/avatar → uploadAvatar()                                      │
│   POST /api/user/profile/experiences → (add experience)                              │
│   PUT  /api/user/profile/experiences/{id} → (update experience)                      │
│   DELETE /api/user/profile/experiences/{id} → (delete experience)                   │
│   (tương tự cho education, certificates, skills, portfolios)                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» CVController  (ROLE_CANDIDATE)                                                │
│   POST /api/user/cvs → CVService.uploadCV()                                          │
│   GET  /api/user/cvs → CVService.getCvsByAccountId()                                  │
│   DELETE /api/user/cvs/{id} → CVService.deleteCV()                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» EmployerCandidateController  (ROLE_EMPLOYER)                                   │
│   GET /api/employer/candidates/search → EmployerCandidateSearchService.searchCandidates()│
│   GET /api/employer/candidates/{id} → getCandidateProfile()                            │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                  recommendation.controller                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» RecommendationController  (authenticated)                                       │
│   GET /api/recommendations/jobs → RecommendationService.getJobRecommendations()      │
│   POST /api/recommendations/refresh → refreshRecommendations()                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» SavedSearchController  (authenticated)                                          │
│   POST /api/user/saved-searches → SavedSearchService.create()                        │
│   GET  /api/user/saved-searches → SavedSearchService.getAll()                         │
│   DELETE /api/user/saved-searches/{id} → delete()                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   admin.controller                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» AdminController  (ROLE_ADMIN)                                                  │
│   GET  /api/admin/dashboard → (stats)                                                 │
│   GET  /api/admin/accounts → (list accounts with pagination & filter)                 │
│   POST /api/admin/accounts/{id}/lock → lockAccount()                                  │
│   POST /api/admin/accounts/{id}/unlock → unlockAccount()                              │
│   GET  /api/admin/companies/pending-kyb → (KYB pending list)                         │
│   POST /api/admin/companies/{id}/kyb/approve → approveKyb()                           │
│   POST /api/admin/companies/{id}/kyb/reject → rejectKyb()                             │
│   GET  /api/admin/jobs/pending-review → (jobs pending admin review)                  │
│   POST /api/admin/jobs/{id}/approve → JobService.approveJob()                        │
│   POST /api/admin/jobs/{id}/reject → JobService.rejectJob()                          │
│   GET  /api/admin/reports → UserReportService.getReports()                           │
│   POST /api/admin/banners → AdminBannerService.create()                              │
│   GET  /api/admin/blogs → AdminBlogService.getAll()                                  │
│   POST /api/admin/blogs → AdminBlogService.create()                                  │
│   PUT  /api/admin/blogs/{id} → AdminBlogService.update()                             │
│   DELETE /api/admin/blogs/{id} → AdminBlogService.delete()                           │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                  notification.controller                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» NotificationController  (authenticated)                                          │
│   GET /api/notifications → NotificationService.getUserNotifications()                │
│   POST /api/notifications/{id}/read → markAsRead()                                    │
│   POST /api/notifications/read-all → markAllAsRead()                                 │
│   DELETE /api/notifications/{id} → deleteNotification()                               │
│   GET /api/notifications/unread-count → (count unread)                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   messaging.controller                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» MessageController  (authenticated)                                              │
│   GET /api/conversations → ConversationService.getConversations()                    │
│   GET /api/conversations/{id}/messages → MessageService.getMessages()                 │
│   POST /api/conversations/{id}/messages → MessageService.sendMessage()               │
│   POST /api/conversations → ConversationService.createConversation()                  │
│   (Real-time via WebSocket endpoint /ws/*)                                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    payment.controller                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» PaymentController  (ROLE_EMPLOYER)                                             │
│   POST /api/payments/create-order → SepayPaymentService.createOrder()                │
│   GET  /api/payments/orders → PaymentOrderService.getOrders()                        │
│   POST /api/payments/webhook/sepay → SepayWebhookController.handleWebhook()          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «rest» SubscriptionController  (ROLE_EMPLOYER)                                         │
│   GET  /api/subscriptions/tiers → (list subscription tiers)                          │
│   POST /api/subscriptions/purchase → SubscriptionService.purchase()                  │
│   GET  /api/subscriptions/current → getCurrentSubscription()                          │
│   POST /api/subscriptions/cancel → cancelSubscription()                              │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.4. Kiến Trúc Bảo Mật (Security Architecture)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              auth.security                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «config» SecurityConfig                                                                │
│   - SessionCreationPolicy: STATELESS                                                 │
│   - CSRF: DISABLED                                                                    │
│   - JWT Auth Filter: JwtAuthFilter  ◆──OncePerRequestFilter──►                       │
│   - CORS: configured                                                                  │
│   - Authorization Rules:                                                              │
│       /api/auth/**           → permitAll()                                            │
│       /swagger-ui/**         → permitAll()                                            │
│       /v3/api-docs/**       → permitAll()                                            │
│       /api/public/**        → permitAll()                                            │
│       /ws/**                → permitAll()                                            │
│       /api/admin/**         → ROLE_ADMIN                                             │
│       /api/hr/**            → ROLE_EMPLOYER                                           │
│       /api/employer/**      → ROLE_EMPLOYER                                           │
│       /api/candidate/**     → ROLE_CANDIDATE                                          │
│       /api/user/**          → authenticated                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «filter» JwtAuthFilter  extends OncePerRequestFilter                                   │
│   + doFilterInternal(HttpServletRequest, HttpServletResponse, FilterChain)          │
│     → extract Bearer token → JwtTokenUtil.validate() → build AuthUser               │
│     → set SecurityContextHolder.getContext().setAuthentication()                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «util» JwtTokenUtil                                                                    │
│   + generateToken(AuthUser): String                                                  │
│   + validateToken(String): Boolean                                                    │
│   + getClaimsFromToken(String): Claims                                                │
│   + getAccountIdFromToken(String): Long                                               │
│   + getRoleFromToken(String): Role                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «principal» AuthUser  implements UserDetails                                           │
│   ─ accountId: Long                                                                   │
│   ─ email: String                                                                      │
│   ─ role: Role                                                                         │
│   + getAuthorities(): Collection<? extends GrantedAuthority>                          │
│   + getPassword(): String                                                              │
│   + getUsername(): String                                                             │
│   + isAccountNonExpired(): Boolean                                                     │
│   + isAccountNonLocked(): Boolean                                                      │
│   + isCredentialsNonExpired(): Boolean                                                 │
│   + isEnabled(): Boolean                                                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «annotation» @CurrentUser AuthUser                                                     │
│   → resolved by CurrentUserArgumentResolver                                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «interceptor» RateLimitInterceptor                                                      │
│   → kiểm tra rate limit trước khi request đến Controller                              │
│   → sử dụng Bucket4j + Redis                                                          │
│   + preHandle(HttpServletRequest, HttpServletResponse, Object)                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.5. Cấu Hình Hệ Thống (Configuration)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    config                                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «config» RedisConfig                                                                   │
│   - RedisConnectionFactory: LettuceConnectionFactory                                 │
│   - RedisTemplate<String, Object>: Jackson2JsonRedisSerializer                       │
│   - MessageListenerContainer: for pub/sub                                           │
│   - RedissonClient: cho distributed locks                                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «config» WebMvcConfig                                                                   │
│   - CORS: addMapping("/**").allowedOrigins(corsAllowedOrigins)                       │
│   - ArgumentResolvers: CurrentUserArgumentResolver                                   │
│   - Interceptors: RateLimitInterceptor, DeprecatedPathInterceptor                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «config» OpenAPIConfig                                                                  │
│   - Swagger UI: /swagger-ui.html                                                      │
│   - OpenAPI spec: /v3/api-docs                                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ «config» S3Config                                                                       │
│   - AmazonS3: bucket name, region, access key (từ .env)                              │
│   - presigned URL generation cho upload/download                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Sơ Đồ Quan Hệ Liên Module (Cross-Module Relationships)

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Account (auth) │         │  UserProfile     │         │       CV         │
│   (id, role)     │─────────│ (userprofile)    │─────────│  (userprofile)   │
└────────┬─────────┘  1:1   └────────┬─────────┘  1:N  └────────▲─────────┘
         │                             │                      │
         │ 1:N                         │ 1:1                  │ 1:N
         ▼                             │               ┌──────┴─────────┐
┌──────────────────┐                   │               │  ApplyForm     │
│CompanyHrAffilia- │                   │               │ (application)   │
│tion (company)    │                   │               └──────▲─────────┘
└────────┬─────────┘                   │                      │
         │ 1:1                        │                      │ N:N
         ▼                            │               ┌───────┴──────────┐
┌──────────────────┐         ┌────────┴────────┐     │ ApplyFormSentToJob│
│    Company       │         │     Job         │     │  (application)    │
│   (company)      │─────────│    (job)        │─────│                  │
│ (id, name, logo) │   1:N   └────────┬────────┘ N:1 └──────────────────┘
└────────┬─────────┘                   │
         │ 1:N                        │ N:1
         ▼                   ┌─────────┴────────┐
┌──────────────────┐        │  CompanyReview   │
│ CompanyReview    │        │   (company)      │
│   (company)      │        └──────────────────┘
└──────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                         recommendation.entity                           │
├──────────────────────────────────────────────────────────────────────────┤
│ UserJobInteraction ◇──────────────────────◇ Job                         │
│ (account_id, job_id, interaction_type)    (job)                         │
│                                                                       │
│ SavedSearch ◇────────────────────────◇ Account                         │
│ (account_id, search_criteria)           (auth)                        │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐       ┌──────────────────────────────────────────┐
│   Notification       │       │           application.entity              │
│  (notification)      │       ├──────────────────────────────────────────┤
│  (recipient_id)      │       │ ApplyForm ◇──────────────────◇ Job      │
└──────────────────────┘       │ (account_id, job_id, match_score)       │
                                │                                         │
┌──────────────────────┐       │ ApplicationStageHistory ◇───────── ApplyForm │
│   Conversation       │       └──────────────────────────────────────────┘
│    (messaging)        │
│  (participant_       │
│   account_id,         │
│   participant_        │
│   company_id)         │
│       │               │
│       │ 1:N           │
│       ▼               │
│    Message            │
│  (conversation_id)   │
└──────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                        payment.entity                                   │
├──────────────────────────────────────────────────────────────────────────┤
│ PaymentOrder ◇────────────────────────◇ Account                        │
│ (account_id, amount, status)                                           │
│                                                                       │
│ HrSubscription ◇───────────────────◇ Account                          │
│                 ◇───────────────────◇ Company                        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Mô Tả Chi Tiết Các Entity Chính

### 5.1. Account Entity

`Account` là entity trung tâm của toàn bộ hệ thống, đại diện cho mọi người dùng (ứng viên, nhà tuyển dụng, quản trị viên). Entity này chứa thông tin xác thực (email, mật khẩu hash), vai trò (`Role`), trạng thái tài khoản, và các thông tin bảo mật như số lần đăng nhập thất bại, thời điểm khóa tài khoản. Mỗi Account có quan hệ **OneToOne** với `UserProfile`, quan hệ **OneToMany** với `RefreshToken`, `BanHistory`, và tham gia vào nhiều quan hệ many-to-many qua các bảng trung gian.

### 5.2. Job Entity

`Job` đại diện cho một tin tuyển dụng, chứa toàn bộ thông tin về vị trí công việc bao gồm: tiêu đề, kỹ năng yêu cầu (lưu dạng comma-separated string), loại công việc, mức kinh nghiệm, lịch làm việc, mức lương, địa điểm, mô tả công việc, quyền lợi, và yêu cầu. Trường `aiEmbedding` (float array) lưu vector đặc trưng của job được sinh ra bởi AI model, phục vụ cho chức năng tìm kiếm vector similarity. Trường `reviewStatus` kiểm soát quy trình phê duyệt tin tuyển dụng bởi admin trước khi hiển thị công khai.

### 5.3. ApplyForm Entity

`ApplyForm` là đơn ứng tuyển của một ứng viên cho một hoặc nhiều công việc (thông qua bảng trung gian `ApplyFormSentToJob`). Entity chứa thông tin ứng viên (tên, lời giới thiệu), liên kết đến CV đính kèm, điểm match score được tính bởi AI, trạng thái và giai đoạn tuyển dụng hiện tại. `ApplicationStageHistory` lưu lịch sử thay đổi giai đoạn pipeline để theo dõi quá trình tuyển dụng.

### 5.4. Company Entity

`Company` chứa thông tin hồ sơ công ty bao gồm tên, logo, ảnh bìa, website, ngành nghề, quy mô, mô tả, địa điểm. Trường `verificationLevel` phản ánh mức độ xác thực KYC/KYB của công ty. Hệ thống hỗ trợ quy trình KYB (Know Your Business) với các bước nộp tài liệu, phê duyệt bởi admin.

### 5.5. UserProfile Entity

`UserProfile` mở rộng thông tin tài khoản với hồ sơ ứng viên chi tiết bao gồm họ tên, ảnh đại diện, số điện thoại, ngày sinh, giới tính, địa chỉ, bio, website, LinkedIn. Entity có quan hệ **OneToMany** với các bảng con: `CV`, `Experience` (kinh nghiệm làm việc), `Education` (học vấn), `Certificate` (chứng chỉ), `Skill` (kỹ năng), `Portfolio`, `SocialLink`. Quan hệ **OneToOne** với `ContactInfo` để lưu thông tin liên hệ riêng biệt.

### 5.6. AuditEntity (Base Class)

`AuditEntity` là abstract base class được tất cả các entity kế thừa, cung cấp hai trường `createdAt` và `updatedAt` tự động quản lý thời điểm tạo và cập nhật bản ghi. Pattern này đảm bảo tính nhất quán về thời gian cho toàn bộ hệ thống mà không cần lập trình viên phải tự quản lý thủ công.

---

## 6. Các Design Patterns Đáng Chú Ý

| Pattern | Nơi áp dụng | Mô tả |
|---|---|---|
| **Interface + Impl** | Tất cả các module service | Tách biệt contract và implementation, dễ mock trong test |
| **Repository Pattern** | Tầng data access | Spring Data JPA repositories cho CRUD và query tùy chỉnh |
| **DTO / Mapper** | Tất cả controller ↔ service | Tách biệt API contract và entity, sử dụng MapStruct |
| **Specification Pattern** | JobRepository, UserReportSpecification | Query động với JPA Criteria API |
| **Singleton** | Các service bean | Spring @Service annotation mặc định singleton |
| **Observer / Pub-Sub** | Notification, WebSocket | DomainEventPublisher + WebSocketNotificationService |
| **Transactional Outbox** | Kafka messaging | OutboxEvent → OutboxAppender → OutboxDispatcher |
| **Rate Limiting (AOP)** | RateLimitAspect + @RateLimited | Aspect-Oriented Programming cho rate limiting |
| **Strategy Pattern** | EmbeddingClient (OpenAI / HuggingFace) | Nhiều implementation cho việc generate embedding |
| **Factory Pattern** | EmbeddingClientFactory | Tạo embedding client theo cấu hình |

---

## 7. Luồng Xử Lý Chính

### 7.1. Luồng Xác Thực (Authentication Flow)

```
Client                    JwtAuthFilter              AuthController           AuthService
  │                            │                          │                       │
  │── POST /api/auth/login ────▶│                          │                       │
  │                            │── extract & validate ────▶│── login credentials ──▶│
  │                            │                          │                       │── AccountRepository.findByEmail()
  │                            │                          │◀── AuthResponse ───────│
  │◀── 200 + JWT tokens ──────│◀── AuthResponse ──────────│                       │
  │                            │                          │                       │
  │── GET /api/user/profile ───▶│                          │                       │
  │  (Bearer token)            │── validate JWT           │                       │
  │                            │── set SecurityContext     │                       │
  │                            │                          │── @CurrentUser ───────▶│── getProfile()
  │◀── 200 + profile data ────│◀── UserProfileResponse ──│◀──────────────────────│
```

### 7.2. Luồng Ứng Tuyển (Application Flow)

```
Candidate                 CandidateApplicationController   CandidateApplicationService   MatchScoreService
   │                                │                                  │                          │
   │── POST /api/candidate/ ──────▶│                                  │                          │
   │   applications                 │                                  │                          │
   │   { jobId, cvId, intro }       │                                  │                          │
   │                                │── applyToJob(candidateId, req) ─▶│                          │
   │                                │                                  │── calculateMatchScore() ─▶│
   │                                │                                  │◀── matchScore ───────────│
   │                                │                                  │── save ApplyForm          │
   │                                │                                  │── Kafka: job-embedding ──▶│ (async)
   │                                │                                  │── Notification ──────────▶│
   │                                │◀── ApplyFormResponse ─────────────│                          │
   │◀── 201 Created ───────────────│                                  │                          │
```

### 7.3. Luồng Tạo Job có KIỂM DUYỆT (Job Creation & Review Flow)

```
Employer          EmployerJobController     JobService     AdminController      NotificationService
   │                     │                    │                 │                    │
   │── POST /api/employer──▶│                 │                 │                    │
   │   /jobs               │── createJob()──▶│                 │                    │
   │   { title, desc, ... }│                 │── save (status=│                 │
   │                     │                 │   PENDING_REVIEW)               │
   │                     │◀── JobResponse ──│                 │                    │
   │◀── 201 (draft) ──────│                 │                 │                    │
   │                     │                 │                 │                    │
   │                     │                 │── Admin checks ─▶│                 │
   │                     │                 │   pending jobs   │                 │
   │                     │                 │◀── Job list ─────│                 │
   │                     │                 │                 │                    │
   │                     │                 │── approveJob()──▶│── notify employer ─▶│
   │                     │                 │                 │                    │
```

---

## 8. Tích Hợp Bên Ngoài (External Integrations)

| Dịch vụ | Mục đích | Thư viện / Cách tích hợp |
|---|---|---|
| **PostgreSQL** | Cơ sở dữ liệu chính | Spring Data JPA + Hibernate |
| **MySQL** | (có thể cho một số chức năng cũ) | MySQL Connector 8.0.33 |
| **Redis** | Cache, rate limiting, distributed lock | Spring Data Redis + Redisson 3.27.2 |
| **Kafka** | Message queue, async job embedding | Spring Kafka |
| **AWS S3** | Lưu trữ file (CV, avatar, documents) | AWS SDK for Java v2 |
| **Google Gemini** | AI cover letter generation | Gemini API |
| **OpenAI / HuggingFace** | Vector embedding cho jobs và CVs | REST API client (EmbeddingClient) |
| **Sepay** | Cổng thanh toán VN | REST API webhook |
| **Google OAuth** | Đăng nhập bằng Google | Spring Security OAuth2 |
| **Swagger / OpenAPI** | Tài liệu API | Springdoc OpenAPI 2.5.0 |
| **Flyway** | Database migration | Flyway Core |

---

## 9. Database Schema – Bảng Chính

| Bảng | Entity | Ghi chú |
|---|---|---|
| `accounts` | Account | Hash password (BCrypt), role, status |
| `refresh_tokens` | RefreshToken | JWT refresh token |
| `jobs` | Job | Tin tuyển dụng, ai_embedding (vector) |
| `user_save_jobs` | UserSaveJob | Many-to-many candidate ↔ saved jobs |
| `apply_forms` | ApplyForm | Đơn ứng tuyển, match_score |
| `apply_form_sent_to_jobs` | ApplyFormSentToJob | Join table |
| `application_stage_histories` | ApplicationStageHistory | Pipeline audit trail |
| `companies` | Company | Hồ sơ công ty |
| `company_reviews` | CompanyReview | Đánh giá công ty |
| `company_hr_affiliations` | CompanyHrAffiliation | Employer ↔ Company |
| `user_follow_companies` | UserFollowCompany | Candidate follows Company |
| `user_profiles` | UserProfile | Thông tin ứng viên mở rộng |
| `cvs` | CV | Hồ sơ CV |
| `experiences` | Experience | Kinh nghiệm làm việc |
| `educations` | Education | Học vấn |
| `certificates` | Certificate | Chứng chỉ |
| `skills` | Skill | Kỹ năng |
| `portfolios` | Portfolio | Portfolio dự án |
| `social_links` | SocialLink | Liên kết mạng xã hội |
| `notifications` | Notification | Thông báo user |
| `conversations` | Conversation | Cuộc trò chuyện |
| `messages` | Message | Tin nhắn |
| `user_job_interactions` | UserJobInteraction | Lịch sử tương tác |
| `saved_searches` | SavedSearch | Tìm kiếm đã lưu |
| `payment_orders` | PaymentOrder | Đơn thanh toán |
| `hr_subscriptions` | HrSubscription | Gói subscription HR |
| `invoices` | Invoice | Hóa đơn |
| `admins` | Admin | Tài khoản admin |
| `activity_logs` | ActivityLog | Nhật ký hoạt động admin |
| `banners` | Banner | Banner trang chủ |
| `blogs` | Blog | Bài viết blog |
| `user_reports` | UserReport | Báo cáo người dùng |
| `referrals` | Referral | Hệ thống giới thiệu |
| `newsletter_subscriptions` | NewsletterSubscription | Đăng ký nhận tin |

> **Ghi chú:** Database schema được quản lý qua **Flyway migrations** với 86 phiên bản migration (V1__init_schema.sql → V86__add_match_score_to_applications.sql).

---

## 10. Công Nghệ Sử Dụng (Tổng Hợp)

| Nhóm | Công nghệ | Phiên bản |
|---|---|---|
| **Runtime** | Java | 17 |
| **Framework** | Spring Boot | 3.2.1 |
| **Database** | PostgreSQL | – |
| **ORM** | Spring Data JPA / Hibernate | – |
| **Cache & Lock** | Redis + Redisson | 3.27.2 |
| **Messaging** | Apache Kafka | – |
| **Security** | Spring Security + JWT (jjwt) | 0.11.5 |
| **File Storage** | AWS S3 SDK | v2 |
| **AI/ML** | Google Gemini, OpenAI Embedding, HuggingFace | – |
| **API Docs** | Springdoc OpenAPI | 2.5.0 |
| **Object Mapping** | MapStruct | 1.5.5.Final |
| **Rate Limiting** | Bucket4j | – |
| **Document Gen** | Apache POI (Excel), PDFBox | 5.2.3 / 2.0.30 |
| **Migration** | Flyway | – |
| **Build** | Maven / Gradle | – |
| **Logging** | (SLF4J + Logback) | – |

---

*Tài liệu này được tạo tự động dựa trên phân tích mã nguồn hệ thống ITing Job Portal. Class diagram thể hiện kiến trúc tại thời điểm phân tích.*
