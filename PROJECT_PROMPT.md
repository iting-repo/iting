# ITing Job Portal - Project Prompt for AI

## Tổng quan dự án
ITing là một nền tảng tuyển dụng việc làm (Job Portal) tích hợp tính năng phân tích CV bằng AI. Dự án bao gồm:
- **Backend**: Spring Boot (Java 17) với kiến trúc modular monolith
- **Frontend**: React với Redux, Webpack, Tailwind CSS
- **Database**: PostgreSQL
- **Deployment**: Docker, Render, Aiven PostgreSQL

## Mục tiêu
- Cung cấp REST API cho ứng viên và nhà tuyển dụng
- Xác thực JWT + Refresh Token với token rotation
- Phân quyền RBAC theo permission codes
- Quản lý việc làm, hồ sơ ứng viên, công ty, ứng tuyển
- Tính năng messaging, social, notification
- Tích hợp AI để phân tích CV và embeddings

## Công nghệ sử dụng
### Backend
- Java 17
- Spring Boot (Web, Data JPA, Security)
- JWT (io.jsonwebtoken)
- Swagger/OpenAPI
- PostgreSQL (production), H2 (test)
- Cloudinary cho upload files
- Maven/Gradle build

### Frontend
- React 19
- Redux Toolkit + Redux Saga
- React Router DOM
- Axios cho HTTP requests
- Tailwind CSS + PostCSS
- Webpack
- Playwright cho E2E testing
- i18next cho đa ngôn ngữ

### Database
- PostgreSQL 16+
- Schema với các bảng chính: Account, Users, Company, Job, CV, Notification, v.v.
- Embeddings cho AI CV parsing

### DevOps
- Docker + Docker Compose
- Render cho deployment
- Aiven PostgreSQL

## Cấu trúc thư mục
```
ITing/
├── data_with_embeddings.sql          # Dữ liệu mẫu với embeddings
├── DATABASE_SETUP_README.md          # Hướng dẫn setup DB
├── embeddings_update.sql             # Script update embeddings
├── README.md                         # Root README
├── schema.sql                        # Schema DB đầy đủ
├── system_erd.md                     # ERD diagram
├── follow/                           # Module follow (có thể là submodule)
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   │   ├── FollowCompany.java
│   │   └── FollowCompanyId.java
│   ├── repository/
│   │   └── FollowCompanyRepository.java
│   └── service/
├── ITing-backend/                    # Backend Spring Boot
│   ├── API_TEST_GUIDE.md
│   ├── API_TEST_REPORT.md
│   ├── build.gradle
│   ├── CLASS_DIAGRAM_GUIDE.md
│   ├── codebase_analysis.md.resolved
│   ├── DBEAVER_CONNECTION_GUIDE.md
│   ├── deploy.sh
│   ├── DEPLOYMENT_GUIDE.md
│   ├── DIAGRAM_VISUALIZATION_GUIDE.md
│   ├── DOCKER_SETUP_README.md
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── DOCS_ADMIN_SERVICE.md
│   ├── DOCS_AUTH_SERVICE.md
│   ├── DOCS_COMPANY_SERVICE.md
│   ├── DOCS_INFRASTRUCTURE.md
│   ├── DOCS_JOB_SERVICE.md
│   ├── DOCS_NOTIFICATION_SERVICE.md
│   ├── DOCS_USER_SERVICE.md
│   ├── entities.md
│   ├── ERD_ANALYSIS.md
│   ├── HELP.md
│   ├── JWT_REFRESH_TOKEN_GUIDE.md
│   ├── pom.xml
│   ├── PostgresqlExample.java
│   ├── PROJECT_OVERVIEW.md
│   ├── RBAC_API_TESTING_GUIDE.md
│   ├── RBAC_Class_Diagram.puml
│   ├── rbac_full_permissions.sql
│   ├── rbac_validation_rules.md
│   ├── REFRESH_TOKEN_FIX_SUMMARY.md
│   ├── render.yaml
│   ├── settings.gradle
│   ├── Simple_RBAC_Diagram.puml
│   ├── test_detailed_permissions.sh
│   ├── test_role_permissions.sh
│   ├── test-api.ps1
│   ├── test-db-connection.sh
│   ├── test-err.txt
│   ├── test-out.txt
│   ├── UNHAPPY_CASES_BUSINESS_LOGIC.md
│   ├── USE_CASE_ANALYSIS.md
│   ├── scraper/
│   │   ├── config_example.txt
│   │   ├── generated_jobs.sql
│   │   ├── itviec_data_generator.py
│   │   ├── itviec_scraper.py
│   │   ├── README.md
│   │   └── requirements.txt
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/iting/jobportal/
│   │   │   │   ├── ItingJobPortalApplication.java
│   │   │   │   ├── auth/          # Authentication & JWT
│   │   │   │   ├── admin/         # Admin functions
│   │   │   │   ├── core/          # Core RBAC
│   │   │   │   ├── job/           # Job management
│   │   │   │   ├── company/       # Company profiles
│   │   │   │   ├── user/          # User management
│   │   │   │   ├── userprofile/   # User profiles & CV
│   │   │   │   ├── messaging/     # Messaging
│   │   │   │   ├── social/        # Social features
│   │   │   │   ├── notification/  # Notifications
│   │   │   │   ├── config/        # Configurations
│   │   │   │   ├── common/        # Common utilities
│   │   │   │   ├── security/      # Security configs
│   │   │   │   └── webinfo/       # Web info
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── application-prod.properties
│   │   │       └── data.sql
│   │   └── test/
│   ├── target/                     # Build output
│   ├── upload/                     # Upload directories
│   └── file/                       # File handling
└── ITing-frontend/                 # Frontend React
    ├── package.json
    ├── playwright.config.js
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── webpack.config.js
    ├── e2e/                        # E2E tests
    ├── playwright-report/
    ├── public/
    ├── src/
    └── test-results/
```

## Các module chính
### Backend Modules
- **auth**: Đăng ký/đăng nhập, JWT, Refresh Token
- **admin**: Quản trị hệ thống, permissions
- **core**: RBAC Role/Permission services
- **job**: CRUD jobs, search, featured jobs
- **company**: Quản lý công ty, giấy tờ
- **user/userprofile**: Hồ sơ ứng viên, CV, skills, education
- **messaging**: Nhắn tin giữa users
- **social**: Tính năng xã hội
- **notification**: Hệ thống thông báo

### Frontend Pages/Features
- Public pages: Job listings, company profiles
- Candidate flow: Đăng ký, profile, apply jobs
- Employer flow: Post jobs, manage applications
- Admin: Manage users, companies, jobs
- Authentication: Login/register với Google OAuth

## Database Schema
Schema PostgreSQL với các bảng chính:
- **Account**: Email, password, role, status
- **Users**: Profile info, avatar, location
- **candidate_profiles**: Chi tiết profile ứng viên
- **Company**: Thông tin công ty
- **Job**: Việc làm
- **CV**: CV ứng viên với embeddings
- **Apply_form**: Ứng tuyển
- **Notification**: Thông báo
- **Education, Experience, Skill, Certificate**: Chi tiết CV
- **VN_location**: Địa điểm Việt Nam
- Và nhiều bảng khác cho messaging, social, reports

## API Endpoints (đầy đủ)
Dựa trên API_TEST_GUIDE.md và các docs service.

### Auth
- POST /api/auth/register: Đăng ký tài khoản mới
- POST /api/auth/login: Đăng nhập
- POST /api/auth/change-password: Đổi mật khẩu
- POST /api/auth/refresh-token: Gia hạn Access Token
- POST /api/auth/forgot-password: Quên mật khẩu

### User Profile
- GET /api/user/profile: Xem profile
- PUT /api/user/profile/basic: Cập nhật thông tin cơ bản
- PUT /api/user/profile/avatar: Cập nhật avatar
- DELETE /api/user/profile/avatar: Xóa avatar
- PUT /api/user/profile/description: Cập nhật mô tả
- PUT /api/user/profile/address: Cập nhật địa chỉ
- PUT /api/user/profile/birth-gender: Cập nhật ngày sinh & giới tính
- PUT /api/user/profile/contact: Cập nhật thông tin liên hệ
- PUT /api/user/profile/career: Cập nhật mục tiêu nghề nghiệp

### User Profile - Social Links
- GET /api/user/profile/social: Xem danh sách social links
- POST /api/user/profile/social: Thêm social link
- PUT /api/user/profile/social/{id}: Cập nhật social link
- DELETE /api/user/profile/social/{id}: Xóa social link

### User Profile - Education
- GET /api/user/profile/educations: Xem danh sách học vấn
- POST /api/user/profile/education: Thêm học vấn
- PUT /api/user/profile/education/{id}: Cập nhật học vấn
- DELETE /api/user/profile/education/{id}: Xóa học vấn

### User Profile - Skills
- GET /api/user/profile/skills: Xem danh sách kỹ năng
- POST /api/user/profile/skills: Thêm kỹ năng
- PUT /api/user/profile/skills/{id}: Cập nhật kỹ năng
- DELETE /api/user/profile/skills/{id}: Xóa kỹ năng

### User Profile - Certificates
- POST /api/user/profile/certificates: Thêm chứng chỉ
- PUT /api/user/profile/certificates/{id}: Cập nhật chứng chỉ
- DELETE /api/user/profile/certificates/{id}: Xóa chứng chỉ

### User Profile - Experience
- POST /api/user/profile/experience: Thêm kinh nghiệm
- PUT /api/user/profile/experience/{id}: Cập nhật kinh nghiệm
- DELETE /api/user/profile/experience/{id}: Xóa kinh nghiệm

### User Profile - Portfolio
- GET /api/user/profile/portfolio: Xem portfolio
- POST /api/user/profile/portfolio/link: Thêm portfolio link
- POST /api/user/profile/portfolio/file: Upload portfolio file
- DELETE /api/user/profile/portfolio/{id}: Xóa portfolio

### User Profile - CV
- GET /api/user/profile/cv: Xem danh sách CV
- POST /api/user/profile/cv: Upload CV
- PUT /api/user/profile/cv/{id}: Thay thế CV
- DELETE /api/user/profile/cv/{id}: Xóa CV
- POST /api/user/profile/cv/{id}/analyze: Phân tích CV bằng AI

### Companies
- GET /api/companies/{id}: Xem thông tin công ty
- PUT /api/companies/{id}/basic-info: Cập nhật thông tin cơ bản
- PUT /api/companies/{id}/representative: Cập nhật thông tin đại diện
- POST /api/companies/{id}/business-license: Upload giấy phép kinh doanh
- POST /api/companies/{id}/consent-document: Upload giấy ủy quyền
- POST /api/companies/{id}/verify-phone: Xác thực số điện thoại
- POST /api/companies/{id}/verify-license: Xác thực giấy phép

### Jobs
- GET /api/jobs/search: Tìm kiếm và lọc việc làm (Public)
- GET /api/jobs/{id}: Xem chi tiết việc làm
- GET /api/jobs/latest: Lấy việc làm mới nhất
- GET /api/jobs/hot: Lấy việc làm hot
- POST /api/jobs: Tạo việc làm mới (Employer)
- PUT /api/jobs/{id}: Cập nhật việc làm (Employer)
- DELETE /api/jobs/{id}: Xóa việc làm (Employer)
- POST /api/jobs/{id}/extend: Gia hạn việc làm (Employer)
- POST /api/jobs/{id}/close: Đóng việc làm (Employer)
- GET /api/jobs/my-jobs: Xem danh sách việc làm của tôi (Employer)

### Applications (Ứng tuyển)
#### Cho ứng viên:
- POST /api/applications/apply: Nộp đơn ứng tuyển
- POST /api/applications/{id}/withdraw: Rút đơn ứng tuyển
- GET /api/applications/my-applications: Xem danh sách đơn đã nộp
- GET /api/applications/check/{jobId}: Kiểm tra đã ứng tuyển job chưa

#### Cho nhà tuyển dụng:
- GET /api/applications/job/{jobId}: Xem danh sách đơn ứng tuyển của một job
- GET /api/applications/employer: Xem tất cả đơn ứng tuyển
- GET /api/applications/employer/search: Tìm kiếm và lọc đơn ứng tuyển
- GET /api/applications/{id}: Xem chi tiết đơn ứng tuyển
- PUT /api/applications/{id}/status: Cập nhật trạng thái đơn ứng tuyển
- POST /api/applications/{id}/accept: Chấp nhận ứng viên
- POST /api/applications/{id}/reject: Từ chối ứng viên
- POST /api/applications/{id}/shortlist: Đưa vào danh sách ngắn
- GET /api/applications/stats/employer: Thống kê đơn ứng tuyển (Employer)
- GET /api/applications/stats/job/{jobId}: Thống kê đơn ứng tuyển của một job

### Admin (từ DOCS_ADMIN_SERVICE.md)
- GET /api/admin/users: Danh sách users
- PUT /api/admin/users/{id}/status: Cập nhật trạng thái user
- GET /api/admin/companies: Danh sách companies
- PUT /api/admin/companies/{id}/status: Cập nhật trạng thái company
- GET /api/admin/jobs: Danh sách jobs
- PUT /api/admin/jobs/{id}/status: Cập nhật trạng thái job
- GET /api/admin/applications: Danh sách applications
- GET /api/admin/stats: Thống kê hệ thống
- POST /api/admin/permissions: Quản lý permissions
- GET /api/admin/roles: Danh sách roles

### Notifications (từ DOCS_NOTIFICATION_SERVICE.md)
- GET /api/notifications: Danh sách notifications
- PUT /api/notifications/{id}/read: Đánh dấu đã đọc
- DELETE /api/notifications/{id}: Xóa notification
- GET /api/notifications/unread-count: Số notification chưa đọc

### Messaging (từ DOCS_MESSAGING_SERVICE.md nếu có)
- POST /api/messages: Gửi message
- GET /api/messages/conversations: Danh sách conversations
- GET /api/messages/{conversationId}: Chi tiết conversation
- PUT /api/messages/{id}/read: Đánh dấu đã đọc

### Social (từ DOCS_SOCIAL_SERVICE.md nếu có)
- POST /api/social/follow/{userId}: Follow user
- DELETE /api/social/follow/{userId}: Unfollow user
- GET /api/social/followers: Danh sách followers
- GET /api/social/following: Danh sách following

### File Upload
- POST /api/file/upload: Upload file (có thể cho CV, avatar, etc.)
- DELETE /api/file/{id}: Xóa file

### Infrastructure
- GET /api/webinfo: Thông tin web
- GET /api/locations: Danh sách locations
- GET /api/categories: Danh sách categories

## Authentication & Authorization
- **JWT Access Token**: Expires nhanh, dùng cho API calls
- **Refresh Token**: Lưu DB, rotate khi refresh
- **RBAC**: Permissions như JOB_CREATE, USER_UPDATE, etc.
- Security filters kiểm tra authorities

## Setup & Run
### Backend
1. Setup PostgreSQL
2. Run schema.sql
3. Configure application.properties (DB, JWT secret)
4. Maven: mvn clean install
5. Run: mvn spring-boot:run

### Frontend
1. npm install
2. npm start (dev)
3. npm run build (production)

### Docker
- docker-compose up

### Testing
- Backend: mvn test
- Frontend: npm run test:e2e (Playwright)

## Deployment
- Render + Aiven PostgreSQL
- Docker image
- Scripts: deploy.sh, render.yaml

## AI Integration
- CV parsing với embeddings
- data_with_embeddings.sql chứa dữ liệu mẫu
- embeddings_update.sql để update

## Notes for AI
- Theo Spring Boot best practices: Constructor injection, @ConfigurationProperties, YAML configs
- Logging: SLF4J, parameterized
- Validation: JSR-380 annotations
- Security: Parameterized queries, input validation
- Frontend: React hooks, Redux for state, Axios interceptors cho auth
- Testing: Unit tests, E2E với Playwright
- Code organization: Feature-based packages