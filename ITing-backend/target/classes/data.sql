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
-- 4. JOBS (Việc làm)
-- ===============================================
-- Jobs của FPT (employer_id = 4)
INSERT INTO jobs (employer_id, position, description, location, tech_required, max_accept, min_salary, max_salary, due_date, created_at)
VALUES (4, 'Java Developer', 
'Phat trien va bao tri cac ung dung Java/Spring Boot. Lam viec trong moi truong Agile/Scrum. Tham gia code review va unit testing.',
'TP. Ho Chi Minh', 'Java, Spring Boot, MySQL, Redis, Docker', 5, 15000000, 30000000, '2025-03-01', NOW());

INSERT INTO jobs (employer_id, position, description, location, tech_required, max_accept, min_salary, max_salary, due_date, created_at)
VALUES (4, 'React Developer',
'Xay dung giao dien nguoi dung voi React.js. Toi uu hoa hieu suat frontend. Tich hop API RESTful.',
'TP. Ho Chi Minh', 'React.js, TypeScript, Redux, Tailwind CSS', 3, 18000000, 35000000, '2025-02-28', NOW());

INSERT INTO jobs (employer_id, position, description, location, tech_required, max_accept, min_salary, max_salary, due_date, created_at)
VALUES (4, 'DevOps Engineer',
'Quan ly he thong CI/CD. Trien khai va giam sat ung dung tren cloud. Tu dong hoa quy trinh deploy.',
'Ha Noi', 'AWS, Docker, Kubernetes, Jenkins, Terraform', 2, 25000000, 45000000, '2025-02-15', NOW());

-- Jobs của VNG (employer_id = 5)
INSERT INTO jobs (employer_id, position, description, location, tech_required, max_accept, min_salary, max_salary, due_date, created_at)
VALUES (5, 'Backend Engineer (Zalo)',
'Phat trien backend cho ung dung Zalo voi hang trieu nguoi dung. Xu ly high concurrency va big data.',
'TP. Ho Chi Minh', 'Go, Java, MySQL, Redis, Kafka, gRPC', 4, 25000000, 50000000, '2025-03-15', NOW());

INSERT INTO jobs (employer_id, position, description, location, tech_required, max_accept, min_salary, max_salary, due_date, created_at)
VALUES (5, 'Mobile Developer (iOS/Android)',
'Phat trien ung dung mobile native cho cac san pham cua VNG. Toi uu hoa trai nghiem nguoi dung.',
'TP. Ho Chi Minh', 'Swift, Kotlin, Flutter, Firebase', 3, 20000000, 40000000, '2025-03-01', NOW());

INSERT INTO jobs (employer_id, position, description, location, tech_required, max_accept, min_salary, max_salary, due_date, created_at)
VALUES (5, 'Data Engineer',
'Xay dung data pipeline va ETL. Quan ly data warehouse. Phan tich big data.',
'TP. Ho Chi Minh', 'Python, Spark, Hadoop, Airflow, SQL', 2, 30000000, 55000000, '2025-02-28', NOW());

-- Jobs của VinGroup (employer_id = 6)
INSERT INTO jobs (employer_id, position, description, location, tech_required, max_accept, min_salary, max_salary, due_date, created_at)
VALUES (6, 'AI/ML Engineer',
'Nghien cuu va phat trien cac giai phap AI/ML cho VinAI. Xay dung mo hinh machine learning cho san pham.',
'Ha Noi', 'Python, TensorFlow, PyTorch, Computer Vision, NLP', 3, 35000000, 70000000, '2025-04-01', NOW());

INSERT INTO jobs (employer_id, position, description, location, tech_required, max_accept, min_salary, max_salary, due_date, created_at)
VALUES (6, 'Full Stack Developer',
'Phat trien ung dung web full stack cho cac du an noi bo. Lam viec voi microservices architecture.',
'Ha Noi', 'Node.js, React, MongoDB, AWS, GraphQL', 5, 20000000, 40000000, '2025-03-15', NOW());

INSERT INTO jobs (employer_id, position, description, location, tech_required, max_accept, min_salary, max_salary, due_date, created_at)
VALUES (6, 'QA Engineer',
'Xay dung test automation framework. Thuc hien manual va automated testing. Dam bao chat luong san pham.',
'TP. Ho Chi Minh', 'Selenium, Appium, JMeter, Postman, SQL', 2, 15000000, 30000000, '2025-02-20', NOW());

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
