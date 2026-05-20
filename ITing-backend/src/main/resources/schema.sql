-- ============================================================================
-- ITing Job Portal - Database Schema
-- ============================================================================
-- Generated from: erd_mapping-Relational_schema.drawio.png
-- Generated on: March 15, 2026
-- Database: PostgreSQL 16+
-- Description: Complete database schema for ITing Job Portal application
-- ============================================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS Portfolio CASCADE;
DROP TABLE IF EXISTS Social_link CASCADE;
DROP TABLE IF EXISTS user_reports CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS report_accounts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS static_contents CASCADE;
DROP TABLE IF EXISTS Apply_form_user_to_job CASCADE;
DROP TABLE IF EXISTS Apply_form CASCADE;
DROP TABLE IF EXISTS Company_upload_job CASCADE;
DROP TABLE IF EXISTS user_save_job CASCADE;
DROP TABLE IF EXISTS User_contact_company CASCADE;
DROP TABLE IF EXISTS User_follow_company CASCADE;
DROP TABLE IF EXISTS Notification CASCADE;
DROP TABLE IF EXISTS Education CASCADE;
DROP TABLE IF EXISTS Certificate CASCADE;
DROP TABLE IF EXISTS Skill CASCADE;
DROP TABLE IF EXISTS Experience CASCADE;
DROP TABLE IF EXISTS CV CASCADE;
DROP TABLE IF EXISTS Job CASCADE;
DROP TABLE IF EXISTS candidate_profiles CASCADE;
DROP TABLE IF EXISTS Company CASCADE;
DROP TABLE IF EXISTS admin_accounts CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Account CASCADE;
DROP TABLE IF EXISTS VN_location CASCADE;
DROP TABLE IF EXISTS web_info CASCADE;
DROP TABLE IF EXISTS Social_network CASCADE;
DROP TABLE IF EXISTS Ban_history CASCADE;
DROP TABLE IF EXISTS company_audit_log CASCADE;
ALTER TABLE IF EXISTS social_link DROP CONSTRAINT IF EXISTS uk_social_profile_platform;

-- ============================================================================
-- REFERENCE DATA TABLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS web_info (
    Id BIGSERIAL PRIMARY KEY,
    Email VARCHAR(255),
    Phone_num VARCHAR(20),
    Address TEXT
);

-- Table: Social_network
-- Description: Social media platform definitions
CREATE TABLE Social_network (
    Id BIGSERIAL PRIMARY KEY,
    Web_infor_id BIGINT,
    Name VARCHAR(100),
    Url TEXT,
    CONSTRAINT fk_social_web FOREIGN KEY (Web_infor_id) REFERENCES web_info(Id) ON DELETE CASCADE
);

-- Table: VN_location
-- Description: Vietnam location hierarchy
CREATE TABLE VN_location (
    Loc_id BIGSERIAL PRIMARY KEY,
    Province_name VARCHAR(100),
    Province_name_en VARCHAR(100),
    Region VARCHAR(50)
);

-- ============================================================================
-- AUTHENTICATION & USER MANAGEMENT
-- ============================================================================

-- Table: Account
CREATE TABLE Account (
    Id BIGSERIAL PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL DEFAULT 'CANDIDATE',
    Status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

-- Table: Users
CREATE TABLE Users (
    Id BIGINT PRIMARY KEY,
    Phone_num VARCHAR(20),
    Loc_id BIGINT,
    Cv_embedding TEXT,
    full_name VARCHAR(255) NOT NULL,
    Avatar TEXT,
    Last_update TIMESTAMP,
    CONSTRAINT fk_user_account FOREIGN KEY (Id) REFERENCES Account(Id) ON DELETE CASCADE,
    CONSTRAINT fk_user_location FOREIGN KEY (Loc_id) REFERENCES VN_location(Loc_id) ON DELETE SET NULL
);

-- Table: candidate_profiles
CREATE TABLE candidate_profiles (
    id BIGINT PRIMARY KEY,
    headline VARCHAR(255),
    location VARCHAR(255),
    total_experience_years INTEGER,
    education_summary VARCHAR(255),
    short_bio TEXT,
    employment_status VARCHAR(50),
    is_open_to_work BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (id) REFERENCES Users(Id) ON DELETE CASCADE
);
CREATE TABLE Company (
    company_id BIGINT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Web_link TEXT,
    Address VARCHAR(500),
    Logo TEXT,
    Description TEXT,
    Company_email VARCHAR(255),
    Industry VARCHAR(255),
    Company_size VARCHAR(100),
    Phone VARCHAR(20),
    Representative_name VARCHAR(255),
    Representative_gender VARCHAR(10),
    Representative_phone VARCHAR(20),
    Account_email VARCHAR(255),
    Tax_code VARCHAR(50),

    Business_license_file_url TEXT,
    Business_license_document_type VARCHAR(100),
    Business_license_preview_url TEXT,
    Consent_document_file_url TEXT,
    Consent_document_confirmed BOOLEAN DEFAULT FALSE,
    Consent_confirmed_at TIMESTAMP,
    Consent_document_version VARCHAR(50),

    Follower_count BIGINT DEFAULT 0,
    Verification_level VARCHAR(50) DEFAULT 'UNVERIFIED',
    Company_info_update_status VARCHAR(50) DEFAULT 'DRAFT',
    Last_update_request_date TIMESTAMP,
    Last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Active BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_company_account
        FOREIGN KEY (company_id) REFERENCES Account(Id) ON DELETE CASCADE
);
-- Table: admin_accounts
CREATE TABLE admin_accounts (
    id BIGINT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    last_login_ip VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    notes TEXT,
    CONSTRAINT fk_admin_account FOREIGN KEY (id) REFERENCES Account(Id) ON DELETE CASCADE
);

-- Table: Job
CREATE TABLE Job (
    Id BIGSERIAL PRIMARY KEY,
    Company_id BIGINT NOT NULL,

    -- BASIC
    Title VARCHAR(255) NOT NULL,
    Position VARCHAR(255),
    Tech_required TEXT,
    Job_type VARCHAR(50),
    Experience_level VARCHAR(50),
    Working_days VARCHAR(255),

    -- SALARY
    Min_salary DECIMAL(15,2),
    Max_salary DECIMAL(15,2),
    Salary_type VARCHAR(50),

    -- QUANTITY
    Max_accept INTEGER DEFAULT 0,
    Current_accepted INTEGER DEFAULT 0,

    -- DATE
    Due_date DATE,

    -- LOCATION
    Province VARCHAR(100),
    Ward VARCHAR(100),
    Address VARCHAR(500),
    Location VARCHAR(255),
    Loc_id BIGINT,

    -- CONTENT
    Description TEXT,
    Responsibilities TEXT,
    Requirements TEXT,
    Benefits TEXT,

    -- SYSTEM
    View_count INTEGER DEFAULT 0,
    Application_count INTEGER DEFAULT 0,
    Featured BOOLEAN DEFAULT FALSE,
    Status VARCHAR(50) DEFAULT 'DRAFT',

    -- REVIEW
    Review_reason TEXT,
    Reviewed_by BIGINT,
    Reviewed_at TIMESTAMP,

    -- AUDIT
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- ADVANCED
    Job_embedding TEXT,

    CONSTRAINT fk_job_company
        FOREIGN KEY (Company_id) REFERENCES Company(company_id),

    CONSTRAINT fk_job_location
        FOREIGN KEY (Loc_id) REFERENCES VN_location(Loc_id) ON DELETE SET NULL,

    CONSTRAINT fk_job_reviewed_by_admin
        FOREIGN KEY (Reviewed_by) REFERENCES admin_accounts(id) ON DELETE SET NULL
);

-- ============================================================================
-- ACCOUNT SECURITY & reporting
-- ============================================================================

CREATE TABLE Ban_history (
    Id BIGSERIAL PRIMARY KEY,
    Target_account_id BIGINT NOT NULL,
    Admin_account_id BIGINT NOT NULL,
    Reason TEXT,
    Banned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Expired_at TIMESTAMP,
    Is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_ban_target_account FOREIGN KEY (Target_account_id) REFERENCES Account(Id) ON DELETE CASCADE,
    CONSTRAINT fk_ban_admin FOREIGN KEY (Admin_account_id) REFERENCES Account(Id) ON DELETE CASCADE
);

CREATE TABLE user_reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    reported_user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reason VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    admin_note TEXT,
    handled_by BIGINT,
    handled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE report_accounts (
    id BIGSERIAL PRIMARY KEY,
    reported_user_id BIGINT NOT NULL,
    reporter_id BIGINT,
    report_type VARCHAR(30) NOT NULL,
    violation VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    description TEXT,
    handled_by BIGINT,
    handled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_report_acc_user FOREIGN KEY (reported_user_id) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT fk_report_acc_admin FOREIGN KEY (handled_by) REFERENCES admin_accounts(id) ON DELETE SET NULL
);

-- ============================================================================
-- USER-COMPANY INTERACTIONS
-- ============================================================================

CREATE TABLE User_follow_company (
    User_id BIGINT NOT NULL,
    Company_id BIGINT NOT NULL,
    Notification_id BIGINT,
    Follow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (User_id, Company_id),
    CONSTRAINT fk_follow_user FOREIGN KEY (User_id) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT fk_follow_company FOREIGN KEY (Company_id) REFERENCES Company(company_id) ON DELETE CASCADE
);

CREATE TABLE User_contact_company (
    Message_id BIGSERIAL PRIMARY KEY,
    User_id BIGINT NOT NULL,
    Company_id BIGINT NOT NULL,
    Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contact_user FOREIGN KEY (User_id) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT fk_contact_company FOREIGN KEY (Company_id) REFERENCES Company(company_id) ON DELETE CASCADE
);

CREATE TABLE Notification (
    Id SERIAL PRIMARY KEY,
    Content TEXT NOT NULL,
    Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE User_follow_company ADD CONSTRAINT fk_follow_notification FOREIGN KEY (Notification_id) REFERENCES Notification(Id) ON DELETE SET NULL;

-- ============================================================================
-- JOBS & APPLICATIONS
-- ============================================================================

CREATE TABLE Company_upload_job (
    job_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    admin_id BIGINT,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    note TEXT,
    PRIMARY KEY (job_id, company_id),
    CONSTRAINT fk_upload_job FOREIGN KEY (job_id) REFERENCES Job(Id) ON DELETE CASCADE,
    CONSTRAINT fk_upload_company FOREIGN KEY (company_id) REFERENCES Company(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_upload_admin FOREIGN KEY (admin_id) REFERENCES admin_accounts(id) ON DELETE SET NULL
);

CREATE TABLE user_save_job (
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, job_id),
    CONSTRAINT fk_save_user FOREIGN KEY (user_id) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT fk_save_job FOREIGN KEY (job_id) REFERENCES Job(Id) ON DELETE CASCADE
);

-- Table: CV
CREATE TABLE CV (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    Title VARCHAR(255),
    File_path TEXT NOT NULL,
    Cv_status VARCHAR(50),
    Is_default BOOLEAN DEFAULT FALSE,
    Upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cv_profile FOREIGN KEY (profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

CREATE TABLE Apply_form (
    Id BIGSERIAL PRIMARY KEY,
    User_id BIGINT NOT NULL,
    Cv_id BIGINT, -- ✅ thêm cột này
    Cv_title VARCHAR(255),
    Applicant_name VARCHAR(255),
    Introduction TEXT,

    CONSTRAINT fk_apply_user
        FOREIGN KEY (User_id) REFERENCES Users(Id) ON DELETE CASCADE,

    CONSTRAINT fk_apply_cv
        FOREIGN KEY (Cv_id) REFERENCES CV(Id) ON DELETE SET NULL
);
CREATE TABLE Apply_form_user_to_job (
    Job_id BIGINT NOT NULL,
    Apply_form_id BIGINT NOT NULL,
    Time_sent TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'PENDING',
    PRIMARY KEY (Job_id, Apply_form_id),
    CONSTRAINT fk_apply_job FOREIGN KEY (Job_id) REFERENCES Job(Id) ON DELETE CASCADE,
    CONSTRAINT fk_apply_form FOREIGN KEY (Apply_form_id) REFERENCES Apply_form(Id) ON DELETE CASCADE
);

-- ============================================================================
-- SYSTEM & CONTENT
-- ============================================================================

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    description VARCHAR(255),
    icon VARCHAR(500),
    parent_id BIGINT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE static_contents (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    meta_description VARCHAR(255),
    meta_keywords VARCHAR(255),
    thumbnail_url VARCHAR(500),
    published BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    author_id BIGINT,
    view_count BIGINT DEFAULT 0,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    description VARCHAR(500),
    ip_address VARCHAR(50),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE company_audit_log (
    id BIGSERIAL PRIMARY KEY,

    company_id BIGINT NOT NULL,

    action VARCHAR(50) NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50),

    reason TEXT,
    note TEXT,

    actor VARCHAR(255), -- email admin
    actor_id BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_company_audit
        FOREIGN KEY (company_id) REFERENCES Company(company_id)
        ON DELETE CASCADE
);

-- ============================================================================
-- USER PROFILE COMPONENTS (Mapped to entities in userprofile package)
-- ============================================================================



-- Table: Education
CREATE TABLE Education (
    Id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    School_name VARCHAR(255),
    Major VARCHAR(255),
    Area_of_study VARCHAR(255),
    Degree VARCHAR(100),
    Start_date DATE,
    End_date DATE,
    Description TEXT,
    CONSTRAINT fk_education_profile FOREIGN KEY (profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- Table: Certificate
CREATE TABLE Certificate (
    Id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    Title VARCHAR(255),
    Issuing_organization VARCHAR(255),
    Issue_date DATE,
    Expiration_date DATE,
    Credential_id VARCHAR(255),
    Credential_url TEXT,
    Does_not_expire BOOLEAN,
    CONSTRAINT fk_certificate_profile FOREIGN KEY (profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- Table: Skill
CREATE TABLE Skill (
    Id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    Name VARCHAR(100),
    Level VARCHAR(50),
    CONSTRAINT fk_skill_profile FOREIGN KEY (profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- Table: Experience
CREATE TABLE Experience (
    Id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    Company_name VARCHAR(255),
    Position VARCHAR(255),
    Start_date DATE,
    End_date DATE,
    Is_current BOOLEAN,
    Description TEXT,
    CONSTRAINT fk_experience_profile FOREIGN KEY (profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS social_link CASCADE;
DROP TABLE IF EXISTS sociallink CASCADE;
-- Table: SocialLink
CREATE TABLE social_link (
    Id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    Platform VARCHAR(50) NOT NULL,
    Url TEXT NOT NULL,
    CONSTRAINT fk_social_profile FOREIGN KEY (profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    CONSTRAINT uk_social_profile_platform UNIQUE (profile_id, Platform)
);

-- Table: Portfolio
CREATE TABLE Portfolio (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    title VARCHAR(255),
    url TEXT,
    description TEXT,
    CONSTRAINT fk_portfolio_profile FOREIGN KEY (profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
---- ============================================================================
--
--CREATE INDEX idx_user_location ON Users(Loc_id);
--CREATE INDEX idx_user_last_update ON Users(Last_update);
--CREATE INDEX idx_profile_updated_at ON candidate_profiles(updated_at);
--CREATE INDEX idx_company_last_update ON Company(Last_update);
--CREATE INDEX idx_job_location ON Job(Loc_id);
--CREATE INDEX idx_job_status ON Job(Status);
--CREATE INDEX idx_job_due_date ON Job(Due_date);
--CREATE INDEX idx_job_last_update ON Job(Last_update);
--
---- Relationship table indexes
--CREATE INDEX idx_follow_user ON User_follow_company(User_id);
--CREATE INDEX idx_follow_company ON User_follow_company(Company_id);
--CREATE INDEX idx_save_user ON user_save_job(user_id);
--CREATE INDEX idx_save_job ON user_save_job(job_id);
--CREATE INDEX idx_upload_job ON Company_upload_job(Job_id);
--CREATE INDEX idx_apply_job ON Apply_form_user_to_job(Job_id);
--CREATE INDEX idx_notification_time ON Notification(Time);
--CREATE INDEX idx_location_province ON VN_location(Province_name);


-- ============================================================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================================================

-- Account / Admin / Company
CREATE INDEX IF NOT EXISTS idx_account_role ON Account(Role);
CREATE INDEX IF NOT EXISTS idx_account_status ON Account(Status);
CREATE INDEX IF NOT EXISTS idx_admin_active ON admin_accounts(active);
CREATE INDEX IF NOT EXISTS idx_company_status ON Company(Company_info_update_status);
CREATE INDEX IF NOT EXISTS idx_company_verification_level ON Company(Verification_level);
CREATE INDEX IF NOT EXISTS idx_company_active ON Company(Active);
CREATE INDEX IF NOT EXISTS idx_company_name ON Company(Name);
CREATE INDEX IF NOT EXISTS idx_company_tax_code ON Company(Tax_code);
CREATE INDEX IF NOT EXISTS idx_company_email ON Company(Company_email);
CREATE INDEX IF NOT EXISTS idx_company_account_email ON Company(Account_email);

-- Company audit log
CREATE INDEX IF NOT EXISTS idx_company_audit_company_id ON company_audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_company_audit_created_at ON company_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_company_audit_action ON company_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_company_audit_actor_id ON company_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_company_audit_company_created_at ON company_audit_log(company_id, created_at DESC);

-- Activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id ON activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created_at ON activity_logs(user_id, created_at DESC);

-- Users / candidate profile
CREATE INDEX IF NOT EXISTS idx_users_phone ON Users(Phone_num);
CREATE INDEX IF NOT EXISTS idx_users_full_name ON Users(full_name);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_open_to_work ON candidate_profiles(is_open_to_work);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_location ON candidate_profiles(location);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_employment_status ON candidate_profiles(employment_status);

-- Job
CREATE INDEX IF NOT EXISTS idx_job_company_id ON Job(Company_id);
CREATE INDEX IF NOT EXISTS idx_job_reviewed_by ON Job(Reviewed_by);
CREATE INDEX IF NOT EXISTS idx_job_featured ON Job(Featured);
CREATE INDEX IF NOT EXISTS idx_job_company_status ON Job(Company_id, Status);
CREATE INDEX IF NOT EXISTS idx_job_status_due_date ON Job(Status, Due_date);
CREATE INDEX IF NOT EXISTS idx_job_company_last_update ON Job(Company_id, Last_update DESC);
CREATE INDEX IF NOT EXISTS idx_job_province ON Job(Province);
CREATE INDEX IF NOT EXISTS idx_job_position ON Job(Position);
CREATE INDEX IF NOT EXISTS idx_job_job_type ON Job(Job_type);
CREATE INDEX IF NOT EXISTS idx_job_experience_level ON Job(Experience_level);

-- Company upload job
CREATE INDEX IF NOT EXISTS idx_company_upload_company_id ON Company_upload_job(company_id);
CREATE INDEX IF NOT EXISTS idx_company_upload_admin_id ON Company_upload_job(admin_id);
CREATE INDEX IF NOT EXISTS idx_company_upload_status ON Company_upload_job(status);
CREATE INDEX IF NOT EXISTS idx_company_upload_time ON Company_upload_job(time);

-- Apply form / applications
CREATE INDEX IF NOT EXISTS idx_apply_form_user_id ON Apply_form(User_id);
CREATE INDEX IF NOT EXISTS idx_apply_form_cv_id ON Apply_form(Cv_id);
CREATE INDEX IF NOT EXISTS idx_apply_form_user_to_job_apply_form_id ON Apply_form_user_to_job(Apply_form_id);
CREATE INDEX IF NOT EXISTS idx_apply_form_user_to_job_status ON Apply_form_user_to_job(status);
CREATE INDEX IF NOT EXISTS idx_apply_form_user_to_job_time_sent ON Apply_form_user_to_job(Time_sent);
CREATE INDEX IF NOT EXISTS idx_apply_form_job_status ON Apply_form_user_to_job(Job_id, status);

-- CV / profile components
CREATE INDEX IF NOT EXISTS idx_cv_profile_id ON CV(profile_id);
CREATE INDEX IF NOT EXISTS idx_cv_is_default ON CV(Is_default);
CREATE INDEX IF NOT EXISTS idx_cv_upload_time ON CV(Upload_time);

CREATE INDEX IF NOT EXISTS idx_education_profile_id ON Education(profile_id);
CREATE INDEX IF NOT EXISTS idx_certificate_profile_id ON Certificate(profile_id);
CREATE INDEX IF NOT EXISTS idx_skill_profile_id ON Skill(profile_id);
CREATE INDEX IF NOT EXISTS idx_experience_profile_id ON Experience(profile_id);
CREATE INDEX IF NOT EXISTS idx_social_link_profile_id ON social_link(profile_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_profile_id ON Portfolio(profile_id);

-- User-company interactions
CREATE INDEX IF NOT EXISTS idx_user_contact_company_user_id ON User_contact_company(User_id);
CREATE INDEX IF NOT EXISTS idx_user_contact_company_company_id ON User_contact_company(Company_id);
CREATE INDEX IF NOT EXISTS idx_user_contact_company_time ON User_contact_company(Time);

-- Reports / ban history
CREATE INDEX IF NOT EXISTS idx_ban_history_target_account_id ON Ban_history(Target_account_id);
CREATE INDEX IF NOT EXISTS idx_ban_history_admin_account_id ON Ban_history(Admin_account_id);
CREATE INDEX IF NOT EXISTS idx_ban_history_is_active ON Ban_history(Is_active);
CREATE INDEX IF NOT EXISTS idx_ban_history_banned_at ON Ban_history(Banned_at);

CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_id ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user_id ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_handled_by ON user_reports(handled_by);
CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON user_reports(created_at);

CREATE INDEX IF NOT EXISTS idx_report_accounts_reported_user_id ON report_accounts(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_report_accounts_reporter_id ON report_accounts(reporter_id);
CREATE INDEX IF NOT EXISTS idx_report_accounts_status ON report_accounts(status);
CREATE INDEX IF NOT EXISTS idx_report_accounts_handled_by ON report_accounts(handled_by);
CREATE INDEX IF NOT EXISTS idx_report_accounts_created_at ON report_accounts(created_at);

-- Content / categories
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);

CREATE INDEX IF NOT EXISTS idx_static_contents_type ON static_contents(type);
CREATE INDEX IF NOT EXISTS idx_static_contents_published ON static_contents(published);
CREATE INDEX IF NOT EXISTS idx_static_contents_author_id ON static_contents(author_id);
CREATE INDEX IF NOT EXISTS idx_static_contents_published_at ON static_contents(published_at);

-- Reference tables
CREATE INDEX IF NOT EXISTS idx_social_network_web_info_id ON Social_network(Web_infor_id);
CREATE INDEX IF NOT EXISTS idx_vn_location_region ON VN_location(Region);
-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
