-- ============================================================================
-- ITing Job Portal - V35 Seed More Jobs and Companies for Recommendation Testing
-- ============================================================================

SET session_replication_role = 'replica';

-- 1. ADD NEW ACCOUNTS FOR COMPANIES
INSERT INTO Account (Id, Email, Password, Role, Status) VALUES
(21, 'hr@viettel.vn', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'COMPANY', 'ACTIVE'),
(22, 'hr@momo.vn', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'COMPANY', 'ACTIVE'),
(23, 'hr@grab.com', '$2a$10$XuCJKq/inhdGdYFp9d/TP.S7DnKtMERu7Nec5TWXHAxNbgFHEZwZ6', 'COMPANY', 'ACTIVE');

-- 2. ADD NEW COMPANIES
INSERT INTO Company (
    company_id, Name, Web_link, Address, Logo, Description,
    Company_email, Industry, Company_size, Phone,
    Verification_level, Company_info_update_status, Active, Last_update
) VALUES
(21, 'Viettel Digital', 'https://viettel.vn', 'No. 1 Giang Van Minh, Ba Dinh, Hanoi', 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Viettel_logo_2021.svg', 'Leading digital service provider in Vietnam', 'hr@viettel.vn', 'Telecommunications', '50,000+', '02462556789', 'PREMIUM', 'APPROVED', TRUE, CURRENT_TIMESTAMP),
(22, 'MoMo (M-Service)', 'https://momo.vn', 'Phu My Hung, District 7, HCMC', 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png', 'No.1 E-wallet in Vietnam', 'hr@momo.vn', 'Fintech', '2,000+', '02839917199', 'PREMIUM', 'APPROVED', TRUE, CURRENT_TIMESTAMP),
(23, 'Grab Vietnam', 'https://grab.com', 'Mapletree Business Centre, District 7, HCMC', 'https://upload.wikimedia.org/wikipedia/commons/0/03/Grab_logo.svg', 'Southeast Asia''s leading super-app', 'hr@grab.com', 'Technology', '1,000+', '02871087108', 'PREMIUM', 'APPROVED', TRUE, CURRENT_TIMESTAMP);

-- 3. ADD NEW JOBS (Testing Recommendation logic: Tech, Location, Salary)
INSERT INTO Job (
    Company_id, Title, Position, Tech_required, Job_type, Experience_level,
    Min_salary, Max_salary, Salary_type, Max_accept, Due_date,
    Province, Ward, Address, Location, Loc_id,
    Description, Responsibilities, Requirements, Status, Featured, Created_at, Last_update, View_count
) VALUES
-- Jobs in Hanoi (Loc_id 1)
(21, 'Senior Backend Engineer (Java/Go)', 'Senior Developer', '["Java", "Golang", "Microservices", "Kafka"]', 'FULL_TIME', 'SENIOR', 2500, 4500, 'MONTH', 5, '2026-12-31', 'Hà Nội', 'Giảng Võ', '1 Giang Văn Minh', '1 Giang Văn Minh, Giảng Võ, Hà Nội', 1, 'Build high-performance systems for Viettel Pay', 'Design and implement APIs', '5+ years experience with Java or Golang', 'ACTIVE', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1500),
(21, 'DevOps Engineer (AWS/K8s)', 'Engineer', '["AWS", "Kubernetes", "Docker", "Terraform"]', 'FULL_TIME', 'MIDDLE', 1500, 3000, 'MONTH', 2, '2026-12-31', 'Hà Nội', 'Giảng Võ', '1 Giang Văn Minh', '1 Giang Văn Minh, Giảng Võ, Hà Nội', 1, 'Maintain infrastructure for telecom services', 'Automate CI/CD pipelines', 'Knowledge of cloud infrastructure', 'ACTIVE', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 850),

-- Jobs in HCMC (Loc_id 2)
(22, 'Mobile Developer (Flutter/Dart)', 'Middle Developer', '["Flutter", "Dart", "Firebase", "Redux"]', 'FULL_TIME', 'MIDDLE', 1200, 2500, 'MONTH', 3, '2026-12-31', 'Thành phố Hồ Chí Minh', 'Quận 7', 'Phú Mỹ Hưng', 'Phú Mỹ Hưng, Quận 7, TP.HCM', 2, 'Join MoMo mobile app team', 'Develop new features for mini apps', 'Experience with Flutter and performance tuning', 'ACTIVE', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2200),
(22, 'Senior Data Scientist', 'Senior Engineer', '["Python", "PyTorch", "BigData", "SQL"]', 'FULL_TIME', 'SENIOR', 3000, 6000, 'MONTH', 1, '2026-12-31', 'Thành phố Hồ Chí Minh', 'Quận 7', 'Phú Mỹ Hưng', 'Phú Mỹ Hưng, Quận 7, TP.HCM', 2, 'Analyze user behavior for MoMo', 'Build recommendation engines', 'Expert in Machine Learning', 'ACTIVE', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1200),

-- Jobs in HCMC (Grab)
(23, 'Backend Lead (NodeJS)', 'Lead Developer', '["NodeJS", "TypeScript", "Redis", "MySQL"]', 'FULL_TIME', 'SENIOR', 4000, 7000, 'MONTH', 1, '2026-12-31', 'Thành phố Hồ Chí Minh', 'Quận 7', 'Mapletree Business Centre', 'Mapletree, Quận 7, TP.HCM', 2, 'Lead GrabFood backend team', 'System architecture and code review', 'Deep knowledge of NodeJS', 'ACTIVE', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3100),
(23, 'Product Manager', 'PM', '["Agile", "Scrum", "Product Mindset"]', 'FULL_TIME', 'MIDDLE', 2000, 4000, 'MONTH', 2, '2026-12-31', 'Thành phố Hồ Chí Minh', 'Quận 7', 'Mapletree Business Centre', 'Mapletree, Quận 7, TP.HCM', 2, 'Define product roadmap for GrabExpress', 'Collaborate with engineering and design', 'Strong communication skills', 'ACTIVE', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1100),

-- Misc Tech Jobs for mixed recommendations
(11, 'Junior Java Developer', 'Junior', '["Java", "Spring Boot", "MySQL"]', 'FULL_TIME', 'JUNIOR', 800, 1500, 'MONTH', 10, '2026-12-31', 'Đà Nẵng', 'Quận Hải Châu', 'Bach Khoa DN', 'Hải Châu, Đà Nẵng', 3, 'Fresh graduates are welcome', 'Learn and contribute to FPT Software', 'Good attitude and basic Java', 'ACTIVE', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 600),
(12, 'QA/QC Engineer', 'Tester', '["Selenium", "JMeter", "Automation Test"]', 'FULL_TIME', 'MIDDLE', 1000, 2000, 'MONTH', 3, '2026-12-31', 'Thành phố Hồ Chí Minh', 'Quận 11', 'Lê Đại Hành', 'Quận 11, TP.HCM', 2, 'Test VNG game services', 'Ensure product quality and performance', 'Manual and Automation test experience', 'ACTIVE', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 700);

SET session_replication_role = 'origin';
