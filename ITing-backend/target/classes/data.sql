-- ===============================================
-- DATA.SQL - DỮ LIỆU MẪU CHO ITING JOB PORTAL
-- Password giải mã cho tất cả accounts: 123456
-- ===============================================

-- ===============================================
-- 1. ACCOUNTS (Tài khoản đăng nhập)
-- ===============================================
-- Ứng viên (CANDIDATE) - IDs: 1-10
INSERT INTO accounts (email, password_hash, role, status, created_at, updated_at) VALUES
('ungvien1@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'CANDIDATE', 'ACTIVE', NOW(), NOW()),
('ungvien2@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'CANDIDATE', 'ACTIVE', NOW(), NOW()),
('ungvien3@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'CANDIDATE', 'ACTIVE', NOW(), NOW()),
('ungvien4@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'CANDIDATE', 'ACTIVE', NOW(), NOW()),
('ungvien5@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'CANDIDATE', 'ACTIVE', NOW(), NOW()),
('ungvien6@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'CANDIDATE', 'ACTIVE', NOW(), NOW()),
('ungvien7@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'CANDIDATE', 'ACTIVE', NOW(), NOW()),
('ungvien8@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'CANDIDATE', 'BANNED', NOW(), NOW()),
('ungvien9@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'CANDIDATE', 'ACTIVE', NOW(), NOW()),
('ungvien10@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'CANDIDATE', 'ACTIVE', NOW(), NOW());

-- Nhà tuyển dụng (EMPLOYER) - IDs: 11-20
INSERT INTO accounts (email, password_hash, role, status, created_at, updated_at) VALUES
('hr@fpt.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'EMPLOYER', 'ACTIVE', NOW(), NOW()),
('hr@vng.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'EMPLOYER', 'ACTIVE', NOW(), NOW()),
('hr@vingroup.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'EMPLOYER', 'ACTIVE', NOW(), NOW()),
('hr@tiki.vn', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'EMPLOYER', 'ACTIVE', NOW(), NOW()),
('hr@shopee.vn', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'EMPLOYER', 'ACTIVE', NOW(), NOW()),
('hr@momo.vn', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'EMPLOYER', 'ACTIVE', NOW(), NOW()),
('hr@grab.vn', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'EMPLOYER', 'ACTIVE', NOW(), NOW()),
('hr@techstartup.vn', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'EMPLOYER', 'PENDING', NOW(), NOW()),
('hr@company9.vn', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'EMPLOYER', 'ACTIVE', NOW(), NOW()),
('hr@company10.vn', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'EMPLOYER', 'BANNED', NOW(), NOW());

-- Admin - IDs: 21-23
INSERT INTO accounts (email, password_hash, role, status, created_at, updated_at) VALUES
('admin@iting.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'ADMIN', 'ACTIVE', NOW(), NOW()),
('superadmin@iting.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'ADMIN', 'ACTIVE', NOW(), NOW()),
('moderator@iting.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'ADMIN', 'ACTIVE', NOW(), NOW());

-- ===============================================
-- 2. USERS (Profile ứng viên) - account_id 1-10
-- ===============================================
INSERT INTO users (
  user_id, first_name, last_name, email, phone_num,
  birth_date, sex, address, description, avatar_url, last_update
) VALUES
(1,  'Nguyen', 'Van A', 'nguyenvana@gmail.com',   '0901111111', '1999-01-15', 'MALE',   'Quan 1, TP. Ho Chi Minh',  'Java Developer 2 nam kinh nghiem, dam me Spring Boot va microservices.', 'https://i.pravatar.cc/150?img=1',  NOW()),
(2,  'Tran',   'Thi B', 'tranthib@gmail.com',    '0902222222', '1998-05-20', 'FEMALE', 'Quan 7, TP. Ho Chi Minh',  'Frontend Developer chuyen React va Vue.js, yeu thich UI/UX.',            'https://i.pravatar.cc/150?img=5',  NOW()),
(3,  'Le',     'Van C', 'levanc@gmail.com',      '0903333333', '1997-11-10', 'MALE',   'Cau Giay, Ha Noi',         'DevOps Engineer kinh nghiem AWS, Docker, Kubernetes.',                  'https://i.pravatar.cc/150?img=3',  NOW()),
(4,  'Pham',   'Thi D', 'phamthid@gmail.com',    '0904444444', '2000-03-25', 'FEMALE', 'Binh Thanh, TP. Ho Chi Minh','Full Stack Developer, Node.js va React.',                               'https://i.pravatar.cc/150?img=9',  NOW()),
(5,  'Hoang',  'Van E', 'hoangvane@gmail.com',   '0905555555', '1996-07-08', 'MALE',   'Dong Da, Ha Noi',          'Data Engineer 3 nam kinh nghiem Python va Spark.',                      'https://i.pravatar.cc/150?img=11', NOW()),
(6,  'Nguyen', 'Thi F', 'nguyenthif@gmail.com',  '0906666666', '1999-12-01', 'FEMALE', 'Da Nang',                  'Mobile Developer Flutter va React Native.',                             'https://i.pravatar.cc/150?img=20', NOW()),
(7,  'Vu',     'Van G', 'vuvang@gmail.com',      '0907777777', '1998-08-18', 'MALE',   'Quan 3, TP. Ho Chi Minh',  'QA Engineer chuyen automation testing.',                                 'https://i.pravatar.cc/150?img=12', NOW()),
(8,  'Dang',   'Van H', 'dangvanh@gmail.com',    '0908888888', '1997-04-22', 'MALE',   'Hai Phong',                'Tai khoan bi khoa do spam',                                             'https://i.pravatar.cc/150?img=14', NOW()),
(9,  'Bui',    'Thi I', 'buithii@gmail.com',     '0909999999', '2001-02-14', 'FEMALE', 'Can Tho',                  'Fresher Java Developer moi tot nghiep.',                                'https://i.pravatar.cc/150?img=25', NOW()),
(10, 'Ngo',    'Van K', 'ngovank@gmail.com',     '0900000010', '1995-09-30', 'MALE',   'Binh Duong',               'Senior Backend Developer 5 nam kinh nghiem.',                           'https://i.pravatar.cc/150?img=15', NOW());
-- ===============================================
-- 3. COMPANIES (Profile công ty) - account_id 11-20
-- ===============================================
INSERT INTO companies (id, name, logo_url, website, address, description, company_email, industry, company_size, phone, representative_name, representative_gender, representative_phone, account_email, tax_code, verification_level, active, last_update) VALUES
(11, 'FPT Software', 'https://fpt-software.com/logo.png', 'https://fpt-software.com', 'Khu CNC, Quan 9, TP. HCM', 'Cong ty phan mem hang dau Viet Nam', 'recruitment@fpt.com', 'IT Software', '5000+', '0281234567', 'Nguyen Van HR', 'MALE', '0901234567', 'hr@fpt.com', '0101234567', 3, true, NOW()),
(12, 'VNG Corporation', 'https://vng.com.vn/logo.png', 'https://vng.com.vn', '182 Le Dai Hanh, Q11, TP. HCM', 'Ky lan cong nghe Viet Nam - Zalo, ZaloPay', 'hr@vng.com.vn', 'Technology', '3000+', '0282345678', 'Tran Thi Recruiter', 'FEMALE', '0912345678', 'hr@vng.com', '0102345678', 3, true, NOW()),
(13, 'VinGroup', 'https://vingroup.net/logo.png', 'https://vingroup.net', 'Bang Lang 1, Vinhomes Riverside, Ha Noi', 'Tap doan kinh te tu nhan lon nhat Viet Nam', 'careers@vingroup.net', 'Technology', '10000+', '0243456789', 'Le Van Manager', 'MALE', '0923456789', 'hr@vingroup.com', '0103456789', 2, true, NOW()),
(14, 'Tiki Corporation', 'https://tiki.vn/logo.png', 'https://tiki.vn', 'Quan 7, TP. Ho Chi Minh', 'San thuong mai dien tu hang dau Viet Nam', 'careers@tiki.vn', 'E-commerce', '2000+', '0284567890', 'Pham Thi HR', 'FEMALE', '0934567890', 'hr@tiki.vn', '0104567890', 3, true, NOW()),
(15, 'Shopee Vietnam', 'https://shopee.vn/logo.png', 'https://shopee.vn', 'Quan 1, TP. Ho Chi Minh', 'Nen tang TMDT so 1 Dong Nam A', 'careers@shopee.vn', 'E-commerce', '5000+', '0285678901', 'Hoang Van Talent', 'MALE', '0945678901', 'hr@shopee.vn', '0105678901', 3, true, NOW()),
(16, 'MoMo', 'https://momo.vn/logo.png', 'https://momo.vn', 'Quan 3, TP. Ho Chi Minh', 'Vi dien tu hang dau Viet Nam', 'jobs@momo.vn', 'Fintech', '1500+', '0286789012', 'Nguyen Thi People', 'FEMALE', '0956789012', 'hr@momo.vn', '0106789012', 3, true, NOW()),
(17, 'Grab Vietnam', 'https://grab.com/logo.png', 'https://grab.com', 'Quan 1, TP. Ho Chi Minh', 'Super App hang dau Dong Nam A', 'careers@grab.com', 'Technology', '2000+', '0287890123', 'Tran Van Recruit', 'MALE', '0967890123', 'hr@grab.vn', '0107890123', 3, true, NOW()),
(18, 'Tech Startup XYZ', 'https://startup.vn/logo.png', 'https://techstartup.vn', 'Quan 10, TP. Ho Chi Minh', 'Startup AI/ML moi thanh lap', 'hello@techstartup.vn', 'AI/ML', '10-50', '0288901234', 'Startup Founder', 'MALE', '0978901234', 'hr@techstartup.vn', '0108901234', 1, true, NOW()),
(19, 'Company 9', 'https://company9.vn/logo.png', 'https://company9.vn', 'Da Nang', 'Cong ty outsource', 'info@company9.vn', 'IT Services', '200+', '0289012345', 'Director 9', 'MALE', '0989012345', 'hr@company9.vn', '0109012345', 2, true, NOW()),
(20, 'Bad Company', 'https://bad.vn/logo.png', 'https://badcompany.vn', 'Unknown', 'Cong ty bi khoa do vi pham', 'spam@bad.vn', 'Unknown', '10', '0280000000', 'Spammer', 'MALE', '0900000000', 'hr@company10.vn', '0100000000', 0, false, NOW());

-- ===============================================
-- 4. JOBS (Việc làm)
-- ===============================================
-- FPT Jobs
INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at) VALUES
(11, 'Java Developer', 'Phat trien ung dung Java/Spring Boot. Lam viec Agile/Scrum.', '2+ nam Java, REST API, SQL', 'TP. Ho Chi Minh', 'Java, Spring Boot, MySQL, Docker', 'FULL_TIME', 'JUNIOR', 'ACTIVE', 5, 0, 15000000, 30000000, '2025-03-01', 150, 12, NOW()),
(11, 'React Developer', 'Xay dung UI voi React.js. Tich hop API.', '2+ nam React, TypeScript', 'TP. Ho Chi Minh', 'React, TypeScript, Redux', 'FULL_TIME', 'MIDDLE', 'ACTIVE', 3, 1, 18000000, 35000000, '2025-02-28', 200, 18, NOW()),
(11, 'DevOps Engineer', 'Quan ly CI/CD, cloud infrastructure.', '3+ nam DevOps, AWS, K8s', 'Ha Noi', 'AWS, Docker, Kubernetes, Jenkins', 'FULL_TIME', 'SENIOR', 'ACTIVE', 2, 0, 25000000, 45000000, '2025-02-15', 180, 8, NOW()),
(11, 'Java Intern', 'Thuc tap Java, hoc hoi tu team senior.', 'Sinh vien nam 3-4 CNTT', 'TP. Ho Chi Minh', 'Java, Spring Boot', 'INTERNSHIP', 'FRESHER', 'ACTIVE', 10, 3, 5000000, 8000000, '2025-03-01', 500, 45, NOW());

-- VNG Jobs
INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at) VALUES
(12, 'Backend Engineer (Zalo)', 'Phat trien backend Zalo, xu ly high traffic.', '3+ nam backend, Go/Java', 'TP. Ho Chi Minh', 'Go, Java, MySQL, Kafka, gRPC', 'FULL_TIME', 'SENIOR', 'ACTIVE', 4, 1, 25000000, 50000000, '2025-03-15', 320, 25, NOW()),
(12, 'Mobile Developer', 'Phat trien app iOS/Android.', '2+ nam mobile, Swift/Kotlin', 'TP. Ho Chi Minh', 'Swift, Kotlin, Flutter', 'FULL_TIME', 'MIDDLE', 'ACTIVE', 3, 0, 20000000, 40000000, '2025-03-01', 250, 15, NOW()),
(12, 'Data Engineer', 'Xay dung data pipeline, ETL.', '3+ nam data, Python, Spark', 'TP. Ho Chi Minh', 'Python, Spark, Hadoop, Airflow', 'FULL_TIME', 'SENIOR', 'ACTIVE', 2, 0, 30000000, 55000000, '2025-02-28', 180, 10, NOW()),
(12, 'Frontend Intern', 'Thuc tap React, CSS.', 'Sinh vien CNTT, HTML/CSS/JS', 'TP. Ho Chi Minh', 'HTML, CSS, JavaScript, React', 'INTERNSHIP', 'FRESHER', 'ACTIVE', 5, 1, 4000000, 7000000, '2025-02-28', 350, 28, NOW());

-- VinGroup Jobs
INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at) VALUES
(13, 'AI/ML Engineer', 'Phat trien giai phap AI/ML cho VinAI.', '2+ nam ML, Python, TensorFlow', 'Ha Noi', 'Python, TensorFlow, PyTorch, NLP', 'FULL_TIME', 'MIDDLE', 'ACTIVE', 3, 0, 35000000, 70000000, '2025-04-01', 400, 30, NOW()),
(13, 'Full Stack Developer', 'Phat trien web full stack microservices.', '2+ nam Node.js, React', 'Ha Noi', 'Node.js, React, MongoDB, AWS', 'FULL_TIME', 'MIDDLE', 'ACTIVE', 5, 2, 20000000, 40000000, '2025-03-15', 280, 22, NOW()),
(13, 'QA Engineer', 'Test automation, dam bao chat luong.', '1+ nam QA, Selenium', 'TP. Ho Chi Minh', 'Selenium, Appium, JMeter, Postman', 'FULL_TIME', 'JUNIOR', 'ACTIVE', 2, 0, 15000000, 30000000, '2025-02-20', 120, 8, NOW());

-- Tiki Jobs
INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at) VALUES
(14, 'Golang Developer', 'Phat trien backend microservices.', '2+ nam Go, gRPC', 'TP. Ho Chi Minh', 'Golang, gRPC, PostgreSQL, Redis', 'FULL_TIME', 'MIDDLE', 'ACTIVE', 4, 0, 22000000, 42000000, '2025-03-10', 200, 15, NOW()),
(14, 'Product Manager', 'Quan ly san pham TMDT.', '3+ nam PM, Agile', 'TP. Ho Chi Minh', 'Agile, Jira, Data Analysis', 'FULL_TIME', 'MIDDLE', 'ACTIVE', 2, 0, 30000000, 50000000, '2025-03-15', 150, 10, NOW());

-- Shopee Jobs
INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at) VALUES
(15, 'Senior Python Engineer', 'Backend services Python.', '4+ nam Python, Django/FastAPI', 'TP. Ho Chi Minh', 'Python, Django, FastAPI, PostgreSQL', 'FULL_TIME', 'SENIOR', 'ACTIVE', 3, 0, 35000000, 60000000, '2025-04-01', 280, 20, NOW()),
(15, 'React Native Developer', 'Phat trien app cross-platform.', '2+ nam RN', 'TP. Ho Chi Minh', 'React Native, TypeScript, Redux', 'FULL_TIME', 'MIDDLE', 'ACTIVE', 3, 0, 25000000, 45000000, '2025-03-20', 220, 18, NOW());

-- MoMo Jobs
INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at) VALUES
(16, 'Fintech Backend Developer', 'Phat trien payment services.', '3+ nam Java, security', 'TP. Ho Chi Minh', 'Java, Spring Boot, Security, PostgreSQL', 'FULL_TIME', 'SENIOR', 'ACTIVE', 2, 0, 30000000, 55000000, '2025-03-25', 180, 12, NOW()),
(16, 'Security Engineer', 'Bao mat he thong thanh toan.', '3+ nam security', 'TP. Ho Chi Minh', 'Security, Penetration Testing, OWASP', 'FULL_TIME', 'SENIOR', 'ACTIVE', 1, 0, 35000000, 65000000, '2025-04-01', 150, 8, NOW());

-- Grab Jobs
INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at) VALUES
(17, 'Site Reliability Engineer', 'Quan ly infrastructure, on-call.', '3+ nam SRE, cloud', 'TP. Ho Chi Minh', 'AWS, GCP, Kubernetes, Prometheus', 'FULL_TIME', 'SENIOR', 'ACTIVE', 2, 0, 40000000, 70000000, '2025-04-15', 200, 10, NOW()),
(17, 'Data Scientist', 'ML models for ride-matching.', '2+ nam DS, Python', 'TP. Ho Chi Minh', 'Python, Machine Learning, SQL, Spark', 'FULL_TIME', 'MIDDLE', 'ACTIVE', 2, 0, 30000000, 55000000, '2025-03-30', 250, 15, NOW());

-- Startup Jobs (Pending company)
INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at) VALUES
(18, 'AI Research Intern', 'Nghien cuu AI/ML.', 'Sinh vien AI/ML', 'TP. Ho Chi Minh', 'Python, PyTorch, Math', 'INTERNSHIP', 'FRESHER', 'PENDING', 3, 0, 6000000, 10000000, '2025-03-01', 100, 5, NOW());

-- Remote Jobs
INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at) VALUES
(19, 'Remote React Developer', 'Lam viec tu xa, React projects.', '2+ nam React', 'Remote', 'React, TypeScript, NextJS', 'REMOTE', 'MIDDLE', 'ACTIVE', 5, 0, 20000000, 40000000, '2025-04-01', 400, 35, NOW()),
(19, 'Part-time Python Developer', 'Du an Python part-time.', '1+ nam Python', 'Remote', 'Python, Django, Flask', 'PART_TIME', 'JUNIOR', 'ACTIVE', 3, 0, 8000000, 15000000, '2025-03-15', 180, 12, NOW());

-- ===============================================
-- 5. JOB APPLICATIONS (Đơn ứng tuyển)
-- ===============================================
INSERT INTO job_applications (user_id, job_id, employer_id, applicant_name, applicant_email, applicant_phone, cv_url, cover_letter, status, employer_note, applied_at, viewed_at) VALUES
(1, 1, 11, 'Nguyen Van A', 'nguyenvana@gmail.com', '0901111111', '/uploads/cv/user1_cv.pdf', 'Toi muon ung tuyen vi tri Java Developer tai FPT.', 'PENDING', NULL, NOW(), NULL),
(1, 5, 12, 'Nguyen Van A', 'nguyenvana@gmail.com', '0901111111', '/uploads/cv/user1_cv.pdf', 'Ung tuyen Backend Engineer tai VNG.', 'PENDING', NULL, NOW(), NULL),
(2, 2, 11, 'Tran Thi B', 'tranthib@gmail.com', '0902222222', '/uploads/cv/user2_cv.pdf', 'Ung tuyen React Developer.', 'VIEWED', NULL, NOW(), NOW()),
(2, 6, 12, 'Tran Thi B', 'tranthib@gmail.com', '0902222222', '/uploads/cv/user2_cv.pdf', 'Ung tuyen Mobile Developer VNG.', 'INTERVIEWING', 'Hen phong van 15/12', NOW(), NOW()),
(3, 3, 11, 'Le Van C', 'levanc@gmail.com', '0903333333', '/uploads/cv/user3_cv.pdf', 'Ung tuyen DevOps Engineer FPT.', 'SHORTLISTED', 'Kinh nghiem tot', NOW(), NOW()),
(3, 21, 17, 'Le Van C', 'levanc@gmail.com', '0903333333', '/uploads/cv/user3_cv.pdf', 'Ung tuyen SRE Grab.', 'PENDING', NULL, NOW(), NULL),
(4, 10, 13, 'Pham Thi D', 'phamthid@gmail.com', '0904444444', '/uploads/cv/user4_cv.pdf', 'Ung tuyen Full Stack Developer VinGroup.', 'ACCEPTED', 'Da nhan offer', NOW(), NOW()),
(5, 7, 12, 'Hoang Van E', 'hoangvane@gmail.com', '0905555555', '/uploads/cv/user5_cv.pdf', 'Ung tuyen Data Engineer VNG.', 'PENDING', NULL, NOW(), NULL),
(5, 22, 17, 'Hoang Van E', 'hoangvane@gmail.com', '0905555555', '/uploads/cv/user5_cv.pdf', 'Ung tuyen Data Scientist Grab.', 'VIEWED', NULL, NOW(), NOW()),
(6, 6, 12, 'Nguyen Thi F', 'nguyenthif@gmail.com', '0906666666', '/uploads/cv/user6_cv.pdf', 'Ung tuyen Mobile Developer.', 'REJECTED', 'Chua du kinh nghiem', NOW(), NOW()),
(7, 11, 13, 'Vu Van G', 'vuvang@gmail.com', '0907777777', '/uploads/cv/user7_cv.pdf', 'Ung tuyen QA Engineer VinGroup.', 'INTERVIEWING', 'Phong van vong 2', NOW(), NOW()),
(9, 4, 11, 'Bui Thi I', 'buithii@gmail.com', '0909999999', '/uploads/cv/user9_cv.pdf', 'Ung tuyen Java Intern FPT.', 'ACCEPTED', 'Nhan thuc tap', NOW(), NOW()),
(9, 8, 12, 'Bui Thi I', 'buithii@gmail.com', '0909999999', '/uploads/cv/user9_cv.pdf', 'Ung tuyen Frontend Intern VNG.', 'PENDING', NULL, NOW(), NULL),
(10, 15, 15, 'Ngo Van K', 'ngovank@gmail.com', '0900000010', '/uploads/cv/user10_cv.pdf', 'Ung tuyen Senior Python Engineer Shopee.', 'SHORTLISTED', 'Ung vien senior tot', NOW(), NOW());

-- ===============================================
-- 6. SKILLS (Kỹ năng)
-- ===============================================
INSERT INTO skill (user_id, skill, level) VALUES
(1, 'Java', 'Advanced'), (1, 'Spring Boot', 'Intermediate'), (1, 'MySQL', 'Intermediate'), (1, 'Git', 'Advanced'), (1, 'Docker', 'Beginner'),
(2, 'JavaScript', 'Advanced'), (2, 'React.js', 'Advanced'), (2, 'Vue.js', 'Intermediate'), (2, 'TypeScript', 'Intermediate'), (2, 'CSS', 'Advanced'),
(3, 'AWS', 'Advanced'), (3, 'Docker', 'Advanced'), (3, 'Kubernetes', 'Intermediate'), (3, 'Jenkins', 'Advanced'), (3, 'Linux', 'Advanced'),
(4, 'Node.js', 'Advanced'), (4, 'React', 'Intermediate'), (4, 'MongoDB', 'Intermediate'), (4, 'TypeScript', 'Intermediate'),
(5, 'Python', 'Advanced'), (5, 'Spark', 'Advanced'), (5, 'SQL', 'Advanced'), (5, 'Airflow', 'Intermediate'),
(6, 'Flutter', 'Advanced'), (6, 'Dart', 'Advanced'), (6, 'React Native', 'Intermediate'), (6, 'Firebase', 'Intermediate'),
(7, 'Selenium', 'Advanced'), (7, 'Appium', 'Intermediate'), (7, 'Postman', 'Advanced'), (7, 'JMeter', 'Intermediate'),
(9, 'Java', 'Beginner'), (9, 'Spring Boot', 'Beginner'), (9, 'SQL', 'Beginner'),
(10, 'Java', 'Expert'), (10, 'Spring Boot', 'Expert'), (10, 'Microservices', 'Advanced'), (10, 'Kafka', 'Advanced');

-- ===============================================
-- 7. EDUCATION (Học vấn)
-- ===============================================
INSERT INTO education (user_id, school, degree, start_date, end_date, description) VALUES
(1, 'DH Bach Khoa TP.HCM', 'Cu nhan CNTT', '2017-09-01', '2021-06-30', 'Tot nghiep loai Kha'),
(2, 'DH RMIT Viet Nam', 'Cu nhan CNTT', '2016-09-01', '2020-06-30', 'Tot nghiep loai Gioi'),
(3, 'DH Bach Khoa Ha Noi', 'Ky su CNTT', '2015-09-01', '2020-06-30', 'Luan van Cloud Computing'),
(4, 'DH FPT', 'Cu nhan CNTT', '2018-09-01', '2022-06-30', 'Tot nghiep loai Kha'),
(5, 'DH Khoa hoc Tu nhien', 'Thac si Data Science', '2014-09-01', '2019-06-30', 'Tot nghiep xuat sac'),
(6, 'DH Da Nang', 'Cu nhan CNTT', '2017-09-01', '2021-06-30', 'Chuyen nganh Mobile'),
(7, 'DH Cong nghe TP.HCM', 'Cu nhan CNTT', '2016-09-01', '2020-06-30', 'Tot nghiep loai Kha'),
(9, 'DH Can Tho', 'Cu nhan CNTT', '2019-09-01', '2023-06-30', 'Moi tot nghiep'),
(10, 'DH Bach Khoa TP.HCM', 'Thac si CNTT', '2013-09-01', '2018-06-30', 'Tot nghiep xuat sac');

-- ===============================================
-- 8. EXPERIENCE (Kinh nghiệm)
-- ===============================================
INSERT INTO experience (user_id, company, role, start_date, end_date, description) VALUES
(1, 'FPT Intern', 'Java Intern', '2020-06-01', '2020-12-31', 'Thuc tap Java/Spring Boot'),
(1, 'Startup ABC', 'Junior Developer', '2021-01-01', '2023-06-30', 'Phat trien REST API'),
(2, 'Agency XYZ', 'Frontend Dev', '2020-07-01', '2022-12-31', 'React, Vue.js projects'),
(2, 'Tech Corp', 'Senior Frontend', '2023-01-01', NULL, 'Lead team 3 nguoi'),
(3, 'Cloud Vietnam', 'Sys Admin', '2020-07-01', '2021-12-31', 'Quan ly Linux servers'),
(3, 'Big Corp', 'DevOps Engineer', '2022-01-01', NULL, 'CI/CD, K8s'),
(4, 'Freelance', 'Full Stack Dev', '2022-07-01', NULL, 'Node.js, React projects'),
(5, 'Data Company', 'Data Engineer', '2019-07-01', NULL, 'ETL, Spark pipelines'),
(6, 'Mobile Agency', 'Mobile Dev', '2021-07-01', NULL, 'Flutter apps'),
(7, 'QA Center', 'QA Engineer', '2020-07-01', NULL, 'Automation testing'),
(10, 'Big Tech', 'Senior Backend', '2018-07-01', NULL, '5 nam Java/Spring');

-- ===============================================
-- 9. CERTIFICATES (Chứng chỉ)
-- ===============================================
INSERT INTO certificate (user_id, name, organization, date) VALUES
(1, 'Oracle Certified Java', 'Oracle', '2021-03-15'),
(1, 'Spring Professional', 'VMware', '2022-06-20'),
(2, 'Meta Frontend Developer', 'Meta', '2021-08-10'),
(3, 'AWS Solutions Architect', 'AWS', '2021-05-15'),
(3, 'CKA', 'CNCF', '2023-01-10'),
(5, 'Google Data Engineer', 'Google', '2020-12-01'),
(7, 'ISTQB Foundation', 'ISTQB', '2021-03-20'),
(10, 'AWS Developer Associate', 'AWS', '2019-08-15');

-- ===============================================
-- 10. PORTFOLIO
-- ===============================================
INSERT INTO portfolio (user_id, type, url, description) VALUES
(1, 'LINK', 'https://github.com/user1/ecommerce-api', 'E-commerce REST API'),
(2, 'LINK', 'https://portfolio.user2.com', 'Personal portfolio'),
(2, 'LINK', 'https://dribbble.com/user2', 'UI designs'),
(3, 'LINK', 'https://github.com/user3/terraform-modules', 'Terraform modules'),
(4, 'LINK', 'https://github.com/user4/fullstack-app', 'Full stack project'),
(6, 'LINK', 'https://github.com/user6/flutter-apps', 'Flutter applications');

-- ===============================================
-- 11. SOCIAL LINKS
-- ===============================================
INSERT INTO social_link (user_id, platform, url) VALUES
(1, 'LinkedIn', 'https://linkedin.com/in/user1'), (1, 'GitHub', 'https://github.com/user1'),
(2, 'LinkedIn', 'https://linkedin.com/in/user2'), (2, 'GitHub', 'https://github.com/user2'), (2, 'Dribbble', 'https://dribbble.com/user2'),
(3, 'LinkedIn', 'https://linkedin.com/in/user3'), (3, 'GitHub', 'https://github.com/user3'),
(4, 'LinkedIn', 'https://linkedin.com/in/user4'), (5, 'LinkedIn', 'https://linkedin.com/in/user5'),
(6, 'LinkedIn', 'https://linkedin.com/in/user6'), (7, 'LinkedIn', 'https://linkedin.com/in/user7'),
(10, 'LinkedIn', 'https://linkedin.com/in/user10'), (10, 'GitHub', 'https://github.com/user10');

-- ===============================================
-- 12. CONTACT INFO
-- ===============================================
INSERT INTO contact_info (user_id, phone, email) VALUES
(1, '0901111111', 'nguyenvana.work@gmail.com'),
(2, '0902222222', 'tranthib.dev@gmail.com'),
(3, '0903333333', 'levanc.devops@gmail.com'),
(4, '0904444444', 'phamthid.dev@gmail.com'),
(5, '0905555555', 'hoangvane.data@gmail.com'),
(6, '0906666666', 'nguyenthif.mobile@gmail.com'),
(7, '0907777777', 'vuvang.qa@gmail.com'),
(9, '0909999999', 'buithii.fresher@gmail.com'),
(10, '0900000010', 'ngovank.senior@gmail.com');

-- ===============================================
-- 13. CV
-- ===============================================
INSERT INTO cv (user_id, file_url, uploaded_at) VALUES
(1, '/uploads/cv/user1_cv_2024.pdf', '2024-01-15'),
(2, '/uploads/cv/user2_cv.pdf', '2024-03-10'),
(3, '/uploads/cv/user3_resume.pdf', '2024-02-28'),
(4, '/uploads/cv/user4_cv.pdf', '2024-04-05'),
(5, '/uploads/cv/user5_cv.pdf', '2024-03-20'),
(6, '/uploads/cv/user6_cv.pdf', '2024-05-01'),
(7, '/uploads/cv/user7_cv.pdf', '2024-02-15'),
(9, '/uploads/cv/user9_cv.pdf', '2024-06-01'),
(10, '/uploads/cv/user10_cv.pdf', '2024-01-05');

-- ===============================================
-- 14. CATEGORIES
-- ===============================================
-- Ngành nghề
INSERT INTO categories (type, name, name_en, description, sort_order, active, created_at) VALUES
('INDUSTRY', 'Cong nghe thong tin', 'Information Technology', 'Phan mem, phan cung, IT services', 1, true, NOW()),
('INDUSTRY', 'Tai chinh - Ngan hang', 'Finance & Banking', 'Ngan hang, bao hiem, chung khoan', 2, true, NOW()),
('INDUSTRY', 'Marketing', 'Marketing', 'Digital marketing, PR, quang cao', 3, true, NOW()),
('INDUSTRY', 'Ban hang', 'Sales', 'Kinh doanh, ban hang', 4, true, NOW()),
('INDUSTRY', 'Nhan su', 'Human Resources', 'Tuyen dung, dao tao', 5, true, NOW()),
('INDUSTRY', 'Ke toan', 'Accounting', 'Ke toan, kiem toan', 6, true, NOW()),
('INDUSTRY', 'Giao duc', 'Education', 'Giang day, dao tao', 7, true, NOW()),
('INDUSTRY', 'Y te', 'Healthcare', 'Benh vien, duoc pham', 8, true, NOW());

-- Kỹ năng
INSERT INTO categories (type, name, name_en, sort_order, active, created_at) VALUES
('SKILL', 'Java', 'Java', 1, true, NOW()),
('SKILL', 'Python', 'Python', 2, true, NOW()),
('SKILL', 'JavaScript', 'JavaScript', 3, true, NOW()),
('SKILL', 'React', 'React', 4, true, NOW()),
('SKILL', 'Node.js', 'Node.js', 5, true, NOW()),
('SKILL', 'SQL', 'SQL', 6, true, NOW()),
('SKILL', 'AWS', 'AWS', 7, true, NOW()),
('SKILL', 'Docker', 'Docker', 8, true, NOW()),
('SKILL', 'Kubernetes', 'Kubernetes', 9, true, NOW()),
('SKILL', 'Git', 'Git', 10, true, NOW());

-- Địa điểm
INSERT INTO categories (type, name, name_en, sort_order, active, created_at) VALUES
('LOCATION', 'Ho Chi Minh', 'Ho Chi Minh City', 1, true, NOW()),
('LOCATION', 'Ha Noi', 'Hanoi', 2, true, NOW()),
('LOCATION', 'Da Nang', 'Da Nang', 3, true, NOW()),
('LOCATION', 'Can Tho', 'Can Tho', 4, true, NOW()),
('LOCATION', 'Remote', 'Remote', 5, true, NOW());

-- ===============================================
-- 15. STATIC CONTENTS
-- ===============================================
INSERT INTO static_contents (slug, type, title, content, meta_description, published, sort_order, view_count, created_at, published_at) VALUES
('about', 'PAGE', 'Ve chung toi', '<h2>ITing - Nen tang tuyen dung IT hang dau Viet Nam</h2><p>Ket noi nhan tai voi doanh nghiep.</p>', 'ITing - Tuyen dung IT', true, 1, 0, NOW(), NOW()),
('terms', 'PAGE', 'Dieu khoan su dung', '<h2>Dieu khoan</h2><p>Quy dinh su dung dich vu ITing.</p>', 'Dieu khoan ITing', true, 2, 0, NOW(), NOW()),
('privacy', 'PAGE', 'Chinh sach bao mat', '<h2>Bao mat</h2><p>Cam ket bao ve thong tin nguoi dung.</p>', 'Chinh sach bao mat ITing', true, 3, 0, NOW(), NOW());

-- FAQ
INSERT INTO static_contents (slug, type, title, content, published, sort_order, view_count, created_at, published_at) VALUES
('faq-1', 'FAQ', 'Lam the nao de dang ky tai khoan?', 'Nhan nut Dang ky va dien thong tin.', true, 1, 0, NOW(), NOW()),
('faq-2', 'FAQ', 'Lam the nao de ung tuyen?', 'Dang nhap, tim viec va nhan Ung tuyen.', true, 2, 0, NOW(), NOW()),
('faq-3', 'FAQ', 'Lam the nao de dang tin tuyen dung?', 'Dang nhap Employer, vao Dang tin.', true, 3, 0, NOW(), NOW());

-- Blog
INSERT INTO static_contents (slug, type, title, content, meta_description, thumbnail_url, published, sort_order, author_id, view_count, created_at, published_at) VALUES
('blog-cv-tips', 'BLOG', '10 meo viet CV an tuong', '<p>Huong dan viet CV cho Developer.</p>', 'Meo viet CV', 'https://example.com/cv.jpg', true, 1, 21, 150, NOW(), NOW()),
('blog-interview', 'BLOG', 'Chuan bi phong van ky thuat', '<p>Cach on tap cho phong van IT.</p>', 'Phong van IT', 'https://example.com/interview.jpg', true, 2, 21, 200, NOW(), NOW());

-- ===============================================
-- 16. USER REPORTS (Báo cáo vi phạm)
-- ===============================================
INSERT INTO user_reports (reporter_id, reported_user_id, type, reason, description, status, admin_note, handled_by, created_at, handled_at) VALUES
(1, 8, 'SPAM', 'Tai khoan spam tin nhan', 'Nhan duoc nhieu tin nhan quang cao tu tai khoan nay.', 'RESOLVED', 'Da khoa tai khoan', 21, NOW(), NOW()),
(2, 20, 'SCAM', 'Cong ty lua dao', 'Cong ty yeu cau dong tien truoc khi phong van.', 'RESOLVED', 'Da khoa cong ty', 21, NOW(), NOW()),
(3, 8, 'HARASSMENT', 'Quay roi', 'Lien tuc gui tin nhan khong mong muon.', 'RESOLVED', 'Da xu ly cung bao cao truoc', 22, NOW(), NOW()),
(4, 18, 'FAKE_INFO', 'Thong tin sai', 'Cong ty chua xac minh nhung dang tuyen dung.', 'PENDING', NULL, NULL, NOW(), NULL),
(5, 6, 'OTHER', 'Copy CV', 'Sao chep CV cua nguoi khac.', 'REVIEWING', 'Dang xac minh', 22, NOW(), NULL);

-- ===============================================
-- 17. ACTIVITY LOGS (Nhật ký hoạt động)
-- ===============================================
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, ip_address, user_agent, created_at) VALUES
(21, 'LOGIN', NULL, NULL, 'Admin dang nhap', '192.168.1.1', 'Mozilla/5.0 Chrome', NOW()),
(1, 'LOGIN', NULL, NULL, 'User dang nhap', '192.168.1.100', 'Mozilla/5.0 Chrome', NOW()),
(1, 'APPLY_JOB', 'JOB', 1, 'Ung tuyen Java Developer tai FPT', '192.168.1.100', 'Mozilla/5.0 Chrome', NOW()),
(1, 'UPDATE_PROFILE', 'USER', 1, 'Cap nhat ho so ca nhan', '192.168.1.100', 'Mozilla/5.0 Chrome', NOW()),
(11, 'LOGIN', NULL, NULL, 'Employer dang nhap', '192.168.1.50', 'Mozilla/5.0 Firefox', NOW()),
(11, 'CREATE_JOB', 'JOB', 1, 'Tao tin tuyen dung Java Developer', '192.168.1.50', 'Mozilla/5.0 Firefox', NOW()),
(11, 'VIEW_APPLICATION', 'APPLICATION', 1, 'Xem don ung tuyen', '192.168.1.50', 'Mozilla/5.0 Firefox', NOW()),
(21, 'BAN_USER', 'USER', 8, 'Khoa tai khoan vi spam', '192.168.1.1', 'Mozilla/5.0 Chrome', NOW()),
(21, 'BAN_COMPANY', 'COMPANY', 20, 'Khoa cong ty vi lua dao', '192.168.1.1', 'Mozilla/5.0 Chrome', NOW()),
(2, 'APPLY_JOB', 'JOB', 2, 'Ung tuyen React Developer', '192.168.1.101', 'Mozilla/5.0 Safari', NOW()),
(22, 'APPROVE_JOB', 'JOB', 23, 'Duyet tin tuyen dung', '192.168.1.2', 'Mozilla/5.0 Chrome', NOW()),
(3, 'LOGIN', NULL, NULL, 'User dang nhap', '192.168.1.102', 'Mozilla/5.0 Edge', NOW());
