-- ============================================================================
-- ITing Job Portal - Database Schema
-- ============================================================================
-- Generated from: erd_mapping-Relational_schema.drawio.png
-- Generated on: March 4, 2026
-- Database: PostgreSQL 16+
-- Description: Complete database schema for ITing Job Portal application
-- ============================================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS Account_report_account CASCADE;
DROP TABLE IF EXISTS Reported_account_id CASCADE;
DROP TABLE IF EXISTS Apply_form_user_to_job CASCADE;
DROP TABLE IF EXISTS Apply_form CASCADE;
DROP TABLE IF EXISTS Company_upload_job CASCADE;
DROP TABLE IF EXISTS User_save_job CASCADE;
DROP TABLE IF EXISTS User_contact_company CASCADE;
DROP TABLE IF EXISTS User_follow_company CASCADE;
DROP TABLE IF EXISTS Notification CASCADE;
DROP TABLE IF EXISTS Education CASCADE;
DROP TABLE IF EXISTS Certificate CASCADE;
DROP TABLE IF EXISTS Skill CASCADE;
DROP TABLE IF EXISTS Experience CASCADE;
DROP TABLE IF EXISTS CV CASCADE;
DROP TABLE IF EXISTS Job CASCADE;
DROP TABLE IF EXISTS Company CASCADE;
DROP TABLE IF EXISTS Admin CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Account CASCADE;
DROP TABLE IF EXISTS VN_location CASCADE;
DROP TABLE IF EXISTS web_info CASCADE;
DROP TABLE IF EXISTS Social_network CASCADE;
DROP TABLE IF EXISTS Ban_history CASCADE;
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

                                CONSTRAINT fk_social_web
                                    FOREIGN KEY (Web_infor_id)
                                        REFERENCES web_info(Id)
                                        ON DELETE CASCADE
);

-- Table: Web_infor
-- Description: Website/web information and social media links

-- Table: VN_location
-- Description: Vietnam location hierarchy (provinces, cities, regions)
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
-- Description: User authentication and login credentials
CREATE TABLE Account (
                         Id BIGSERIAL PRIMARY KEY,
                         Email VARCHAR(255) UNIQUE NOT NULL,
                         Password VARCHAR(255) NOT NULL,
                         Role VARCHAR(20) NOT NULL DEFAULT 'CANDIDATE',
                         Status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);
-- Table: Users
-- Description: User profile information (job seekers)
CREATE TABLE Users (

                       Id BIGINT PRIMARY KEY,

                       Phone_num VARCHAR(20),

                       Loc_id BIGINT,

                       Cv_embedding TEXT,

                       F_name VARCHAR(100),

                       L_name VARCHAR(100),

                       B_date DATE,

                       B_month INTEGER,

                       B_year INTEGER,

                       Sex VARCHAR(10),

                       Avatar TEXT,

                       Description TEXT,

                       Address VARCHAR(500),

                       Last_update TIMESTAMP,

                       CONSTRAINT fk_user_account
                           FOREIGN KEY (Id)
                               REFERENCES Account(Id)
                               ON DELETE CASCADE,
                    CONSTRAINT fk_user_location
                               FOREIGN KEY (Loc_id)
                               REFERENCES VN_location(Loc_id)
                               ON DELETE SET NULL
);

CREATE TABLE Company (
                         Company_id BIGINT PRIMARY KEY,

    -- Thông tin cơ bản
                         Name VARCHAR(255) NOT NULL,
                         Web_link TEXT,
                         Address VARCHAR(500),
                         Logo TEXT,
                         Description TEXT,
                         Company_email VARCHAR(255),
                         Industry VARCHAR(255),
                         Company_size VARCHAR(100),
                         Phone VARCHAR(20),

    -- Thông tin người đại diện
                         Representative_name VARCHAR(255),
                         Representative_gender VARCHAR(10),
                         Representative_phone VARCHAR(20),
                         Account_email VARCHAR(255),

    -- Thông tin pháp lý
                         Tax_code VARCHAR(50),
                         Business_license_file_url TEXT,
                         Consent_document_file_url TEXT,

    -- Trạng thái
                         Verification_level VARCHAR(50) DEFAULT 'UNVERIFIED',
                         Company_info_update_status VARCHAR(50) DEFAULT 'PENDING',
                         Last_update_request_date TIMESTAMP,
                         Last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         Active BOOLEAN DEFAULT TRUE,

    -- Foreign key
                         CONSTRAINT fk_company_account
                             FOREIGN KEY (Company_id)
                                 REFERENCES Account(Id)
                                 ON DELETE CASCADE
);

-- Chèn đoạn này vào trước bảng Company_upload_job
CREATE TABLE Job (
                     Id BIGSERIAL PRIMARY KEY,
                     Company_id BIGINT NOT NULL,

                     Position VARCHAR(255),
                     Description TEXT,
                     Tech_required TEXT,

                     Job_type VARCHAR(50),
                     Experience_level VARCHAR(50),

                     Min_salary DECIMAL(15,2),
                     Max_salary DECIMAL(15,2),

                     Min_accept TEXT,
                     Max_accept INTEGER,
                     Current_accepted INTEGER,

                     View_count INTEGER DEFAULT 0,
                     Application_count INTEGER DEFAULT 0,

                     Status VARCHAR(50),

                     Due_date DATE,
                     Last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                     Location VARCHAR(255),
                     Loc_id BIGINT,

                     Job_embedding TEXT,

                     CONSTRAINT fk_job_company
                         FOREIGN KEY (Company_id)
                             REFERENCES Company(Company_id),

                             CONSTRAINT fk_job_location
                             FOREIGN KEY (Loc_id)
                             REFERENCES VN_location(Loc_id)
                             ON DELETE SET NULL
);
-- Table: Job
-- Description: Job postings


-- Table: Admin
-- Description: Administrator accounts
CREATE TABLE Admin (
                       Admin_id BIGSERIAL PRIMARY KEY,
                       F_name VARCHAR(100),
                       L_name VARCHAR(100),
                       Web_infor_id BIGINT,

                       CONSTRAINT fk_admin_web_infor
                           FOREIGN KEY (Web_infor_id)
                               REFERENCES web_info(Id)
                               ON DELETE SET NULL
);
-- ============================================================================
-- ACCOUNT SECURITY & MODERATION
-- ============================================================================

-- Table: Ban_history
-- Description: Detailed log of account suspensions and bans
CREATE TABLE Ban_history (
                             Id BIGSERIAL PRIMARY KEY,
                             Target_account_id BIGINT NOT NULL,
                             Admin_account_id BIGINT NOT NULL,
                             Reason TEXT,
                             Banned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             Expired_at TIMESTAMP, -- NULL means permanent ban
                             Is_active BOOLEAN NOT NULL DEFAULT TRUE,

                             CONSTRAINT fk_ban_target_account
                                 FOREIGN KEY (Target_account_id)
                                     REFERENCES Account(Id)
                                     ON DELETE CASCADE,

                             CONSTRAINT fk_ban_admin
                                 FOREIGN KEY (Admin_account_id) -- Cập nhật tên cột ở đây
                                     REFERENCES Account(Id)
                                     ON DELETE CASCADE
);

-- Index for performance
CREATE INDEX idx_ban_target_account ON Ban_history(Target_account_id);
CREATE INDEX idx_ban_is_active ON Ban_history(Is_active);

COMMENT ON TABLE Ban_history IS 'Detailed log of account suspensions performed by administrators';
-- ============================================================================
-- ACCOUNT REPORTING SYSTEM
-- ============================================================================

-- Table: Reported_account_id
-- Description: Details of reported accounts
CREATE TABLE Reported_account_id (
    Reported_account_id BIGINT PRIMARY KEY,
    Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Reason TEXT
);

-- Table: Account_report_account
-- Description: Account reporting relationship (who reported whom)
CREATE TABLE Account_report_account (
    Admin_id BIGINT NOT NULL,
    Reported_account_id BIGINT NOT NULL,
    Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Reason TEXT,
    PRIMARY KEY (Admin_id, Reported_account_id),
    CONSTRAINT fk_report_admin FOREIGN KEY (Admin_id)
        REFERENCES Admin(Admin_id) ON DELETE CASCADE,
    CONSTRAINT fk_report_account FOREIGN KEY (Reported_account_id)
        REFERENCES Reported_account_id(Reported_account_id) ON DELETE CASCADE
);

-- ============================================================================
-- USER-COMPANY INTERACTIONS
-- ============================================================================

-- Table: User_follow_company
-- Description: Users following companies for updates
CREATE TABLE User_follow_company (
                                     User_id BIGINT NOT NULL,
                                     Company_id BIGINT NOT NULL,
                                     Notification_id BIGINT,
                                     Follow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                     PRIMARY KEY (User_id, Company_id),

                                     CONSTRAINT fk_follow_user
                                         FOREIGN KEY (User_id)
                                             REFERENCES Users(Id)
                                             ON DELETE CASCADE,

                                     CONSTRAINT fk_follow_company
                                         FOREIGN KEY (Company_id)
                                             REFERENCES Company(Company_id)
                                             ON DELETE CASCADE
);

-- Table: User_contact_company
-- Description: Messages/contact between users and companies
CREATE TABLE User_contact_company (
                                      Message_id BIGSERIAL PRIMARY KEY,
                                      User_id BIGINT NOT NULL,
                                      Company_id BIGINT NOT NULL,
                                      Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                      CONSTRAINT fk_contact_user
                                          FOREIGN KEY (User_id)
                                              REFERENCES Users(Id)
                                              ON DELETE CASCADE,

                                      CONSTRAINT fk_contact_company
                                          FOREIGN KEY (Company_id)
                                              REFERENCES Company(Company_id)
                                              ON DELETE CASCADE
);
-- Table: Notification
-- Description: User notifications
CREATE TABLE Notification (
    Id BIGSERIAL PRIMARY KEY,
    Content TEXT NOT NULL,
    Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key to User_follow_company for notifications
ALTER TABLE User_follow_company
    ADD CONSTRAINT fk_follow_notification FOREIGN KEY (Notification_id)
        REFERENCES Notification(Id) ON DELETE SET NULL;

-- ============================================================================
-- JOBS & APPLICATIONS
-- ============================================================================

-- Table: Company_upload_job
-- Description: Relationship between companies and their job postings
CREATE TABLE Company_upload_job (
    Job_id BIGINT NOT NULL,
    Company_id BIGINT NOT NULL,
    Admin_id BIGINT,
    Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Job_id, Company_id),
    CONSTRAINT fk_upload_job FOREIGN KEY (Job_id)
        REFERENCES Job(Id) ON DELETE CASCADE,
    CONSTRAINT fk_upload_company FOREIGN KEY (Company_id)
        REFERENCES Company(Company_id) ON DELETE CASCADE,
    CONSTRAINT fk_upload_admin FOREIGN KEY (Admin_id)
        REFERENCES Admin(Admin_id) ON DELETE SET NULL
);

-- Table: User_save_job
-- Description: Jobs saved/bookmarked by users
CREATE TABLE User_save_job (
    User_id BIGINT NOT NULL,
    Job_id BIGINT NOT NULL,
    PRIMARY KEY (User_id, Job_id),
    CONSTRAINT fk_save_user FOREIGN KEY (User_id)
        REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT fk_save_job FOREIGN KEY (Job_id)
        REFERENCES Job(Id) ON DELETE CASCADE
);

-- Table: CV
-- Description: User resumes/CVs
CREATE TABLE CV (
    User_id BIGINT PRIMARY KEY,
    Title VARCHAR(255),
    File_path TEXT,
    Upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Cv_status VARCHAR(50),
    CONSTRAINT fk_cv_user FOREIGN KEY (User_id)
        REFERENCES Users(Id) ON DELETE CASCADE
);

-- Table: Apply_form
-- Description: Job application forms
CREATE TABLE Apply_form (
    Id BIGSERIAL PRIMARY KEY,
    User_id BIGINT NOT NULL,
    Cv_title VARCHAR(255),
    Applicant_name VARCHAR(255),
    Introduction TEXT,
    CONSTRAINT fk_apply_user FOREIGN KEY (User_id)
        REFERENCES Users(Id) ON DELETE CASCADE
);

-- Table: Apply_form_user_to_job
-- Description: Tracking of job applications
CREATE TABLE Apply_form_user_to_job (
    Job_id BIGINT NOT NULL,
    Apply_form_id BIGINT NOT NULL,
    Time_sent TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Job_id, Apply_form_id),
    CONSTRAINT fk_apply_job FOREIGN KEY (Job_id)
        REFERENCES Job(Id) ON DELETE CASCADE,
    CONSTRAINT fk_apply_form FOREIGN KEY (Apply_form_id)
        REFERENCES Apply_form(Id) ON DELETE CASCADE
);

-- ============================================================================
-- USER PROFILE COMPONENTS
-- ============================================================================

-- Table: Education
-- Description: User education history
CREATE TABLE Education (
                           Id BIGSERIAL PRIMARY KEY,
                           User_id BIGINT NOT NULL,

                           CONSTRAINT fk_education_user
                               FOREIGN KEY (User_id)
                                   REFERENCES Users(Id)
                                   ON DELETE CASCADE
);
-- Table: Certificate
-- Description: User certifications and credentials
CREATE TABLE Certificate (
    Id BIGSERIAL PRIMARY KEY,
    User_id BIGINT NOT NULL,
    CONSTRAINT fk_certificate_user FOREIGN KEY (User_id)
        REFERENCES Users(Id) ON DELETE CASCADE
);

-- Table: Skill
-- Description: User skills and competencies
CREATE TABLE Skill (
    Id BIGSERIAL PRIMARY KEY,
    User_id BIGINT NOT NULL,
    CONSTRAINT fk_skill_user FOREIGN KEY (User_id)
        REFERENCES Users(Id) ON DELETE CASCADE
);

-- Table: Experience
-- Description: User work experience
CREATE TABLE Experience (
    Id BIGSERIAL PRIMARY KEY,
    User_id BIGINT NOT NULL,
    CONSTRAINT fk_experience_user FOREIGN KEY (User_id)
        REFERENCES Users(Id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users table indexes
CREATE INDEX idx_user_location ON Users(Loc_id);
CREATE INDEX idx_user_last_update ON Users(Last_update);

-- Company table indexes
CREATE INDEX idx_company_last_update ON Company(Last_update);

-- Job table indexes
CREATE INDEX idx_job_location ON Job(Loc_id);
CREATE INDEX idx_job_status ON Job(Status);
CREATE INDEX idx_job_due_date ON Job(Due_date);
CREATE INDEX idx_job_last_update ON Job(Last_update);

-- Relationship table indexes
CREATE INDEX idx_follow_user ON User_follow_company(User_id);
CREATE INDEX idx_follow_company ON User_follow_company(Company_id);
CREATE INDEX idx_follow_date ON User_follow_company(Follow_date);

CREATE INDEX idx_save_user ON User_save_job(User_id);
CREATE INDEX idx_save_job ON User_save_job(Job_id);

CREATE INDEX idx_contact_user ON User_contact_company(User_id);
CREATE INDEX idx_contact_company ON User_contact_company(Company_id);
CREATE INDEX idx_contact_time ON User_contact_company(Time);

CREATE INDEX idx_upload_job ON Company_upload_job(Job_id);
CREATE INDEX idx_upload_company ON Company_upload_job(Company_id);
CREATE INDEX idx_upload_time ON Company_upload_job(Time);

CREATE INDEX idx_apply_job ON Apply_form_user_to_job(Job_id);
CREATE INDEX idx_apply_form ON Apply_form_user_to_job(Apply_form_id);
CREATE INDEX idx_apply_time ON Apply_form_user_to_job(Time_sent);

-- Notification indexes
CREATE INDEX idx_notification_time ON Notification(Time);

-- VN_location indexes
CREATE INDEX idx_location_region ON VN_location(Region);
CREATE INDEX idx_location_province ON VN_location(Province_name);

-- ============================================================================
-- COMMENTS (Optional documentation)
-- ============================================================================

COMMENT ON TABLE Users IS 'Job seeker profiles with personal information';
COMMENT ON TABLE Account IS 'Authentication credentials for users';
COMMENT ON TABLE Company IS 'Employer/company profiles';
COMMENT ON TABLE Job IS 'Job postings created by companies';
COMMENT ON TABLE CV IS 'User resumes and CVs';
COMMENT ON TABLE Apply_form IS 'Job application forms submitted by users';
COMMENT ON TABLE User_follow_company IS 'Relationship tracking users following companies';
COMMENT ON TABLE User_save_job IS 'Jobs bookmarked/saved by users';
COMMENT ON TABLE Notification IS 'System notifications for users';
COMMENT ON TABLE VN_location IS 'Vietnam geographical location data';
COMMENT ON TABLE Admin IS 'Administrator accounts for system management';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
