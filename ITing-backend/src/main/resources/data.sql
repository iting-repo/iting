-- ===============================================
-- DATA.SQL - DỮ LIỆU MẪU CHO ITING JOB PORTAL
-- Password giải mã cho tất cả accounts: 123456
-- ===============================================

-- ===============================================
-- 1. ACCOUNTS (Tài khoản đăng nhập)
-- ===============================================
-- Ứng viên (CANDIDATE)
INSERT INTO accounts (email, password_hash, role, status, created_at, updated_at)
VALUES ('ungvien1@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'CANDIDATE', 'ACTIVE', NOW(), NOW());

INSERT INTO accounts (email, password_hash, role, status, created_at, updated_at)
VALUES ('ungvien2@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'CANDIDATE', 'ACTIVE', NOW(), NOW());

INSERT INTO accounts (email, password_hash, role, status, created_at, updated_at)
VALUES ('ungvien3@gmail.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'CANDIDATE', 'ACTIVE', NOW(), NOW());

-- Nhà tuyển dụng (EMPLOYER)
INSERT INTO accounts (email, password_hash, role, status, created_at, updated_at)
VALUES ('hr@fpt.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'EMPLOYER', 'ACTIVE', NOW(), NOW());

INSERT INTO accounts (email, password_hash, role, status, created_at, updated_at)
VALUES ('hr@vng.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'EMPLOYER', 'ACTIVE', NOW(), NOW());

INSERT INTO accounts (email, password_hash, role, status, created_at, updated_at)
VALUES ('hr@vingroup.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'EMPLOYER', 'ACTIVE', NOW(), NOW());

-- Admin
INSERT INTO accounts (email, password_hash, role, status, created_at, updated_at)
VALUES ('admin@iting.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'ADMIN', 'ACTIVE', NOW(), NOW());

-- ===============================================
-- 2. USERS (Profile ứng viên) - IDs: 1, 2, 3
-- ===============================================
INSERT INTO users (user_id, first_name, last_name, birth_date, sex, address, description, avatar_url, last_update)
VALUES (1, 'Nguyen', 'Van A', '1999-01-15', 'MALE', 'Quan 1, TP. Ho Chi Minh', 
'Sinh vien CNTT nam cuoi, dam me Java va Spring Boot. Co kha nang lam viec nhom tot, tu hoc cao.', 
'https://i.pravatar.cc/150?img=1', NOW());

INSERT INTO users (user_id, first_name, last_name, birth_date, sex, address, description, avatar_url, last_update)
VALUES (2, 'Tran', 'Thi B', '1998-05-20', 'FEMALE', 'Quan 7, TP. Ho Chi Minh', 
'Frontend Developer voi 2 nam kinh nghiem React va Vue.js. Thich thiet ke UI/UX dep va toi uu trai nghiem nguoi dung.', 
'https://i.pravatar.cc/150?img=5', NOW());

INSERT INTO users (user_id, first_name, last_name, birth_date, sex, address, description, avatar_url, last_update)
VALUES (3, 'Le', 'Van C', '1997-11-10', 'MALE', 'Quan Cau Giay, Ha Noi', 
'DevOps Engineer voi kinh nghiem AWS, Docker, Kubernetes. Dam me tu dong hoa va CI/CD.', 
'https://i.pravatar.cc/150?img=3', NOW());

-- ===============================================
-- 3. COMPANIES (Profile công ty) - IDs: 4, 5, 6
-- ===============================================
INSERT INTO companies (id, name, logo_url, website, address, description, company_email, industry, company_size, phone, 
representative_name, representative_gender, representative_phone, account_email, tax_code, verification_level, active, last_update)
VALUES (4, 'FPT Software', 'https://fpt-software.com/logo.png', 'https://fpt-software.com', 
'Khu Cong Nghe Cao, Quan 9, TP. Ho Chi Minh', 
'FPT Software la cong ty phan mem hang dau Viet Nam, cung cap dich vu gia cong phan mem cho khach hang toan cau.',
'recruitment@fpt.com', 'IT Software', '5000+', '0281234567',
'Nguyen Van HR', 'MALE', '0901234567', 'hr@fpt.com', '0101234567', 3, true, NOW());

INSERT INTO companies (id, name, logo_url, website, address, description, company_email, industry, company_size, phone,
representative_name, representative_gender, representative_phone, account_email, tax_code, verification_level, active, last_update)
VALUES (5, 'VNG Corporation', 'https://vng.com.vn/logo.png', 'https://vng.com.vn',
'182 Le Dai Hanh, Quan 11, TP. Ho Chi Minh',
'VNG Corporation la ky lan cong nghe dau tien cua Viet Nam, noi tieng voi Zalo, ZaloPay va cac san pham game.',
'hr@vng.com.vn', 'Technology', '3000+', '0282345678',
'Tran Thi Recruiter', 'FEMALE', '0912345678', 'hr@vng.com', '0102345678', 3, true, NOW());

INSERT INTO companies (id, name, logo_url, website, address, description, company_email, industry, company_size, phone,
representative_name, representative_gender, representative_phone, account_email, tax_code, verification_level, active, last_update)
VALUES (6, 'VinGroup', 'https://vingroup.net/logo.png', 'https://vingroup.net',
'No.7, Bang Lang 1 Street, Vinhomes Riverside, Ha Noi',
'Vingroup la tap doan kinh te tu nhan da nganh lon nhat Viet Nam, hoat dong trong cac linh vuc bat dong san, ban le, y te, giao duc va cong nghe.',
'careers@vingroup.net', 'Technology & Real Estate', '10000+', '0243456789',
'Le Van Manager', 'MALE', '0923456789', 'hr@vingroup.com', '0103456789', 2, true, NOW());

-- ===============================================
-- 4. JOBS (Việc làm) - Với các trường mới
-- ===============================================
-- Jobs của FPT (employer_id = 4)
INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at)
VALUES (4, 'Java Developer', 
'Phat trien va bao tri cac ung dung Java/Spring Boot. Lam viec trong moi truong Agile/Scrum. Tham gia code review va unit testing.',
'- 2+ nam kinh nghiem Java/Spring Boot
- Hieu biet ve RESTful API
- Co kien thuc ve SQL va NoSQL
- Tieng Anh doc hieu tai lieu',
'TP. Ho Chi Minh', 'Java, Spring Boot, MySQL, Redis, Docker', 'FULL_TIME', 'JUNIOR', 'ACTIVE', 5, 0, 15000000, 30000000, '2025-03-01', 150, 12, NOW());

INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at)
VALUES (4, 'React Developer',
'Xay dung giao dien nguoi dung voi React.js. Toi uu hoa hieu suat frontend. Tich hop API RESTful.',
'- 2+ nam kinh nghiem React.js
- Thanh thao TypeScript
- Hieu biet ve state management (Redux, Zustand)
- Co kha nang UI/UX co ban',
'TP. Ho Chi Minh', 'React.js, TypeScript, Redux, Tailwind CSS', 'FULL_TIME', 'MIDDLE', 'ACTIVE', 3, 1, 18000000, 35000000, '2025-02-28', 200, 18, NOW());

INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at)
VALUES (4, 'DevOps Engineer',
'Quan ly he thong CI/CD. Trien khai va giam sat ung dung tren cloud. Tu dong hoa quy trinh deploy.',
'- 3+ nam kinh nghiem DevOps/SRE
- Thanh thao AWS hoac GCP
- Kinh nghiem Docker, Kubernetes
- Kien thuc ve CI/CD tools',
'Ha Noi', 'AWS, Docker, Kubernetes, Jenkins, Terraform', 'FULL_TIME', 'SENIOR', 'ACTIVE', 2, 0, 25000000, 45000000, '2025-02-15', 180, 8, NOW());

-- Jobs của VNG (employer_id = 5)
INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at)
VALUES (5, 'Backend Engineer (Zalo)',
'Phat trien backend cho ung dung Zalo voi hang trieu nguoi dung. Xu ly high concurrency va big data.',
'- 3+ nam kinh nghiem backend development
- Kinh nghiem xu ly he thong high traffic
- Thanh thao Go hoac Java
- Kien thuc ve distributed systems',
'TP. Ho Chi Minh', 'Go, Java, MySQL, Redis, Kafka, gRPC', 'FULL_TIME', 'SENIOR', 'ACTIVE', 4, 1, 25000000, 50000000, '2025-03-15', 320, 25, NOW());

INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at)
VALUES (5, 'Mobile Developer (iOS/Android)',
'Phat trien ung dung mobile native cho cac san pham cua VNG. Toi uu hoa trai nghiem nguoi dung.',
'- 2+ nam kinh nghiem mobile development
- Thanh thao Swift hoac Kotlin
- Hieu biet ve Flutter la loi the
- Kinh nghiem lam viec voi Firebase',
'TP. Ho Chi Minh', 'Swift, Kotlin, Flutter, Firebase', 'FULL_TIME', 'MIDDLE', 'ACTIVE', 3, 0, 20000000, 40000000, '2025-03-01', 250, 15, NOW());

INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at)
VALUES (5, 'Data Engineer',
'Xay dung data pipeline va ETL. Quan ly data warehouse. Phan tich big data.',
'- 3+ nam kinh nghiem data engineering
- Thanh thao Python va SQL
- Kinh nghiem Spark, Hadoop
- Hieu biet ve data warehouse',
'TP. Ho Chi Minh', 'Python, Spark, Hadoop, Airflow, SQL', 'FULL_TIME', 'SENIOR', 'ACTIVE', 2, 0, 30000000, 55000000, '2025-02-28', 180, 10, NOW());

-- Jobs của VinGroup (employer_id = 6)
INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at)
VALUES (6, 'AI/ML Engineer',
'Nghien cuu va phat trien cac giai phap AI/ML cho VinAI. Xay dung mo hinh machine learning cho san pham.',
'- 2+ nam kinh nghiem ML/AI
- Thanh thao Python, TensorFlow hoac PyTorch
- Kien thuc ve Computer Vision hoac NLP
- Co publication la loi the',
'Ha Noi', 'Python, TensorFlow, PyTorch, Computer Vision, NLP', 'FULL_TIME', 'MIDDLE', 'ACTIVE', 3, 0, 35000000, 70000000, '2025-04-01', 400, 30, NOW());

INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at)
VALUES (6, 'Full Stack Developer',
'Phat trien ung dung web full stack cho cac du an noi bo. Lam viec voi microservices architecture.',
'- 2+ nam kinh nghiem full stack
- Thanh thao Node.js va React
- Kinh nghiem MongoDB hoac PostgreSQL
- Hieu biet ve AWS',
'Ha Noi', 'Node.js, React, MongoDB, AWS, GraphQL', 'FULL_TIME', 'MIDDLE', 'ACTIVE', 5, 2, 20000000, 40000000, '2025-03-15', 280, 22, NOW());

INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at)
VALUES (6, 'QA Engineer',
'Xay dung test automation framework. Thuc hien manual va automated testing. Dam bao chat luong san pham.',
'- 1+ nam kinh nghiem QA/QC
- Hieu biet ve automation testing
- Thanh thao Selenium hoac Appium
- Kien thuc ve API testing',
'TP. Ho Chi Minh', 'Selenium, Appium, JMeter, Postman, SQL', 'FULL_TIME', 'JUNIOR', 'ACTIVE', 2, 0, 15000000, 30000000, '2025-02-20', 120, 8, NOW());

-- Jobs thuc tap (Internship)
INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at)
VALUES (4, 'Java Intern',
'Thuc tap phat trien ung dung Java. Hoc hoi va lam viec cung team senior.',
'- Sinh vien nam 3-4 nganh CNTT
- Co kien thuc co ban ve Java
- Ham hoc hoi va chu dong',
'TP. Ho Chi Minh', 'Java, Spring Boot', 'INTERNSHIP', 'FRESHER', 'ACTIVE', 10, 3, 5000000, 8000000, '2025-03-01', 500, 45, NOW());

INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at)
VALUES (5, 'Frontend Intern',
'Thuc tap phat trien giao dien web. Hoc hoi React va cac cong nghe frontend hien dai.',
'- Sinh vien nam 3-4 nganh CNTT
- Co kien thuc HTML, CSS, JavaScript
- Yeu thich UI/UX',
'TP. Ho Chi Minh', 'HTML, CSS, JavaScript, React', 'INTERNSHIP', 'FRESHER', 'ACTIVE', 5, 1, 4000000, 7000000, '2025-02-28', 350, 28, NOW());

-- ===============================================
-- 13. JOB APPLICATIONS (Đơn ứng tuyển mẫu)
-- ===============================================
-- Ứng viên 1 ứng tuyển Java Developer tại FPT (job_id = 1)
INSERT INTO job_applications (user_id, job_id, employer_id, applicant_name, applicant_email, applicant_phone, cv_url, cover_letter, status, applied_at)
VALUES (1, 1, 4, 'Nguyen Van A', 'nguyenvana.work@gmail.com', '0901111111', '/uploads/cv/nguyenvana_cv_2024_v2.pdf',
'Kinh gui nha tuyen dung,
Toi la Nguyen Van A, tot nghiep Dai hoc Bach Khoa TP.HCM chuyen nganh CNTT. Voi 2 nam kinh nghiem Java/Spring Boot, toi tu tin co the dong gop cho du an cua cong ty.
Xin cam on!', 'PENDING', NOW());

-- Ứng viên 2 ứng tuyển React Developer tại FPT (job_id = 2)
INSERT INTO job_applications (user_id, job_id, employer_id, applicant_name, applicant_email, applicant_phone, cv_url, cover_letter, status, applied_at, viewed_at)
VALUES (2, 2, 4, 'Tran Thi B', 'tranthib.dev@gmail.com', '0902222222', '/uploads/cv/tranthib_cv.pdf',
'Kinh gui bo phan tuyen dung FPT,
Toi la Tran Thi B, Frontend Developer voi 2 nam kinh nghiem React va Vue.js. Toi rat quan tam den vi tri React Developer tai quy cong ty.
Tran trong!', 'VIEWED', NOW(), NOW());

-- Ứng viên 3 ứng tuyển DevOps tại FPT (job_id = 3)
INSERT INTO job_applications (user_id, job_id, employer_id, applicant_name, applicant_email, applicant_phone, cv_url, cover_letter, status, employer_note, applied_at, viewed_at)
VALUES (3, 3, 4, 'Le Van C', 'levanc.devops@gmail.com', '0903333333', '/uploads/cv/levanc_resume.pdf',
'Kinh gui FPT Software,
Toi la Le Van C, DevOps Engineer voi kinh nghiem AWS, Docker, Kubernetes. Toi muon ung tuyen vi tri DevOps Engineer tai cong ty.
Cam on!', 'SHORTLISTED', 'Ung vien co kinh nghiem tot, hen phong van tuan sau', NOW(), NOW());

-- Ứng viên 1 ứng tuyển Backend tại VNG (job_id = 4)
INSERT INTO job_applications (user_id, job_id, employer_id, applicant_name, applicant_email, applicant_phone, cv_url, cover_letter, status, applied_at)
VALUES (1, 4, 5, 'Nguyen Van A', 'nguyenvana.work@gmail.com', '0901111111', '/uploads/cv/nguyenvana_cv_2024_v2.pdf',
'Kinh gui VNG Corporation,
Toi muon ung tuyen vi tri Backend Engineer cho san pham Zalo.
Xin cam on!', 'PENDING', NOW());

-- Ứng viên 2 ứng tuyển Mobile Developer tại VNG (job_id = 5)
INSERT INTO job_applications (user_id, job_id, employer_id, applicant_name, applicant_email, applicant_phone, cv_url, cover_letter, status, employer_note, applied_at, viewed_at)
VALUES (2, 5, 5, 'Tran Thi B', 'tranthib.dev@gmail.com', '0902222222', '/uploads/cv/tranthib_cv.pdf',
'Kinh gui bo phan tuyen dung VNG,
Toi muon ung tuyen vi tri Mobile Developer.
Tran trong!', 'INTERVIEWING', 'Da dat lich phong van ngay 15/12', NOW(), NOW())

-- ===============================================
-- 5. SKILLS (Kỹ năng của ứng viên)
-- ===============================================
-- Skills của User 1 (Java Developer)
INSERT INTO skill (user_id, skill, level) VALUES (1, 'Java', 'Advanced');
INSERT INTO skill (user_id, skill, level) VALUES (1, 'Spring Boot', 'Intermediate');
INSERT INTO skill (user_id, skill, level) VALUES (1, 'MySQL', 'Intermediate');
INSERT INTO skill (user_id, skill, level) VALUES (1, 'Git', 'Advanced');
INSERT INTO skill (user_id, skill, level) VALUES (1, 'Docker', 'Beginner');

-- Skills của User 2 (Frontend Developer)
INSERT INTO skill (user_id, skill, level) VALUES (2, 'JavaScript', 'Advanced');
INSERT INTO skill (user_id, skill, level) VALUES (2, 'React.js', 'Advanced');
INSERT INTO skill (user_id, skill, level) VALUES (2, 'Vue.js', 'Intermediate');
INSERT INTO skill (user_id, skill, level) VALUES (2, 'TypeScript', 'Intermediate');
INSERT INTO skill (user_id, skill, level) VALUES (2, 'Tailwind CSS', 'Advanced');
INSERT INTO skill (user_id, skill, level) VALUES (2, 'Figma', 'Intermediate');

-- Skills của User 3 (DevOps Engineer)
INSERT INTO skill (user_id, skill, level) VALUES (3, 'AWS', 'Advanced');
INSERT INTO skill (user_id, skill, level) VALUES (3, 'Docker', 'Advanced');
INSERT INTO skill (user_id, skill, level) VALUES (3, 'Kubernetes', 'Intermediate');
INSERT INTO skill (user_id, skill, level) VALUES (3, 'Jenkins', 'Advanced');
INSERT INTO skill (user_id, skill, level) VALUES (3, 'Terraform', 'Intermediate');
INSERT INTO skill (user_id, skill, level) VALUES (3, 'Linux', 'Advanced');

-- ===============================================
-- 6. EDUCATION (Học vấn)
-- ===============================================
-- Education của User 1
INSERT INTO education (user_id, school, degree, start_date, end_date, description)
VALUES (1, 'Dai hoc Bach Khoa TP.HCM', 'Cu nhan Khoa hoc May tinh', '2017-09-01', '2021-06-30',
'Tot nghiep loai Kha. Chuyen nganh Ky thuat Phan mem.');

INSERT INTO education (user_id, school, degree, start_date, end_date, description)
VALUES (1, 'THPT Chuyen Le Hong Phong', 'Tot nghiep THPT', '2014-09-01', '2017-06-30',
'Chuyen Tin hoc. Giai nhi Olympic Tin hoc cap thanh pho.');

-- Education của User 2
INSERT INTO education (user_id, school, degree, start_date, end_date, description)
VALUES (2, 'Dai hoc RMIT Viet Nam', 'Cu nhan Cong nghe Thong tin', '2016-09-01', '2020-06-30',
'Tot nghiep loai Gioi. Minor in User Experience Design.');

-- Education của User 3
INSERT INTO education (user_id, school, degree, start_date, end_date, description)
VALUES (3, 'Dai hoc Bach Khoa Ha Noi', 'Ky su Cong nghe Thong tin', '2015-09-01', '2020-06-30',
'Tot nghiep loai Gioi. Luan van tot nghiep ve Cloud Computing.');

INSERT INTO education (user_id, school, degree, start_date, end_date, description)
VALUES (3, 'AWS Training', 'AWS Solutions Architect Professional', '2022-01-01', '2022-03-31',
'Hoan thanh khoa hoc AWS chuyen sau.');

-- ===============================================
-- 7. EXPERIENCE (Kinh nghiệm làm việc)
-- ===============================================
-- Experience của User 1
INSERT INTO experience (user_id, company, role, start_date, end_date, description)
VALUES (1, 'FPT Software (Intern)', 'Java Developer Intern', '2020-06-01', '2020-12-31',
'Tham gia phat trien module quan ly user cho du an banking. Su dung Java, Spring Boot, Oracle.');

INSERT INTO experience (user_id, company, role, start_date, end_date, description)
VALUES (1, 'Startup ABC', 'Junior Java Developer', '2021-01-01', '2023-06-30',
'Phat trien REST API cho ung dung e-commerce. Toi uu hoa database queries. Tham gia code review.');

-- Experience của User 2
INSERT INTO experience (user_id, company, role, start_date, end_date, description)
VALUES (2, 'Agency XYZ', 'Frontend Developer', '2020-07-01', '2022-12-31',
'Phat trien website cho khach hang doanh nghiep. Su dung React, Vue.js, SCSS.');

INSERT INTO experience (user_id, company, role, start_date, end_date, description)
VALUES (2, 'Tech Company DEF', 'Senior Frontend Developer', '2023-01-01', NULL,
'Lead team frontend 3 nguoi. Xay dung component library. Toi uu hoa performance.');

-- Experience của User 3
INSERT INTO experience (user_id, company, role, start_date, end_date, description)
VALUES (3, 'Cloud Vietnam', 'System Administrator', '2020-07-01', '2021-12-31',
'Quan ly he thong server Linux. Cau hinh network va security.');

INSERT INTO experience (user_id, company, role, start_date, end_date, description)
VALUES (3, 'Big Corp', 'DevOps Engineer', '2022-01-01', NULL,
'Xay dung CI/CD pipeline. Trien khai microservices tren Kubernetes. Quan ly AWS infrastructure.');

-- ===============================================
-- 8. CERTIFICATES (Chứng chỉ)
-- ===============================================
-- Certificates của User 1
INSERT INTO certificate (user_id, name, organization, date)
VALUES (1, 'Oracle Certified Java Programmer', 'Oracle', '2021-03-15');

INSERT INTO certificate (user_id, name, organization, date)
VALUES (1, 'Spring Professional Certification', 'VMware', '2022-06-20');

-- Certificates của User 2
INSERT INTO certificate (user_id, name, organization, date)
VALUES (2, 'Meta Front-End Developer Professional Certificate', 'Meta (Coursera)', '2021-08-10');

INSERT INTO certificate (user_id, name, organization, date)
VALUES (2, 'Google UX Design Certificate', 'Google', '2022-02-28');

-- Certificates của User 3
INSERT INTO certificate (user_id, name, organization, date)
VALUES (3, 'AWS Solutions Architect Associate', 'Amazon Web Services', '2021-05-15');

INSERT INTO certificate (user_id, name, organization, date)
VALUES (3, 'AWS Solutions Architect Professional', 'Amazon Web Services', '2022-08-20');

INSERT INTO certificate (user_id, name, organization, date)
VALUES (3, 'Certified Kubernetes Administrator', 'CNCF', '2023-01-10');

-- ===============================================
-- 9. PORTFOLIO (Danh mục dự án)
-- ===============================================
-- Portfolio của User 1
INSERT INTO portfolio (user_id, type, url, description)
VALUES (1, 'LINK', 'https://github.com/nguyenvana/ecommerce-api', 'REST API cho he thong e-commerce su dung Spring Boot');

INSERT INTO portfolio (user_id, type, url, description)
VALUES (1, 'LINK', 'https://github.com/nguyenvana/task-management', 'Ung dung quan ly cong viec voi React va Spring Boot');

-- Portfolio của User 2
INSERT INTO portfolio (user_id, type, url, description)
VALUES (2, 'LINK', 'https://portfolio.tranthib.com', 'Personal portfolio website');

INSERT INTO portfolio (user_id, type, url, description)
VALUES (2, 'LINK', 'https://github.com/tranthib/react-component-library', 'Thu vien React components co the tai su dung');

INSERT INTO portfolio (user_id, type, url, description)
VALUES (2, 'LINK', 'https://dribbble.com/tranthib', 'Cac thiet ke UI/UX tren Dribbble');

-- Portfolio của User 3
INSERT INTO portfolio (user_id, type, url, description)
VALUES (3, 'LINK', 'https://github.com/levanc/terraform-modules', 'Bo Terraform modules cho AWS infrastructure');

INSERT INTO portfolio (user_id, type, url, description)
VALUES (3, 'LINK', 'https://github.com/levanc/k8s-helm-charts', 'Helm charts cho Kubernetes deployments');

-- ===============================================
-- 10. SOCIAL LINKS (Liên kết mạng xã hội)
-- ===============================================
-- Social links của User 1
INSERT INTO social_link (user_id, platform, url) VALUES (1, 'LinkedIn', 'https://linkedin.com/in/nguyenvana');
INSERT INTO social_link (user_id, platform, url) VALUES (1, 'GitHub', 'https://github.com/nguyenvana');
INSERT INTO social_link (user_id, platform, url) VALUES (1, 'Facebook', 'https://facebook.com/nguyenvana');

-- Social links của User 2
INSERT INTO social_link (user_id, platform, url) VALUES (2, 'LinkedIn', 'https://linkedin.com/in/tranthib');
INSERT INTO social_link (user_id, platform, url) VALUES (2, 'GitHub', 'https://github.com/tranthib');
INSERT INTO social_link (user_id, platform, url) VALUES (2, 'Dribbble', 'https://dribbble.com/tranthib');
INSERT INTO social_link (user_id, platform, url) VALUES (2, 'Twitter', 'https://twitter.com/tranthib');

-- Social links của User 3
INSERT INTO social_link (user_id, platform, url) VALUES (3, 'LinkedIn', 'https://linkedin.com/in/levanc');
INSERT INTO social_link (user_id, platform, url) VALUES (3, 'GitHub', 'https://github.com/levanc');
INSERT INTO social_link (user_id, platform, url) VALUES (3, 'Medium', 'https://medium.com/@levanc');

-- ===============================================
-- 11. CONTACT INFO (Thông tin liên hệ)
-- ===============================================
INSERT INTO contact_info (user_id, phone, email) VALUES (1, '0901111111', 'nguyenvana.work@gmail.com');
INSERT INTO contact_info (user_id, phone, email) VALUES (2, '0902222222', 'tranthib.dev@gmail.com');
INSERT INTO contact_info (user_id, phone, email) VALUES (3, '0903333333', 'levanc.devops@gmail.com');

-- ===============================================
-- 12. CV (Hồ sơ CV)
-- ===============================================
INSERT INTO cv (user_id, file_url, uploaded_at) VALUES (1, '/uploads/cv/nguyenvana_cv_2024.pdf', '2024-01-15');
INSERT INTO cv (user_id, file_url, uploaded_at) VALUES (1, '/uploads/cv/nguyenvana_cv_2024_v2.pdf', '2024-06-20');
INSERT INTO cv (user_id, file_url, uploaded_at) VALUES (2, '/uploads/cv/tranthib_cv.pdf', '2024-03-10');
INSERT INTO cv (user_id, file_url, uploaded_at) VALUES (3, '/uploads/cv/levanc_resume.pdf', '2024-02-28');

-- ===============================================
-- 14. CATEGORIES (Danh mục)
-- ===============================================
-- Ngành nghề (INDUSTRY)
INSERT INTO categories (type, name, name_en, description, sort_order, active, created_at) VALUES
('INDUSTRY', 'Công nghệ thông tin', 'Information Technology', 'Phần mềm, phần cứng, dịch vụ IT', 1, true, NOW()),
('INDUSTRY', 'Tài chính - Ngân hàng', 'Finance & Banking', 'Ngân hàng, bảo hiểm, chứng khoán', 2, true, NOW()),
('INDUSTRY', 'Marketing - Truyền thông', 'Marketing & Communications', 'Digital marketing, PR, quảng cáo', 3, true, NOW()),
('INDUSTRY', 'Bán hàng', 'Sales', 'Kinh doanh, bán hàng', 4, true, NOW()),
('INDUSTRY', 'Nhân sự', 'Human Resources', 'Tuyển dụng, đào tạo, quản lý nhân sự', 5, true, NOW()),
('INDUSTRY', 'Kế toán - Kiểm toán', 'Accounting & Auditing', 'Kế toán, kiểm toán, tài chính', 6, true, NOW()),
('INDUSTRY', 'Giáo dục - Đào tạo', 'Education & Training', 'Giảng dạy, đào tạo', 7, true, NOW()),
('INDUSTRY', 'Y tế - Dược phẩm', 'Healthcare & Pharmaceutical', 'Bệnh viện, dược phẩm, thiết bị y tế', 8, true, NOW()),
('INDUSTRY', 'Xây dựng - Bất động sản', 'Construction & Real Estate', 'Xây dựng, kiến trúc, bất động sản', 9, true, NOW()),
('INDUSTRY', 'Sản xuất', 'Manufacturing', 'Sản xuất, chế tạo', 10, true, NOW());

-- Kỹ năng (SKILL)
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
('SKILL', 'Git', 'Git', 10, true, NOW()),
('SKILL', 'Agile/Scrum', 'Agile/Scrum', 11, true, NOW()),
('SKILL', 'Communication', 'Communication', 12, true, NOW()),
('SKILL', 'Problem Solving', 'Problem Solving', 13, true, NOW()),
('SKILL', 'Teamwork', 'Teamwork', 14, true, NOW()),
('SKILL', 'Leadership', 'Leadership', 15, true, NOW());

-- Địa điểm (LOCATION)
INSERT INTO categories (type, name, name_en, sort_order, active, created_at) VALUES
('LOCATION', 'Hồ Chí Minh', 'Ho Chi Minh City', 1, true, NOW()),
('LOCATION', 'Hà Nội', 'Hanoi', 2, true, NOW()),
('LOCATION', 'Đà Nẵng', 'Da Nang', 3, true, NOW()),
('LOCATION', 'Cần Thơ', 'Can Tho', 4, true, NOW()),
('LOCATION', 'Hải Phòng', 'Hai Phong', 5, true, NOW()),
('LOCATION', 'Bình Dương', 'Binh Duong', 6, true, NOW()),
('LOCATION', 'Đồng Nai', 'Dong Nai', 7, true, NOW()),
('LOCATION', 'Remote', 'Remote', 8, true, NOW());

-- ===============================================
-- 15. STATIC CONTENTS (Nội dung tĩnh)
-- ===============================================
-- Trang giới thiệu
INSERT INTO static_contents (slug, type, title, content, meta_description, published, sort_order, view_count, created_at, published_at) VALUES
('about', 'PAGE', 'Về chúng tôi', 
'<h2>ITing - Nền tảng tuyển dụng IT hàng đầu Việt Nam</h2>
<p>ITing được thành lập với sứ mệnh kết nối nhân tài công nghệ với các doanh nghiệp hàng đầu.</p>
<h3>Sứ mệnh</h3>
<p>Giúp các ứng viên IT tìm được công việc mơ ước và giúp doanh nghiệp tìm được nhân tài phù hợp.</p>
<h3>Tầm nhìn</h3>
<p>Trở thành nền tảng tuyển dụng IT số 1 Đông Nam Á.</p>
<h3>Giá trị cốt lõi</h3>
<ul>
<li>Chất lượng: Đảm bảo chất lượng tin tuyển dụng và hồ sơ ứng viên</li>
<li>Minh bạch: Thông tin rõ ràng, minh bạch về mức lương và yêu cầu</li>
<li>Kết nối: Kết nối nhanh chóng giữa ứng viên và nhà tuyển dụng</li>
</ul>',
'ITing - Nền tảng tuyển dụng IT hàng đầu Việt Nam', true, 1, 0, NOW(), NOW()),

-- Điều khoản sử dụng
('terms', 'PAGE', 'Điều khoản sử dụng',
'<h2>Điều khoản sử dụng</h2>
<p>Bằng việc sử dụng ITing, bạn đồng ý với các điều khoản sau:</p>
<h3>1. Tài khoản</h3>
<p>Bạn có trách nhiệm bảo mật thông tin tài khoản của mình.</p>
<h3>2. Nội dung</h3>
<p>Bạn không được đăng nội dung vi phạm pháp luật hoặc xâm phạm quyền của người khác.</p>
<h3>3. Quyền riêng tư</h3>
<p>Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn theo chính sách bảo mật.</p>',
'Điều khoản sử dụng của ITing', true, 2, 0, NOW(), NOW()),

-- Chính sách bảo mật
('privacy', 'PAGE', 'Chính sách bảo mật',
'<h2>Chính sách bảo mật</h2>
<h3>Thu thập thông tin</h3>
<p>Chúng tôi thu thập thông tin bạn cung cấp khi đăng ký và sử dụng dịch vụ.</p>
<h3>Sử dụng thông tin</h3>
<p>Thông tin được sử dụng để cung cấp và cải thiện dịch vụ.</p>
<h3>Bảo mật</h3>
<p>Chúng tôi áp dụng các biện pháp bảo mật để bảo vệ thông tin của bạn.</p>',
'Chính sách bảo mật của ITing', true, 3, 0, NOW(), NOW());

-- FAQ
INSERT INTO static_contents (slug, type, title, content, published, sort_order, view_count, created_at, published_at) VALUES
('faq-1', 'FAQ', 'Làm thế nào để đăng ký tài khoản?',
'Bạn có thể đăng ký tài khoản bằng cách nhấn nút "Đăng ký" và điền thông tin email, mật khẩu. Sau đó chọn loại tài khoản (Ứng viên hoặc Nhà tuyển dụng).',
true, 1, 0, NOW(), NOW()),
('faq-2', 'FAQ', 'Làm thế nào để ứng tuyển việc làm?',
'Sau khi đăng nhập với tài khoản ứng viên, bạn tìm kiếm việc làm phù hợp và nhấn nút "Ứng tuyển". Bạn cần điền thông tin và đính kèm CV.',
true, 2, 0, NOW(), NOW()),
('faq-3', 'FAQ', 'Làm thế nào để đăng tin tuyển dụng?',
'Đăng nhập với tài khoản Nhà tuyển dụng, vào mục "Đăng tin" và điền đầy đủ thông tin về vị trí tuyển dụng.',
true, 3, 0, NOW(), NOW()),
('faq-4', 'FAQ', 'Chi phí sử dụng dịch vụ là bao nhiêu?',
'Ứng viên được sử dụng miễn phí tất cả các tính năng. Nhà tuyển dụng có các gói dịch vụ khác nhau, vui lòng liên hệ để biết thêm chi tiết.',
true, 4, 0, NOW(), NOW()),
('faq-5', 'FAQ', 'Làm thế nào để liên hệ hỗ trợ?',
'Bạn có thể liên hệ qua email: support@iting.vn hoặc hotline: 1900-xxxx (8h-22h hàng ngày).',
true, 5, 0, NOW(), NOW());

-- Blog
INSERT INTO static_contents (slug, type, title, content, meta_description, thumbnail_url, published, sort_order, author_id, view_count, created_at, published_at) VALUES
('blog-cv-tips', 'BLOG', '10 mẹo viết CV ấn tượng cho Developer',
'<h2>1. Tập trung vào kỹ năng kỹ thuật</h2>
<p>Liệt kê các ngôn ngữ lập trình, framework và công cụ bạn thành thạo.</p>
<h2>2. Showcase dự án</h2>
<p>Đưa link GitHub hoặc portfolio để showcase các dự án đã làm.</p>
<h2>3. Quantify thành tích</h2>
<p>Sử dụng số liệu cụ thể: "Tối ưu hiệu suất API tăng 50%"</p>',
'Hướng dẫn viết CV ấn tượng cho Developer', 'https://example.com/blog/cv-tips.jpg',
true, 1, 7, 150, NOW(), NOW()),
('blog-interview-tips', 'BLOG', 'Chuẩn bị phỏng vấn kỹ thuật như thế nào?',
'<h2>Trước phỏng vấn</h2>
<p>Ôn lại kiến thức nền tảng: cấu trúc dữ liệu, thuật toán, OOP...</p>
<h2>Trong phỏng vấn</h2>
<p>Think out loud - nói ra cách suy nghĩ của bạn khi giải quyết vấn đề.</p>
<h2>Sau phỏng vấn</h2>
<p>Gửi email cảm ơn và follow up nếu chưa nhận được phản hồi sau 1 tuần.</p>',
'Hướng dẫn chuẩn bị phỏng vấn kỹ thuật', 'https://example.com/blog/interview.jpg',
true, 2, 7, 200, NOW(), NOW());
