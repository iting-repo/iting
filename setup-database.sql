-- ============================================================================
-- ITing Job Portal - Complete Database Setup
-- ============================================================================
-- This script combines all Flyway migrations into a single executable file
-- Run this script on PostgreSQL 16+ to create the complete database
-- ============================================================================

-- Create database (run this separately as superuser if needed)
-- CREATE DATABASE iting_job_portal;
-- \c iting_job_portal

-- ============================================================================
-- V1: Initial Schema
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
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS job_review_history CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS company_industries CASCADE;
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

CREATE TABLE Social_network (
    Id BIGSERIAL PRIMARY KEY,
    Web_infor_id BIGINT,
    Name VARCHAR(100),
    Url TEXT,
    CONSTRAINT fk_social_web FOREIGN KEY (Web_infor_id) REFERENCES web_info(Id) ON DELETE CASCADE
);

CREATE TABLE VN_location (
    Loc_id BIGSERIAL PRIMARY KEY,
    Province_name VARCHAR(100),
    Province_name_en VARCHAR(100),
    Region VARCHAR(50)
);

-- ============================================================================
-- AUTHENTICATION & USER MANAGEMENT
-- ============================================================================
CREATE TABLE Account (
    Id BIGSERIAL PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL DEFAULT 'CANDIDATE',
    Status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

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

CREATE TABLE Job (
    Id BIGSERIAL PRIMARY KEY,
    Company_id BIGINT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Position VARCHAR(255),
    Tech_required TEXT,
    Job_type VARCHAR(50),
    Experience_level VARCHAR(50),
    Working_days VARCHAR(255),
    Min_salary DECIMAL(15,2),
    Max_salary DECIMAL(15,2),
    Salary_type VARCHAR(50),
    Max_accept INTEGER DEFAULT 0,
    Current_accepted INTEGER DEFAULT 0,
    Due_date DATE,
    Province VARCHAR(100),
    Ward VARCHAR(100),
    Address VARCHAR(500),
    Location VARCHAR(255),
    Loc_id BIGINT,
    Description TEXT,
    Responsibilities TEXT,
    Requirements TEXT,
    Benefits TEXT,
    View_count INTEGER DEFAULT 0,
    Application_count INTEGER DEFAULT 0,
    Featured BOOLEAN DEFAULT FALSE,
    Status VARCHAR(50) DEFAULT 'DRAFT',
    Review_reason TEXT,
    Reviewed_by BIGINT,
    Reviewed_at TIMESTAMP,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Job_embedding TEXT,
    CONSTRAINT fk_job_company
        FOREIGN KEY (Company_id) REFERENCES Company(company_id),
    CONSTRAINT fk_job_location
        FOREIGN KEY (Loc_id) REFERENCES VN_location(Loc_id) ON DELETE SET NULL,
    CONSTRAINT fk_job_reviewed_by_admin
        FOREIGN KEY (Reviewed_by) REFERENCES admin_accounts(id) ON DELETE SET NULL
);

-- ============================================================================
-- ACCOUNT SECURITY & REPORTING
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
    Content TEXT,
    Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recipient_id BIGINT NOT NULL,
    recipient_type VARCHAR(20) NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    action_url VARCHAR(255)
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
    Cv_id BIGINT,
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
    actor VARCHAR(255),
    actor_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_company_audit
        FOREIGN KEY (company_id) REFERENCES Company(company_id)
        ON DELETE CASCADE
);

-- ============================================================================
-- USER PROFILE COMPONENTS
-- ============================================================================
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

CREATE TABLE Skill (
    Id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    Name VARCHAR(100),
    Level VARCHAR(50),
    CONSTRAINT fk_skill_profile FOREIGN KEY (profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

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

CREATE TABLE social_link (
    Id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    Platform VARCHAR(50) NOT NULL,
    Url TEXT NOT NULL,
    CONSTRAINT fk_social_profile FOREIGN KEY (profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    CONSTRAINT uk_social_profile_platform UNIQUE (profile_id, Platform)
);

CREATE TABLE Portfolio (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    title VARCHAR(255),
    url TEXT,
    description TEXT,
    CONSTRAINT fk_portfolio_profile FOREIGN KEY (profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- ============================================================================
-- V3: Conversations Table
-- ============================================================================
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    participant1_id BIGINT NOT NULL,
    participant2_id BIGINT NOT NULL,
    last_message_id BIGINT,
    last_message_content TEXT,
    last_message_time TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE INDEX idx_conv_p1 ON conversations(participant1_id);
CREATE INDEX idx_conv_p2 ON conversations(participant2_id);
CREATE INDEX idx_conv_last_time ON conversations(last_message_time);

-- ============================================================================
-- V4: Job Review History Table
-- ============================================================================
CREATE TABLE job_review_history (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor VARCHAR(255) NOT NULL,
    "timestamp" TIMESTAMP NOT NULL,
    note TEXT,
    CONSTRAINT fk_job_review_history_job
        FOREIGN KEY (job_id) REFERENCES Job(Id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_job_review_history_job_id ON job_review_history(job_id);
CREATE INDEX IF NOT EXISTS idx_job_review_history_action ON job_review_history(action);
CREATE INDEX IF NOT EXISTS idx_job_review_history_timestamp ON job_review_history("timestamp");
CREATE INDEX IF NOT EXISTS idx_job_review_history_job_timestamp ON job_review_history(job_id, "timestamp" DESC);

-- ============================================================================
-- V5: Messages Table
-- ============================================================================
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    receiver_id BIGINT NOT NULL,
    receiver_type VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_is_read ON messages(conversation_id, is_read);

-- ============================================================================
-- V7: Refresh Tokens Table
-- ============================================================================
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_id VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    token TEXT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    device_info VARCHAR(255),
    ip_address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- V8: Account Audit and Last Login Columns
-- ============================================================================
ALTER TABLE Account
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- ============================================================================
-- V10: Company Industries Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_industries (
    company_id BIGINT NOT NULL,
    industry VARCHAR(255) NOT NULL,
    CONSTRAINT fk_company_industries_company FOREIGN KEY (company_id) REFERENCES Company(company_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_company_industries_company_id ON company_industries(company_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
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
CREATE INDEX IF NOT EXISTS idx_company_audit_company_id ON company_audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_company_audit_created_at ON company_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_company_audit_action ON company_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_company_audit_actor_id ON company_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_company_audit_company_created_at ON company_audit_log(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id ON activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created_at ON activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_phone ON Users(Phone_num);
CREATE INDEX IF NOT EXISTS idx_users_full_name ON Users(full_name);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_open_to_work ON candidate_profiles(is_open_to_work);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_location ON candidate_profiles(location);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_employment_status ON candidate_profiles(employment_status);
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
CREATE INDEX IF NOT EXISTS idx_company_upload_company_id ON Company_upload_job(company_id);
CREATE INDEX IF NOT EXISTS idx_company_upload_admin_id ON Company_upload_job(admin_id);
CREATE INDEX IF NOT EXISTS idx_company_upload_status ON Company_upload_job(status);
CREATE INDEX IF NOT EXISTS idx_company_upload_time ON Company_upload_job(time);
CREATE INDEX IF NOT EXISTS idx_apply_form_user_id ON Apply_form(User_id);
CREATE INDEX IF NOT EXISTS idx_apply_form_cv_id ON Apply_form(Cv_id);
CREATE INDEX IF NOT EXISTS idx_apply_form_user_to_job_apply_form_id ON Apply_form_user_to_job(Apply_form_id);
CREATE INDEX IF NOT EXISTS idx_apply_form_user_to_job_status ON Apply_form_user_to_job(status);
CREATE INDEX IF NOT EXISTS idx_apply_form_user_to_job_time_sent ON Apply_form_user_to_job(Time_sent);
CREATE INDEX IF NOT EXISTS idx_apply_form_job_status ON Apply_form_user_to_job(Job_id, status);
CREATE INDEX IF NOT EXISTS idx_cv_profile_id ON CV(profile_id);
CREATE INDEX IF NOT EXISTS idx_cv_is_default ON CV(Is_default);
CREATE INDEX IF NOT EXISTS idx_cv_upload_time ON CV(Upload_time);
CREATE INDEX IF NOT EXISTS idx_education_profile_id ON Education(profile_id);
CREATE INDEX IF NOT EXISTS idx_certificate_profile_id ON Certificate(profile_id);
CREATE INDEX IF NOT EXISTS idx_skill_profile_id ON Skill(profile_id);
CREATE INDEX IF NOT EXISTS idx_experience_profile_id ON Experience(profile_id);
CREATE INDEX IF NOT EXISTS idx_social_link_profile_id ON social_link(profile_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_profile_id ON Portfolio(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_contact_company_user_id ON User_contact_company(User_id);
CREATE INDEX IF NOT EXISTS idx_user_contact_company_company_id ON User_contact_company(Company_id);
CREATE INDEX IF NOT EXISTS idx_user_contact_company_time ON User_contact_company(Time);
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
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_static_contents_type ON static_contents(type);
CREATE INDEX IF NOT EXISTS idx_static_contents_published ON static_contents(published);
CREATE INDEX IF NOT EXISTS idx_static_contents_author_id ON static_contents(author_id);
CREATE INDEX IF NOT EXISTS idx_static_contents_published_at ON static_contents(published_at);
CREATE INDEX IF NOT EXISTS idx_social_network_web_info_id ON Social_network(Web_infor_id);
CREATE INDEX IF NOT EXISTS idx_vn_location_region ON VN_location(Region);

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================
SET session_replication_role = 'replica';

-- Web Information
INSERT INTO web_info (email, phone_num, address) VALUES
    ('contact@iting.vn', '0281234567', '123 Nguyen Hue, Q1, TP.HCM'),
    ('support@iting.vn', '0287654321', '456 Le Loi, Q1, TP.HCM'),
    ('hr@fpt.com.vn', '0243123456', 'FPT Software, KCN Hoa Lac, Ha Noi');

INSERT INTO Social_network (Web_infor_id, Name, Url) VALUES
    (1,'Facebook','https://facebook.com/iting'),
    (1,'LinkedIn','https://linkedin.com/company/iting'),
    (2,'Github','https://github.com/iting');

INSERT INTO VN_location (Loc_id, Province_name, Province_name_en, Region) VALUES
(1, 'Hà Nội', 'Hanoi', 'Northern'),
(2, 'Thành phố Hồ Chí Minh', 'Ho Chi Minh City', 'Southern'),
(3, 'Đà Nẵng', 'Da Nang', 'Central'),
(4, 'Hải Phòng', 'Hai Phong', 'Northern'),
(5, 'Cần Thơ', 'Can Tho', 'Mekong Delta'),
(6, 'Bình Dương', 'Binh Duong', 'Southern'),
(7, 'Đồng Nai', 'Dong Nai', 'Southern'),
(8, 'Khánh Hòa', 'Khanh Hoa', 'Central'),
(9, 'Nghệ An', 'Nghe An', 'Central'),
(10, 'Thừa Thiên Huế', 'Thua Thien Hue', 'Central');

-- Accounts
INSERT INTO Account (Id, Email, Password, Role, Status) VALUES
(1, 'admin@iting.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'ADMIN', 'ACTIVE'),
(2, 'superadmin@iting.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'ADMIN', 'ACTIVE'),
(3, 'moderator@iting.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'ADMIN', 'ACTIVE'),
(11, 'hr@fpt.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'COMPANY', 'ACTIVE'),
(12, 'hr@vng.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'COMPANY', 'ACTIVE'),
(13, 'hr@vingroup.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'COMPANY', 'ACTIVE'),
(14, 'hr@tiki.vn', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'COMPANY', 'ACTIVE'),
(15, 'hr@shopee.vn', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'COMPANY', 'BANNED'),
(101, 'nguyenvana@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'USER', 'ACTIVE'),
(102, 'tranthib@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'USER', 'ACTIVE'),
(103, 'levanc@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'USER', 'BANNED'),
(104, 'phamthid@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'USER', 'ACTIVE'),
(105, 'hoangvane@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'USER', 'ACTIVE');

-- Admin accounts
INSERT INTO admin_accounts (id, full_name, active) VALUES
(1, 'System Admin', TRUE),
(2, 'Super Admin', TRUE),
(3, 'Content Moderator', TRUE);

-- Ban history
INSERT INTO Ban_history (Target_account_id, Admin_account_id, Reason, Banned_at, Expired_at, Is_active) VALUES
(15, 1, 'Spam tin tuyển dụng lừa đảo, không cung cấp giấy phép kinh doanh hợp lệ.', CURRENT_TIMESTAMP, NULL, TRUE),
(103, 2, 'Sử dụng ngôn từ không chuẩn mực trong bình luận và tin nhắn.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE);

-- Users
INSERT INTO Users (Id, Phone_num, Loc_id, full_name, Avatar, Last_update) VALUES
(101, '0901111111', 2, 'Nguyen Van A', 'https://i.pravatar.cc/150?img=1', CURRENT_TIMESTAMP),
(102, '0902222222', 2, 'Tran Thi B', 'https://i.pravatar.cc/150?img=5', CURRENT_TIMESTAMP),
(103, '0903333333', 1, 'Le Van C', 'https://i.pravatar.cc/150?img=3', CURRENT_TIMESTAMP),
(104, '0904444444', 2, 'Pham Thi D', 'https://i.pravatar.cc/150?img=9', CURRENT_TIMESTAMP),
(105, '0905555555', 1, 'Hoang Van E', 'https://i.pravatar.cc/150?img=11', CURRENT_TIMESTAMP);

-- Candidate profiles
INSERT INTO candidate_profiles (id, headline, location, total_experience_years, education_summary, short_bio, employment_status, is_open_to_work, updated_at) VALUES
(101, 'Senior Java Backend Developer', 'Quận 1, TP. Hồ Chí Minh', 5, 'Bách Khoa TP.HCM', 'Đam mê xây dựng hệ thống scale lớn...', 'ACTIVELY_LOOKING', TRUE, CURRENT_TIMESTAMP),
(102, 'Frontend lead React/Vue', 'Quận 7, TP. Hồ Chí Minh', 4, 'Đại học FPT', 'Chuyên gia xây dựng UI/UX hiện đại...', 'OPEN_TO_OPPORTUNITIES', TRUE, CURRENT_TIMESTAMP),
(103, 'DevOps Engineer Professional', 'Cầu Giấy, Hà Nội', 3, 'Bách Khoa Hà Nội', 'Kinh nghiệm triển khai CI/CD, K8s...', 'NOT_LOOKING', FALSE, CURRENT_TIMESTAMP),
(104, 'Fullstack Developer (JS/Python)', 'Quận 2, TP. Hồ Chí Minh', 2, 'UIT', 'Thích làm việc với startup...', 'ACTIVELY_LOOKING', TRUE, CURRENT_TIMESTAMP),
(105, 'Data Scientist / ML Engineer', 'Đống Đa, Hà Nội', 6, 'Đại học Tổng Hợp', 'Nghiên cứu AI và Big Data...', 'FREELANCE_AVAILABLE', TRUE, CURRENT_TIMESTAMP);

-- Companies
INSERT INTO Company (company_id, Name, Web_link, Address, Logo, Description, Company_email, Industry, Company_size, Phone, Representative_name, Representative_gender, Representative_phone, Account_email, Tax_code, Business_license_file_url, Business_license_document_type, Business_license_preview_url, Consent_document_file_url, Consent_document_confirmed, Consent_confirmed_at, Consent_document_version, Verification_level, Company_info_update_status, Active, Follower_count, Last_update) VALUES
(11, 'FPT Software', 'https://fpt-software.com', 'Khu CNC Hòa Lạc, Hà Nội', 'https://fpt-software.com/logo.png', 'Công ty phần mềm hàng đầu Việt Nam...', 'hr@fpt-software.com', 'IT Outsourcing', '30,000+', '0243123456', 'Nguyễn Văn A', 'MALE', '0901234567', 'admin_hr@fpt.com', '0101248141', 'https://cv-upload-iting.s3.ap-southeast-2.amazonaws.com/business-license/c3bd4992-c308-4a54-974e-77c31967e1f7.pdf', NULL, 'https://cv-upload-iting.s3.ap-southeast-2.amazonaws.com/business-license/c3bd4992-c308-4a54-974e-77c31967e1f7.pdf', NULL, FALSE, NULL, 'v1.0', 'PREMIUM', 'APPROVED', TRUE, 12000, CURRENT_TIMESTAMP),
(12, 'VNG Corporation', 'https://vng.com.vn', '182 Lê Đại Hành, Q11, TP.HCM', 'https://vng.com.vn/logo.png', 'Kỳ lân công nghệ Việt Nam...', 'recruitment@vng.com.vn', 'Internet Services', '5,000+', '0283962388', 'Lê Hồng Minh', 'MALE', '0912345678', 'minhlh@vng.com.vn', '0303867050', NULL, NULL, NULL, NULL, FALSE, NULL, 'v1.0', 'ADVANCED', 'APPROVED', TRUE, 8500, CURRENT_TIMESTAMP),
(13, 'VinGroup', 'https://vingroup.net', 'Vinhomes Riverside, Hà Nội', 'https://vingroup.net/logo.png', 'Tập đoàn kinh tế tư nhân đa ngành...', 'info@vingroup.net', 'Multi-industry', '50,000+', '0243974999', 'Phạm Nhật Vượng', 'MALE', '0988888888', 'contact@vingroup.net', '0101245486', NULL, NULL, NULL, NULL, FALSE, NULL, 'v1.0', 'PREMIUM', 'APPROVED', TRUE, 20000, CURRENT_TIMESTAMP),
(14, 'Tiki Corporation', 'https://tiki.vn', 'Tòa nhà Rivera Park, Quận 10, TP.HCM', 'https://tiki.vn/logo.png', 'Sàn thương mại điện tử hàng đầu...', 'jobs@tiki.vn', 'E-commerce', '3,000+', '19006035', 'Trần Ngọc Thái Sơn', 'MALE', '0977665544', 'son.tran@tiki.vn', '0309532909', NULL, NULL, NULL, NULL, FALSE, NULL, 'v1.0', 'ADVANCED', 'APPROVED', TRUE, 6000, CURRENT_TIMESTAMP),
(15, 'Shopee Vietnam', 'https://shopee.vn', 'Tòa nhà Viettel, Quận 10, TP.HCM', 'https://shopee.vn/logo.png', 'Nền tảng thương mại điện tử số 1...', 'hr@shopee.vn', 'E-commerce', '2,000+', '0287302007', 'Pine Kyaw', 'MALE', '0966554433', 'pine.k@shopee.vn', '0314051252', NULL, NULL, NULL, NULL, FALSE, NULL, 'v1.0', 'ADVANCED', 'APPROVED', TRUE, 15000, CURRENT_TIMESTAMP);

-- Company audit log
INSERT INTO company_audit_log (company_id, action, from_status, to_status, reason, note, actor, actor_id, created_at) VALUES
(11, 'APPROVE', 'PENDING_REVIEW', 'APPROVED', NULL, 'Hồ sơ đầy đủ, MST hợp lệ', 'superadmin@iting.com', 1, '2026-01-12 09:30:00'),
(12, 'REJECT', 'PENDING_REVIEW', 'REJECTED', 'Thiếu giấy phép kinh doanh', 'Yêu cầu bổ sung giấy tờ', 'superadmin@iting.com', 1, '2026-03-07 14:15:00'),
(13, 'SUSPEND', 'APPROVED', 'SUSPENDED', 'Phát hiện hoạt động lừa đảo', 'Nhiều báo cáo từ ứng viên', 'superadmin@iting.com', 1, '2026-02-22 16:45:00'),
(12, 'REQUEST_RESUBMISSION', 'REJECTED', 'NEEDS_RESUBMISSION', 'Thiếu thông tin pháp lý', 'Vui lòng bổ sung giấy phép', 'admin2@iting.com', 2, '2026-03-08 10:00:00'),
(12, 'APPROVE', 'NEEDS_RESUBMISSION', 'APPROVED', NULL, 'Đã bổ sung đầy đủ', 'admin2@iting.com', 2, '2026-03-10 09:30:00'),
(13, 'UNSUSPEND', 'SUSPENDED', 'APPROVED', NULL, 'Đã xác minh lại, không vi phạm', 'superadmin@iting.com', 1, '2026-03-15 11:00:00');

-- Jobs
INSERT INTO Job (Id, Company_id, Title, Position, Description, Tech_required, Job_type, Experience_level, Working_days, Min_salary, Max_salary, Salary_type, Max_accept, Current_accepted, Status, Due_date, Province, Ward, Address, Location, Loc_id, Responsibilities, Requirements, Benefits, View_count, Application_count, Created_at, Last_update) VALUES
(1, 11, 'Senior Backend Developer (Python)', 'Backend Developer', 'Thiết kế và xây dựng hệ thống backend phục vụ hàng triệu request mỗi ngày.', '["Python","FastAPI","Redis","PostgreSQL"]', 'FULL_TIME', 'SENIOR', 'Thứ 2 - Thứ 6 (08:30 - 17:30)', 25000000, 45000000, 'MONTH', 3, 1, 'ACTIVE', '2026-04-30', 'Hà Nội', 'Cầu Giấy', 'Tòa nhà ABC, Trần Thái Tông', 'Tòa nhà ABC, Trần Thái Tông, Cầu Giấy, Hà Nội', 1, 'Thiết kế API, tối ưu hệ thống.', 'Có 5+ năm kinh nghiệm backend.', 'Thưởng tháng 13, hybrid.', 150, 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 12, 'Backend Engineer (Node.js)', 'Backend Engineer', 'Xây dựng hệ thống fintech realtime.', '["Node.js","MongoDB","AWS"]', 'FULL_TIME', 'MIDDLE', 'Thứ 2 - Thứ 6', 20000000, 35000000, 'MONTH', 2, 0, 'ACTIVE', '2026-05-01', 'TP. Hồ Chí Minh', 'Quận 1', 'Bitexco Tower', 'Bitexco Tower, Quận 1, TP. Hồ Chí Minh', 2, 'Phát triển API, xử lý dữ liệu lớn.', '3+ năm Node.js.', 'Bonus dự án.', 85, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 11, 'Frontend Developer (React)', 'Frontend Developer', 'Xây dựng UI/UX cho nền tảng tuyển dụng.', '["React","TypeScript","Redux"]', 'FULL_TIME', 'JUNIOR', 'Thứ 2 - Thứ 6', 18000000, 32000000, 'MONTH', 3, 1, 'ACTIVE', '2026-05-15', 'TP. Hồ Chí Minh', 'Quận 3', '123 Nguyễn Đình Chiểu', '123 Nguyễn Đình Chiểu, Quận 3, TP. Hồ Chí Minh', 2, 'Xây dựng UI component.', '2+ năm React.', 'Remote 2 ngày/tuần.', 210, 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 13, 'DevOps Engineer', 'DevOps Engineer', 'Quản lý hệ thống CI/CD và cloud infrastructure.', '["AWS","Kubernetes","Terraform"]', 'FULL_TIME', 'SENIOR', 'Thứ 2 - Thứ 6', 30000000, 50000000, 'MONTH', 2, 0, 'ACTIVE', '2026-04-25', 'Hà Nội', 'Nam Từ Liêm', 'Keangnam Landmark', 'Keangnam Landmark, Nam Từ Liêm, Hà Nội', 1, 'Triển khai CI/CD.', 'Kubernetes, AWS.', 'Thưởng hiệu suất.', 45, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 14, 'Mobile Developer (Flutter)', 'Mobile Developer', 'Phát triển ứng dụng mobile đa nền tảng.', '["Flutter","Dart","Firebase"]', 'FULL_TIME', 'MIDDLE', 'Thứ 2 - Thứ 6', 22000000, 38000000, 'MONTH', 2, 0, 'ACTIVE', '2026-05-10', 'Đà Nẵng', 'Hải Châu', 'Tòa nhà FPT', 'Tòa nhà FPT, Hải Châu, Đà Nẵng', 3, 'Phát triển app mobile.', 'Flutter 2+ năm.', 'Team trẻ, năng động.', 95, 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 11, 'AI/ML Engineer', 'AI Engineer', 'Xây dựng hệ thống AI recommendation.', '["Python","TensorFlow","PyTorch"]', 'FULL_TIME', 'SENIOR', 'Thứ 2 - Thứ 6', 35000000, 60000000, 'MONTH', 2, 1, 'ACTIVE', '2026-05-20', 'Hà Nội', 'Thanh Xuân', 'Royal City', 'Royal City, Thanh Xuân, Hà Nội', 1, 'Xây dựng model AI.', 'Deep Learning.', 'Lương cao + stock.', 300, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 12, 'Data Engineer', 'Data Engineer', 'Xây dựng hệ thống data pipeline.', '["Python","Spark","Airflow"]', 'FULL_TIME', 'MIDDLE', 'Thứ 2 - Thứ 6', 24000000, 42000000, 'MONTH', 2, 0, 'ACTIVE', '2026-04-30', 'TP. Hồ Chí Minh', 'Quận 7', 'Phú Mỹ Hưng', 'Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh', 2, 'ETL pipeline.', 'Big Data.', 'Hybrid.', 110, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 13, 'QA Engineer', 'QA Engineer', 'Automation testing hệ thống.', '["Selenium","Java","Python"]', 'FULL_TIME', 'JUNIOR', 'Thứ 2 - Thứ 6', 12000000, 22000000, 'MONTH', 3, 0, 'ACTIVE', '2026-05-05', 'Cần Thơ', 'Ninh Kiều', 'Vincom Cần Thơ', 'Vincom, Ninh Kiều, Cần Thơ', 5, 'Test automation.', 'Fresher/Jr.', 'Training bài bản.', 60, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 14, 'Java Backend Developer', 'Backend Developer', 'Xây dựng hệ thống E-commerce.', '["Java","Spring Boot","MySQL"]', 'FULL_TIME', 'SENIOR', 'Thứ 2 - Thứ 6', 28000000, 48000000, 'MONTH', 2, 1, 'ACTIVE', '2026-05-12', 'Hà Nội', 'Đống Đa', 'Xã Đàn', 'Xã Đàn, Đống Đa, Hà Nội', 1, 'Microservices.', 'Spring Boot.', 'Lương cao.', 180, 14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 15, 'Tech Lead', 'Tech Lead', 'Dẫn dắt team kỹ thuật.', '["System Design","Leadership"]', 'FULL_TIME', 'LEAD', 'Thứ 2 - Thứ 6', 45000000, 80000000, 'MONTH', 1, 0, 'ACTIVE', '2026-05-18', 'TP. Hồ Chí Minh', 'Quận 1', 'Landmark 81', 'Landmark 81, Quận 1, TP. Hồ Chí Minh', 2, 'Quản lý team.', '5+ năm kinh nghiệm.', 'Stock option.', 450, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 11, 'Test Job DRAFT', 'Backend Developer', 'Test trạng thái DRAFT', '["Java","Spring"]', 'FULL_TIME', 'MIDDLE', 'Thứ 2 - Thứ 6', 20000000, 30000000, 'MONTH', 2, 0, 'DRAFT', '2026-05-30', 'Hà Nội', 'Cầu Giấy', 'Test Address', 'Test Address, Cầu Giấy, Hà Nội', 1, 'Test', 'Test', 'Test', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 11, 'Test Job PENDING', 'Backend Developer', 'Test trạng thái PENDING', '["Java","Spring"]', 'FULL_TIME', 'MIDDLE', 'Thứ 2 - Thứ 6', 20000000, 30000000, 'MONTH', 2, 0, 'PENDING', '2026-05-30', 'Hà Nội', 'Cầu Giấy', 'Test Address', 'Test Address, Cầu Giấy, Hà Nội', 1, 'Test', 'Test', 'Test', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, 11, 'Test Job ACTIVE', 'Backend Developer', 'Test trạng thái ACTIVE', '["Java","Spring"]', 'FULL_TIME', 'MIDDLE', 'Thứ 2 - Thứ 6', 20000000, 30000000, 'MONTH', 2, 0, 'ACTIVE', '2026-05-30', 'Hà Nội', 'Cầu Giấy', 'Test Address', 'Test Address, Cầu Giấy, Hà Nội', 1, 'Test', 'Test', 'Test', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, 11, 'Test Job EXPIRED', 'Backend Developer', 'Test trạng thái EXPIRED', '["Java","Spring"]', 'FULL_TIME', 'MIDDLE', 'Thứ 2 - Thứ 6', 20000000, 30000000, 'MONTH', 2, 0, 'EXPIRED', '2020-01-01', 'Hà Nội', 'Cầu Giấy', 'Test Address', 'Test Address, Cầu Giấy, Hà Nội', 1, 'Test', 'Test', 'Test', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 11, 'Test Job CLOSED', 'Backend Developer', 'Test trạng thái CLOSED', '["Java","Spring"]', 'FULL_TIME', 'MIDDLE', 'Thứ 2 - Thứ 6', 20000000, 30000000, 'MONTH', 2, 0, 'CLOSED', '2026-05-30', 'Hà Nội', 'Cầu Giấy', 'Test Address', 'Test Address, Cầu Giấy, Hà Nội', 1, 'Test', 'Test', 'Test', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(16, 11, 'Test Job REJECTED', 'Backend Developer', 'Test trạng thái REJECTED', '["Java","Spring"]', 'FULL_TIME', 'MIDDLE', 'Thứ 2 - Thứ 6', 20000000, 30000000, 'MONTH', 2, 0, 'REJECTED', '2026-05-30', 'Hà Nội', 'Cầu Giấy', 'Test Address', 'Test Address, Cầu Giấy, Hà Nội', 1, 'Test', 'Test', 'Test', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(17, 11, 'Test Job REJECTED 2', 'Backend Developer', 'Test trạng thái REJECTED', '["Java","Spring"]', 'FULL_TIME', 'MIDDLE', 'Thứ 2 - Thứ 6', 20000000, 30000000, 'MONTH', 2, 0, 'REJECTED', '2026-05-30', 'Hà Nội', 'Cầu Giấy', 'Test Address', 'Test Address, Cầu Giấy, Hà Nội', 1, 'Test', 'Test', 'Test', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(18, 11, 'Test Job SUSPENDED', 'Backend Developer', 'Test trạng thái SUSPENDED', '["Java","Spring"]', 'FULL_TIME', 'MIDDLE', 'Thứ 2 - Thứ 6', 20000000, 30000000, 'MONTH', 2, 0, 'SUSPENDED', '2026-05-30', 'Hà Nội', 'Cầu Giấy', 'Test Address', 'Test Address, Cầu Giấy, Hà Nội', 1, 'Test', 'Test', 'Test', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- CVs
INSERT INTO CV (id, profile_id, Title, File_path, Upload_time, Cv_status, Is_default) VALUES
(1, 101, 'Java Developer CV', '/uploads/cv/cv101.pdf', CURRENT_TIMESTAMP, 'ACTIVE', TRUE),
(2, 102, 'Frontend Lead CV', '/uploads/cv/cv102.pdf', CURRENT_TIMESTAMP, 'ACTIVE', TRUE),
(3, 103, 'DevOps Pro CV', '/uploads/cv/cv103.pdf', CURRENT_TIMESTAMP, 'ACTIVE', TRUE),
(4, 104, 'Fullstack Dev CV', '/uploads/cv/cv104.pdf', CURRENT_TIMESTAMP, 'ACTIVE', TRUE),
(5, 105, 'ML Engineer CV', '/uploads/cv/cv105.pdf', CURRENT_TIMESTAMP, 'ACTIVE', TRUE);

-- Company upload jobs
INSERT INTO Company_upload_job (job_id, company_id, admin_id, time) VALUES
(1, 11, 1, '2026-03-01 09:00:00'),
(2, 12, 1, '2026-03-01 10:30:00'),
(3, 11, 1, '2026-03-02 14:00:00'),
(4, 13, 1, '2026-03-03 11:00:00'),
(5, 14, 1, '2026-03-04 15:30:00'),
(6, 11, 1, '2026-03-05 09:30:00'),
(7, 12, 1, '2026-03-06 13:00:00'),
(10, 12, 1, '2026-03-09 11:30:00');

-- Notifications
INSERT INTO Notification (Id, Content, Time, recipient_id, recipient_type, type, is_read, read_at, entity_type, entity_id, action_url) VALUES
(1, 'FPT Software vừa đăng tin tuyển Senior Backend Developer', '2026-03-01 09:05:00', 1, 'USER', 'JOB_POST', FALSE, NULL, 'JOB', 1, '/jobs/1'),
(2, 'MoMo đang tìm Backend Engineer với lương hấp dẫn', '2026-03-01 10:35:00', 2, 'USER', 'JOB_POST', FALSE, NULL, 'JOB', 2, '/jobs/2'),
(3, 'VNG Corporation tuyển Frontend Developer React', '2026-03-02 14:05:00', 3, 'USER', 'JOB_POST', FALSE, NULL, 'JOB', 3, '/jobs/3'),
(4, 'Bạn có 3 công ty mới follow', '2026-03-03 08:00:00', 1, 'USER', 'FOLLOW', FALSE, NULL, 'COMPANY', 1, '/companies/1'),
(5, 'Grab Vietnam đăng tin Mobile Developer tại Đà Nẵng', '2026-03-04 15:35:00', 2, 'USER', 'JOB_POST', FALSE, NULL, 'JOB', 4, '/jobs/4'),
(6, 'Hồ sơ của bạn đã được 5 công ty xem', '2026-03-05 09:00:00', 3, 'USER', 'PROFILE_VIEW', FALSE, NULL, 'USER', 3, '/profile'),
(7, 'Tech Startup XYZ tuyển AI/ML Engineer với mức lương cao', '2026-03-05 09:35:00', 4, 'USER', 'JOB_POST', FALSE, NULL, 'JOB', 5, '/jobs/5'),
(8, 'Shopee Vietnam tuyển Data Engineer', '2026-03-06 13:05:00', 5, 'USER', 'JOB_POST', FALSE, NULL, 'JOB', 6, '/jobs/6'),
(9, 'FPT Software đã follow bạn', '2026-03-07 10:30:00', 1, 'USER', 'FOLLOW', FALSE, NULL, 'COMPANY', 1, '/companies/1'),
(10, 'Bạn có 2 tin nhắn mới từ nhà tuyển dụng', '2026-03-08 14:00:00', 2, 'USER', 'MESSAGE', FALSE, NULL, 'CONVERSATION', 1, '/messages/1');

-- User save jobs
INSERT INTO user_save_job (job_id, user_id) VALUES
(1, 101), (2, 102), (3, 101), (4, 103), (5, 104);

-- User follow companies
INSERT INTO User_follow_company (User_id, Company_id) VALUES
(101, 11), (101, 12), (102, 11), (103, 13);

-- User contact company
INSERT INTO User_contact_company (User_id, Company_id, Time) VALUES
(101, 11, '2026-03-10 09:30:00'),
(102, 12, '2026-03-11 14:15:00'),
(103, 13, '2026-03-12 10:45:00');

-- Apply forms
INSERT INTO Apply_form (Id, User_id, Cv_id, Cv_title, Applicant_name, Introduction) VALUES
(1, 101, 1, 'Java Developer CV', 'Nguyen Van A', 'Đam mê backend...'),
(2, 102, 2, 'Frontend lead CV', 'Tran Thi B', 'Thích UX/UI...'),
(3, 103, 3, 'DevOps Pro CV', 'Le Van C', 'Kinh nghiệm infra...'),
(4, 104, 4, 'Fullstack Dev CV', 'Pham Thi D', 'Sẵn sàng học hỏi...'),
(5, 105, 5, 'ML Engineer CV', 'Hoang Van E', 'Yêu AI...');

-- Apply form to job
INSERT INTO Apply_form_user_to_job (Job_id, Apply_form_id, Time_sent, status) VALUES
(1, 1, CURRENT_TIMESTAMP, 'PENDING'),
(2, 2, CURRENT_TIMESTAMP, 'PENDING'),
(3, 3, CURRENT_TIMESTAMP, 'PENDING'),
(4, 4, CURRENT_TIMESTAMP, 'PENDING'),
(5, 5, CURRENT_TIMESTAMP, 'PENDING');

-- Education
INSERT INTO Education (profile_id, School_name, Major, Start_date, End_date, Description) VALUES
(101, 'Đại học Bách Khoa TP.HCM', 'Khoa học máy tính', '2015-09-01', '2019-06-30', 'Tốt nghiệp loại giỏi.'),
(102, 'Đại học FPT', 'Kỹ thuật phần mềm', '2016-09-01', '2020-06-30', 'Học bổng 100%.'),
(103, 'Đại học Bách Khoa Hà Nội', 'Hệ thống thông tin', '2014-09-01', '2018-06-30', 'Tham gia nghiên cứu Lab ATTT.');

-- Certificates
INSERT INTO Certificate (profile_id, Title, Issuing_organization, Issue_date, Expiration_date) VALUES
(101, 'AWS Certified Solutions Architect', 'Amazon Web Services', '2022-01-01', '2025-01-01'),
(102, 'Google Professional Cloud Architect', 'Google Cloud', '2021-06-15', NULL),
(103, 'Certified Kubernetes Administrator (CKA)', 'CNCF', '2023-01-01', '2026-01-01');

-- Skills
INSERT INTO Skill (profile_id, Name, Level) VALUES
(101, 'Java', 'Expert'), (101, 'Spring Boot', 'Expert'),
(102, 'React', 'Advanced'), (102, 'Typescript', 'Advanced'),
(103, 'Kubernetes', 'Advanced'), (103, 'Docker', 'Expert');

-- Experience
INSERT INTO Experience (profile_id, Company_name, Position, Start_date, End_date, Description) VALUES
(101, 'FPT Software', 'Senior Developer', '2019-06-01', CURRENT_DATE, 'Dẫn dắt team phát triển microservices.'),
(102, 'VNG Corporation', 'Frontend Lead', '2020-07-01', CURRENT_DATE, 'Phát triển UI cho Zalo Pay.'),
(103, 'VinGroup', 'DevOps Engineer', '2018-08-01', '2022-12-31', 'Triển khai hạ tầng Cloud cho VinID.');

-- Social links
INSERT INTO social_link (profile_id, Platform, Url) VALUES
(101, 'LINKEDIN', 'https://linkedin.com/in/nguyenvana'),
(101, 'GITHUB', 'https://github.com/nguyenvana'),
(102, 'LINKEDIN', 'https://linkedin.com/in/tranthib'),
(102, 'PORTFOLIO', 'https://tranthib.dev');

-- Portfolio
INSERT INTO Portfolio (profile_id, Url, Title, Description) VALUES
(101, 'https://nguyenvana.blog', 'My Tech Blog', 'Chia sẻ kiến thức về backend.'),
(102, 'https://github.com/tranthib/my-ui-lib', 'My UI Library', 'Thư viện React components tự xây dựng.');

-- Categories
INSERT INTO categories (type, name, name_en, active) VALUES
('INDUSTRY', 'Công nghệ thông tin', 'Information Technology', true),
('INDUSTRY', 'Tài chính - Ngân hàng', 'Finance - Banking', true),
('INDUSTRY', 'Y tế - Dược phẩm', 'Healthcare - Pharmaceutical', true),
('SKILL', 'Java', 'Java', true),
('SKILL', 'Python', 'Python', true),
('SKILL', 'React', 'React', true),
('LOCATION', 'Hà Nội', 'Hanoi', true),
('LOCATION', 'TP. Hồ Chí Minh', 'Ho Chi Minh City', true);

-- Static contents
INSERT INTO static_contents (slug, type, title, content, published) VALUES
('about-us', 'PAGE', 'Về ITing', 'ITing là nền tảng kết nối ứng viên và nhà tuyển dụng...', true),
('terms-of-service', 'PAGE', 'Điều khoản sử dụng', 'Khi sử dụng ITing, bạn đồng ý với các điều khoản sau...', true);

-- Report accounts
INSERT INTO report_accounts (reported_user_id, reporter_id, report_type, violation, severity, status, description) VALUES
(101, 102, 'ACCOUNT', 'Spamming', 'LOW', 'PENDING', 'User sends too many messages'),
(15, 101, 'JOB', 'Scam Job', 'HIGH', 'PENDING', 'This job posting seems to be a scam');

-- Account last login
UPDATE Account SET last_login_at = '2026-04-01 09:30:00' WHERE Id = 1;
UPDATE Account SET last_login_at = '2026-04-01 10:15:00' WHERE Id = 2;
UPDATE Account SET last_login_at = '2026-03-30 16:20:00' WHERE Id = 3;
UPDATE Account SET last_login_at = '2026-04-01 08:45:00' WHERE Id = 11;
UPDATE Account SET last_login_at = '2026-03-31 17:00:00' WHERE Id = 12;
UPDATE Account SET last_login_at = '2026-03-29 11:40:00' WHERE Id = 13;
UPDATE Account SET last_login_at = '2026-04-01 13:25:00' WHERE Id = 14;
UPDATE Account SET last_login_at = '2026-03-25 09:10:00' WHERE Id = 15;
UPDATE Account SET last_login_at = '2026-04-01 19:20:00' WHERE Id = 101;
UPDATE Account SET last_login_at = '2026-04-01 20:05:00' WHERE Id = 102;
UPDATE Account SET last_login_at = '2026-03-15 07:50:00' WHERE Id = 103;
UPDATE Account SET last_login_at = '2026-04-02 07:45:00' WHERE Id = 104;
UPDATE Account SET last_login_at = NULL WHERE Id = 105;

-- Company industries
INSERT INTO company_industries (company_id, industry) VALUES
(11, 'SOFTWARE_DEVELOPMENT'), (11, 'CLOUD_COMPUTING'), (11, 'AI'), (11, 'QA_TESTING'),
(12, 'GAME_DEVELOPMENT'), (12, 'MOBILE_DEVELOPMENT'), (12, 'WEB_DEVELOPMENT'), (12, 'CLOUD_COMPUTING'),
(13, 'AI'), (13, 'DATA_SCIENCE'), (13, 'SOFTWARE_DEVELOPMENT'),
(14, 'WEB_DEVELOPMENT'), (14, 'MOBILE_DEVELOPMENT'), (14, 'DATA_SCIENCE'),
(15, 'SOFTWARE_DEVELOPMENT'), (15, 'WEB_DEVELOPMENT'), (15, 'MOBILE_DEVELOPMENT');

-- Sequence updates
SELECT setval('account_id_seq', COALESCE((SELECT MAX(Id) FROM Account), 1), true);
SELECT setval('job_id_seq', COALESCE((SELECT MAX(Id) FROM Job), 1), true);
SELECT setval('notification_id_seq', COALESCE((SELECT MAX(Id) FROM Notification), 1), true);
SELECT setval('apply_form_id_seq', COALESCE((SELECT MAX(Id) FROM Apply_form), 1), true);
SELECT setval('cv_id_seq', COALESCE((SELECT MAX(id) FROM CV), 1), true);

SET session_replication_role = 'origin';

-- ============================================================================
-- END OF DATABASE SETUP
-- ============================================================================
