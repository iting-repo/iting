-- ===============================================
-- ITING JOB PORTAL - FULL DATABASE SCHEMA
-- ===============================================

-- ================= RBAC =================

CREATE TABLE roles (
                       id BIGSERIAL PRIMARY KEY,
                       name VARCHAR(50) UNIQUE NOT NULL,
                       description TEXT,
                       created_at TIMESTAMP,
                       updated_at TIMESTAMP
);

CREATE TABLE permissions (
                             id BIGSERIAL PRIMARY KEY,
                             code VARCHAR(100) UNIQUE NOT NULL,
                             name VARCHAR(100),
                             description TEXT,
                             module VARCHAR(50),
                             action VARCHAR(50),
                             sort_order INT,
                             active BOOLEAN DEFAULT TRUE,
                             created_at TIMESTAMP,
                             updated_at TIMESTAMP
);

CREATE TABLE role_permissions (
                                  role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
                                  permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
                                  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE accounts (
                          id BIGSERIAL PRIMARY KEY,
                          email VARCHAR(255) UNIQUE NOT NULL,
                          password_hash VARCHAR(255) NOT NULL,
                          status VARCHAR(20),
                          created_at TIMESTAMP,
                          updated_at TIMESTAMP
);

CREATE TABLE account_roles (
                               account_id BIGINT REFERENCES accounts(id) ON DELETE CASCADE,
                               role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
                               PRIMARY KEY (account_id, role_id)
);

-- ================= USERS =================

CREATE TABLE users (
                       user_id BIGINT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
                       first_name VARCHAR(100),
                       last_name VARCHAR(100),
                       email VARCHAR(255),
                       phone_num VARCHAR(20),
                       birth_date DATE,
                       sex VARCHAR(10),
                       address TEXT,
                       description TEXT,
                       avatar_url TEXT,
                       last_update TIMESTAMP
);

-- ================= COMPANIES =================

CREATE TABLE companies (
                           id BIGINT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
                           name VARCHAR(255),
                           logo_url TEXT,
                           website TEXT,
                           address TEXT,
                           description TEXT,
                           company_email VARCHAR(255),
                           industry VARCHAR(100),
                           company_size VARCHAR(50),
                           phone VARCHAR(20),
                           representative_name VARCHAR(255),
                           representative_gender VARCHAR(10),
                           representative_phone VARCHAR(20),
                           tax_code VARCHAR(50),
                           verification_level INT,
                           active BOOLEAN,
                           last_update TIMESTAMP
);

-- ================= JOBS =================

CREATE TABLE jobs (
                      id BIGSERIAL PRIMARY KEY,
                      employer_id BIGINT REFERENCES companies(id),
                      position VARCHAR(255),
                      description TEXT,
                      requirements TEXT,
                      location VARCHAR(255),
                      tech_required TEXT,
                      job_type VARCHAR(50),
                      experience_level VARCHAR(50),
                      status VARCHAR(50),
                      max_accept INT,
                      current_accepted INT,
                      min_salary BIGINT,
                      max_salary BIGINT,
                      due_date DATE,
                      view_count INT,
                      application_count INT,
                      created_at TIMESTAMP
);

-- ================= APPLICATIONS =================

CREATE TABLE job_applications (
                                  id BIGSERIAL PRIMARY KEY,
                                  user_id BIGINT REFERENCES users(user_id),
                                  job_id BIGINT REFERENCES jobs(id),
                                  employer_id BIGINT REFERENCES companies(id),
                                  applicant_name VARCHAR(255),
                                  applicant_email VARCHAR(255),
                                  applicant_phone VARCHAR(20),
                                  cv_url TEXT,
                                  cover_letter TEXT,
                                  status VARCHAR(50),
                                  employer_note TEXT,
                                  applied_at TIMESTAMP,
                                  viewed_at TIMESTAMP
);