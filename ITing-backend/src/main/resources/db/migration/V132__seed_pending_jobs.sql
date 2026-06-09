-- V132: Seed pending jobs with future due dates for testing admin approval
-- Thêm các job PENDING có hạn cuối còn thời gian để test tính năng duyệt job

INSERT INTO Job (
    Company_id,
    Title, Position,
    Description, Tech_required,
    Job_type, Experience_level, Working_days,
    Min_salary, Max_salary, Salary_type,
    Max_accept, Current_accepted,
    Status, Due_date,
    Province, Ward, Address, Location, Loc_id,
    Responsibilities, Requirements, Benefits,
    View_count, Application_count,
    Created_at, Last_update,
    Job_embedding
) VALUES

-- Job 1: FPT Software - Java Developer (PENDING, Due 2026-12-31)
(
    11,
    'Java Developer (Spring Boot)',
    'Java Developer',
    'Phát triển các dịch vụ backend sử dụng Spring Boot cho hệ thống thương mại điện tử.',
    '["Java","Spring Boot","MySQL","Docker"]',
    'FULL_TIME', 'MIDDLE', 'Thứ 2 - Thứ 6 (08:00 - 17:00)',
    18000000, 30000000, 'MONTH',
    5, 0,
    'PENDING', '2026-12-31',
    'Hà Nội', 'Nam Từ Liêm', 'FPT Software, Lê Quang Định',
    'FPT Software, Lê Quang Định, Nam Từ Liêm, Hà Nội',
    1,
    'Viết code backend, tối ưu performance, code review.',
    '3+ năm kinh nghiệm Java, biết Spring Boot.',
    'Laptop mới, phép năm tuần, gym miễn phí.',
    0, 0,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- Job 2: VNG Corp - React Developer (PENDING, Due 2026-11-30)
(
    12,
    'Senior Frontend Developer (React)',
    'Frontend Developer',
    'Xây dựng các tính năng frontend cho ứng dụng di động và web sử dụng React, React Native.',
    '["React","React Native","TypeScript","Redux"]',
    'FULL_TIME', 'SENIOR', 'Thứ 2 - Thứ 6',
    25000000, 40000000, 'MONTH',
    3, 0,
    'PENDING', '2026-11-30',
    'TP. Hồ Chí Minh', 'Quận 7', 'VNG Campus',
    'VNG Campus, Quận 7, TP. Hồ Chí Minh',
    2,
    'Phát triển UI/UX, quản lý state, performance tối ưu.',
    '5+ năm React, có kinh nghiệm React Native là ưu tiên.',
    'Thưởng dự án, review lương hàng năm, máy tính cao cấp.',
    0, 0,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- Job 3: Vingroup - QA Engineer (PENDING, Due 2026-10-31)
(
    13,
    'QA Engineer (Automation Testing)',
    'QA Engineer',
    'Đảm bảo chất lượng sản phẩm qua kiểm thử tự động và thủ công cho các ứng dụng Vingroup.',
    '["Selenium","Cypress","Python","JIRA"]',
    'FULL_TIME', 'MIDDLE', 'Thứ 2 - Thứ 6 (08:30 - 17:30)',
    15000000, 25000000, 'MONTH',
    4, 0,
    'PENDING', '2026-10-31',
    'TP. Hồ Chí Minh', 'Quận 1', 'Vincom Mega Mall',
    'Vincom Mega Mall, Quận 1, TP. Hồ Chí Minh',
    2,
    'Viết test case tự động, báo cáo lỗi, kiểm thử chức năng.',
    '2+ năm QA, biết automation testing.',
    'Bảo hiểm toàn diện, phép năm tuần, đào tạo kỹ năng.',
    0, 0,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- Job 4: Tiki - DevOps Engineer (PENDING, Due 2026-12-15)
(
    14,
    'DevOps Engineer (Kubernetes)',
    'DevOps Engineer',
    'Quản lý hạ tầng, CI/CD pipeline, deployment automation cho nền tảng thương mại điện tử Tiki.',
    '["Kubernetes","Docker","Jenkins","AWS"]',
    'FULL_TIME', 'SENIOR', 'Thứ 2 - Thứ 6',
    22000000, 38000000, 'MONTH',
    2, 0,
    'PENDING', '2026-12-15',
    'TP. Hồ Chí Minh', 'Quận 7', 'Tiki Campus',
    'Tiki Campus, Quận 7, TP. Hồ Chí Minh',
    2,
    'Xây dựng hệ thống CI/CD, quản lý cluster K8s, monitoring.',
    '5+ năm DevOps, có kinh nghiệm K8s và AWS.',
    'MacBook Pro, công ty trả chi phí khóa học, team outing hàng quý.',
    0, 0,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
);
