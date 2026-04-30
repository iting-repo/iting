-- ============================================================================
-- ITing Job Portal - V46 Seed Diverse JobType & ExperienceLevel Data
-- ============================================================================
-- Covers all combinations of:
--   JobType:         FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE, FREELANCE
--   ExperienceLevel: INTERN, FRESHER, JUNIOR, MIDDLE, MID_LEVEL, SENIOR, LEAD, EXPERT, MANAGER
-- ============================================================================

SET session_replication_role = 'replica';

INSERT INTO Job (
    Company_id,
    Title, Position,
    Description, Skills,
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

-- ============================================================================
-- PART_TIME Jobs (Bán thời gian)
-- ============================================================================

-- PART_TIME + INTERN
(
    11,
    'Thực tập sinh Frontend (Part-time)',
    'Intern Frontend',
    'Thực tập bán thời gian phát triển giao diện web với React tại FPT Software.',
    '["HTML","CSS","JavaScript","React"]',
    'PART_TIME', 'INTERN', 'MON_TO_FRI',
    3000000, 5000000, 'MONTH',
    5, 0,
    'ACTIVE', '2026-08-31',
    'Hà Nội', 'Cầu Giấy', 'Tòa nhà FPT, Duy Tân',
    'Tòa nhà FPT, Duy Tân, Cầu Giấy, Hà Nội',
    1,
    'Hỗ trợ team frontend xây dựng UI component, tham gia code review.',
    'Sinh viên năm 3-4 ngành CNTT, biết HTML/CSS/JS cơ bản.',
    'Được mentor 1-1, cơ hội trở thành nhân viên chính thức.',
    35, 8,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- PART_TIME + FRESHER
(
    12,
    'Content Writer IT (Part-time)',
    'Content Writer',
    'Viết bài về công nghệ, sản phẩm và xu hướng IT cho blog VNG.',
    '["Content Writing","SEO","WordPress"]',
    'PART_TIME', 'FRESHER', 'FLEXIBLE',
    4000000, 7000000, 'MONTH',
    2, 0,
    'ACTIVE', '2026-07-31',
    'TP. Hồ Chí Minh', 'Quận 11', '182 Lê Đại Hành',
    '182 Lê Đại Hành, Quận 11, TP. Hồ Chí Minh',
    2,
    'Viết 3-5 bài blog/tuần, nghiên cứu keyword, tối ưu SEO.',
    'Tốt nghiệp ngành Báo chí/Marketing/IT, viết tiếng Việt tốt.',
    'Làm việc linh hoạt, có thể remote.',
    50, 12,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- PART_TIME + JUNIOR
(
    14,
    'Junior Tester (Part-time)',
    'Tester',
    'Kiểm thử ứng dụng e-commerce Tiki theo ca bán thời gian.',
    '["Manual Testing","Jira","Postman"]',
    'PART_TIME', 'JUNIOR', 'FLEXIBLE',
    6000000, 10000000, 'MONTH',
    3, 1,
    'ACTIVE', '2026-09-15',
    'TP. Hồ Chí Minh', 'Quận 10', 'Rivera Park Sài Gòn',
    'Rivera Park, Quận 10, TP. Hồ Chí Minh',
    2,
    'Viết test case, thực hiện kiểm thử manual, báo cáo bug.',
    '1+ năm kinh nghiệm kiểm thử phần mềm.',
    'Thưởng theo dự án, bảo hiểm đầy đủ.',
    42, 6,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- ============================================================================
-- CONTRACT Jobs (Hợp đồng)
-- ============================================================================

-- CONTRACT + MIDDLE
(
    13,
    'Lập trình viên .NET (Hợp đồng 6 tháng)',
    '.NET Developer',
    'Phát triển hệ thống quản lý nội bộ trên nền tảng .NET cho VinGroup.',
    '["C#",".NET Core","SQL Server","Azure"]',
    'CONTRACT', 'MIDDLE', 'MON_TO_FRI',
    22000000, 38000000, 'MONTH',
    4, 0,
    'ACTIVE', '2026-08-30',
    'Hà Nội', 'Long Biên', 'Vinhomes Riverside',
    'Vinhomes Riverside, Long Biên, Hà Nội',
    1,
    'Phát triển module ERP, tích hợp API nội bộ, tối ưu performance.',
    '3+ năm kinh nghiệm .NET, hiểu biết về kiến trúc microservices.',
    'Hợp đồng 6 tháng, lương net, cơ hội gia hạn.',
    88, 15,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- CONTRACT + MID_LEVEL
(
    21,
    'Kỹ sư Mạng (Hợp đồng dự án)',
    'Network Engineer',
    'Triển khai hạ tầng mạng cho dự án Smart City của Viettel.',
    '["Cisco","Juniper","CCNP","Network Security"]',
    'CONTRACT', 'MID_LEVEL', 'MON_TO_FRI',
    20000000, 35000000, 'MONTH',
    3, 0,
    'ACTIVE', '2026-10-31',
    'Hà Nội', 'Ba Đình', '1 Giang Văn Minh',
    '1 Giang Văn Minh, Ba Đình, Hà Nội',
    1,
    'Thiết kế và triển khai hạ tầng mạng, giám sát hệ thống.',
    '3+ năm kinh nghiệm quản trị mạng, có chứng chỉ CCNP.',
    'Hợp đồng 12 tháng, phụ cấp dự án.',
    65, 10,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- CONTRACT + SENIOR
(
    22,
    'Senior Security Engineer (Contract)',
    'Security Engineer',
    'Đánh giá và tăng cường bảo mật cho hệ thống thanh toán MoMo.',
    '["Penetration Testing","OWASP","SOC","SIEM"]',
    'CONTRACT', 'SENIOR', 'MON_TO_FRI',
    35000000, 55000000, 'MONTH',
    1, 0,
    'ACTIVE', '2026-09-30',
    'TP. Hồ Chí Minh', 'Quận 7', 'Phú Mỹ Hưng',
    'Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh',
    2,
    'Thực hiện pentest, audit code, xây dựng security policy.',
    '5+ năm kinh nghiệm bảo mật ứng dụng, có chứng chỉ CEH/OSCP.',
    'Lương cao, hợp đồng 8 tháng có thể gia hạn.',
    120, 4,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- ============================================================================
-- INTERNSHIP Jobs (Thực tập)
-- ============================================================================

-- INTERNSHIP + INTERN
(
    11,
    'Thực tập sinh Java Backend',
    'Intern Backend',
    'Chương trình thực tập Backend tại FPT Software dành cho sinh viên CNTT.',
    '["Java","Spring Boot","Git","SQL"]',
    'INTERNSHIP', 'INTERN', 'MON_TO_FRI',
    3000000, 5000000, 'MONTH',
    10, 2,
    'ACTIVE', '2026-09-30',
    'Đà Nẵng', 'Hải Châu', 'FPT Complex',
    'FPT Complex, Hải Châu, Đà Nẵng',
    3,
    'Học và thực hành Java Spring Boot, tham gia dự án thực tế.',
    'Sinh viên năm cuối ngành CNTT, có kiến thức OOP và SQL cơ bản.',
    'Mentor 1-1, training bài bản, cơ hội nhận offer chính thức.',
    180, 45,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- INTERNSHIP + FRESHER
(
    23,
    'Thực tập sinh Data Analyst',
    'Intern Data Analyst',
    'Thực tập phân tích dữ liệu tại Grab Vietnam, làm việc với big data.',
    '["Python","SQL","Tableau","Excel"]',
    'INTERNSHIP', 'FRESHER', 'MON_TO_FRI',
    5000000, 8000000, 'MONTH',
    3, 0,
    'ACTIVE', '2026-08-15',
    'TP. Hồ Chí Minh', 'Quận 7', 'Mapletree Business Centre',
    'Mapletree, Quận 7, TP. Hồ Chí Minh',
    2,
    'Phân tích dữ liệu vận hành, tạo dashboard, báo cáo insights.',
    'Sinh viên hoặc mới tốt nghiệp ngành Thống kê/CNTT/Kinh tế.',
    'Stipend hấp dẫn, được tiếp cận dữ liệu thực tế quy mô lớn.',
    95, 22,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- INTERNSHIP + INTERN (Mobile)
(
    12,
    'Thực tập sinh Mobile Developer (iOS)',
    'Intern iOS',
    'Thực tập phát triển ứng dụng iOS tại VNG Corporation.',
    '["Swift","UIKit","SwiftUI","Xcode"]',
    'INTERNSHIP', 'INTERN', 'MON_TO_FRI',
    4000000, 6000000, 'MONTH',
    4, 1,
    'ACTIVE', '2026-08-31',
    'TP. Hồ Chí Minh', 'Quận 11', '182 Lê Đại Hành',
    '182 Lê Đại Hành, Quận 11, TP. Hồ Chí Minh',
    2,
    'Phát triển tính năng mới cho ứng dụng Zalo, fix bugs.',
    'Sinh viên CNTT năm 3-4, biết Swift cơ bản, có sản phẩm demo.',
    'Được làm việc với team Zalo, lunch miễn phí, phụ cấp đi lại.',
    72, 18,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- ============================================================================
-- REMOTE Jobs (Làm việc từ xa)
-- ============================================================================

-- REMOTE + JUNIOR
(
    14,
    'Junior Fullstack Developer (Remote)',
    'Fullstack Developer',
    'Phát triển tính năng cho nền tảng Tiki, làm việc hoàn toàn từ xa.',
    '["React","Node.js","PostgreSQL","Docker"]',
    'REMOTE', 'JUNIOR', 'FLEXIBLE',
    15000000, 25000000, 'MONTH',
    3, 0,
    'ACTIVE', '2026-09-30',
    'TP. Hồ Chí Minh', 'Quận 10', 'Rivera Park',
    'Remote - Trụ sở Rivera Park, Quận 10, TP. Hồ Chí Minh',
    2,
    'Phát triển frontend React và backend Node.js, deploy Docker.',
    '1-2 năm kinh nghiệm fullstack, tự quản lý thời gian tốt.',
    '100% remote, trang bị laptop, phụ cấp internet.',
    130, 28,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- REMOTE + MIDDLE
(
    22,
    'DevOps Engineer (Remote)',
    'DevOps Engineer',
    'Xây dựng và vận hành hạ tầng cloud cho MoMo, remote toàn phần.',
    '["AWS","Kubernetes","Terraform","CI/CD","Prometheus"]',
    'REMOTE', 'MIDDLE', 'FLEXIBLE',
    25000000, 40000000, 'MONTH',
    2, 0,
    'ACTIVE', '2026-10-15',
    'TP. Hồ Chí Minh', 'Quận 7', 'Phú Mỹ Hưng',
    'Remote - Trụ sở Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh',
    2,
    'Quản lý infrastructure AWS, thiết kế CI/CD pipeline, monitoring.',
    '3+ năm kinh nghiệm DevOps, thành thạo K8s và Terraform.',
    'Remote 100%, thưởng quý, team building hàng tháng.',
    95, 11,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- REMOTE + SENIOR
(
    23,
    'Senior Frontend Engineer (React) - Remote',
    'Senior Frontend',
    'Phát triển giao diện ứng dụng Grab với React/TypeScript, remote.',
    '["React","TypeScript","Next.js","GraphQL","TailwindCSS"]',
    'REMOTE', 'SENIOR', 'FLEXIBLE',
    35000000, 55000000, 'MONTH',
    2, 1,
    'ACTIVE', '2026-11-30',
    'TP. Hồ Chí Minh', 'Quận 7', 'Mapletree Business Centre',
    'Remote - Mapletree, Quận 7, TP. Hồ Chí Minh',
    2,
    'Lead frontend architecture, mentor junior, code review.',
    '5+ năm React/TypeScript, kinh nghiệm large-scale SPA.',
    'Remote worldwide, equity package, health insurance premium.',
    210, 7,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- REMOTE + EXPERT
(
    21,
    'Cloud Architect (Remote)',
    'Cloud Architect',
    'Thiết kế kiến trúc cloud cho hệ thống viễn thông Viettel.',
    '["AWS","GCP","Azure","Microservices","System Design"]',
    'REMOTE', 'EXPERT', 'FLEXIBLE',
    50000000, 80000000, 'MONTH',
    1, 0,
    'ACTIVE', '2026-12-31',
    'Hà Nội', 'Ba Đình', '1 Giang Văn Minh',
    'Remote - 1 Giang Văn Minh, Ba Đình, Hà Nội',
    1,
    'Thiết kế solution architecture, đánh giá công nghệ, PoC.',
    '10+ năm kinh nghiệm, chứng chỉ AWS SA Professional hoặc tương đương.',
    'Remote, lương top market, stock option, conference budget.',
    320, 3,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- ============================================================================
-- FREELANCE Jobs (Tự do)
-- ============================================================================

-- FREELANCE + JUNIOR
(
    14,
    'Freelance UI/UX Designer',
    'UI/UX Designer',
    'Thiết kế giao diện cho các chiến dịch marketing của Tiki.',
    '["Figma","Adobe XD","UI Design","Prototyping"]',
    'FREELANCE', 'JUNIOR', 'FLEXIBLE',
    8000000, 15000000, 'PROJECT',
    2, 0,
    'ACTIVE', '2026-07-31',
    'TP. Hồ Chí Minh', 'Quận 10', 'Rivera Park',
    'Remote/Freelance - TP. Hồ Chí Minh',
    2,
    'Thiết kế UI cho landing page, banner, email template.',
    '1+ năm kinh nghiệm UI/UX, portfolio ấn tượng.',
    'Thanh toán theo project, deadline linh hoạt.',
    55, 14,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- FREELANCE + MIDDLE
(
    13,
    'Freelance WordPress Developer',
    'WordPress Developer',
    'Xây dựng website corporate và e-commerce trên WordPress cho VinGroup.',
    '["WordPress","PHP","WooCommerce","Elementor"]',
    'FREELANCE', 'MIDDLE', 'FLEXIBLE',
    15000000, 30000000, 'PROJECT',
    1, 0,
    'ACTIVE', '2026-08-31',
    'Hà Nội', 'Long Biên', 'Vinhomes Riverside',
    'Remote/Freelance - Hà Nội',
    1,
    'Phát triển theme custom, tích hợp plugin, tối ưu SEO.',
    '3+ năm WordPress, có portfolio 5+ website hoàn chỉnh.',
    'Thanh toán milestone, cơ hội hợp tác dài hạn.',
    40, 5,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- FREELANCE + SENIOR
(
    11,
    'Freelance Blockchain Developer',
    'Blockchain Developer',
    'Phát triển smart contract và DApp cho dự án R&D tại FPT.',
    '["Solidity","Ethereum","Web3.js","Rust","Hardhat"]',
    'FREELANCE', 'SENIOR', 'FLEXIBLE',
    40000000, 70000000, 'PROJECT',
    1, 0,
    'ACTIVE', '2026-10-31',
    'Hà Nội', 'Cầu Giấy', 'Tòa nhà FPT, Duy Tân',
    'Remote/Freelance - Hà Nội',
    1,
    'Viết smart contract, audit security, xây dựng DApp prototype.',
    '5+ năm kinh nghiệm blockchain, đã deploy mainnet.',
    'Thanh toán USD, timeline linh hoạt, NDA bảo mật.',
    85, 2,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- ============================================================================
-- FULL_TIME + các cấp còn thiếu (INTERN, FRESHER, EXPERT, MANAGER)
-- ============================================================================

-- FULL_TIME + INTERN
(
    12,
    'Thực tập sinh Game Developer (Unity)',
    'Intern Game Dev',
    'Tham gia phát triển game mobile tại studio game của VNG.',
    '["Unity","C#","Game Design","2D/3D"]',
    'FULL_TIME', 'INTERN', 'MON_TO_FRI',
    4000000, 6000000, 'MONTH',
    5, 0,
    'ACTIVE', '2026-09-30',
    'TP. Hồ Chí Minh', 'Quận 11', '182 Lê Đại Hành',
    '182 Lê Đại Hành, Quận 11, TP. Hồ Chí Minh',
    2,
    'Phát triển game feature, fix bugs, tối ưu performance mobile.',
    'Sinh viên CNTT/Game, biết Unity cơ bản, có game demo.',
    'Được tham gia dự án game thực tế, lunch miễn phí.',
    110, 35,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- FULL_TIME + FRESHER
(
    21,
    'Fresher Python Developer',
    'Junior Developer',
    'Vị trí dành cho sinh viên mới tốt nghiệp, training từ đầu tại Viettel.',
    '["Python","Django","REST API","Git"]',
    'FULL_TIME', 'FRESHER', 'MON_TO_FRI',
    8000000, 14000000, 'MONTH',
    8, 0,
    'ACTIVE', '2026-10-31',
    'Hà Nội', 'Ba Đình', '1 Giang Văn Minh',
    '1 Giang Văn Minh, Ba Đình, Hà Nội',
    1,
    'Phát triển API với Django, viết unit test, tham gia scrum.',
    'Tốt nghiệp ngành CNTT, biết Python cơ bản, tinh thần học hỏi.',
    'Training 3 tháng, mentor senior, lương review sau 6 tháng.',
    200, 60,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- FULL_TIME + EXPERT
(
    22,
    'Principal Software Engineer',
    'Principal Engineer',
    'Chuyên gia kỹ thuật cấp cao, định hướng công nghệ toàn MoMo.',
    '["System Design","Microservices","Java","Golang","Leadership"]',
    'FULL_TIME', 'EXPERT', 'MON_TO_FRI',
    55000000, 90000000, 'MONTH',
    1, 0,
    'ACTIVE', '2026-12-31',
    'TP. Hồ Chí Minh', 'Quận 7', 'Phú Mỹ Hưng',
    'Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh',
    2,
    'Định hướng technical strategy, review architecture, mentor leads.',
    '10+ năm kinh nghiệm, đã làm việc ở scale triệu users.',
    'Top market salary, stock option, executive benefits.',
    420, 2,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- FULL_TIME + MANAGER
(
    23,
    'Engineering Manager',
    'Engineering Manager',
    'Quản lý team kỹ thuật 15-20 người tại Grab Vietnam.',
    '["Team Management","Agile","Scrum","Technical Leadership","Hiring"]',
    'FULL_TIME', 'MANAGER', 'MON_TO_FRI',
    50000000, 85000000, 'MONTH',
    1, 0,
    'ACTIVE', '2026-12-31',
    'TP. Hồ Chí Minh', 'Quận 7', 'Mapletree Business Centre',
    'Mapletree, Quận 7, TP. Hồ Chí Minh',
    2,
    'Quản lý team engineering, hiring, performance review, roadmap.',
    '7+ năm kinh nghiệm kỹ thuật, 3+ năm quản lý team 10+ người.',
    'RSU, premium health insurance, conference budget.',
    380, 5,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- ============================================================================
-- Bổ sung thêm đa dạng vị trí (tổ hợp chưa phổ biến)
-- ============================================================================

-- CONTRACT + LEAD
(
    11,
    'Technical Lead (Contract 12 tháng)',
    'Tech Lead',
    'Lead team 8-10 developer cho dự án outsource lớn tại FPT Software.',
    '["Java","Spring Boot","Microservices","AWS","Team Lead"]',
    'CONTRACT', 'LEAD', 'MON_TO_FRI',
    40000000, 65000000, 'MONTH',
    1, 0,
    'ACTIVE', '2026-11-30',
    'Hà Nội', 'Cầu Giấy', 'Tòa nhà FPT, Duy Tân',
    'Tòa nhà FPT, Duy Tân, Cầu Giấy, Hà Nội',
    1,
    'Lead team development, code review, system design, client communication.',
    '7+ năm kinh nghiệm, 2+ năm lead team, strong communication.',
    'Hợp đồng 12 tháng, lương net, thưởng project.',
    150, 3,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- REMOTE + LEAD
(
    21,
    'Remote Team Lead (Platform Engineering)',
    'Team Lead',
    'Dẫn dắt team Platform Engineering từ xa cho Viettel Digital.',
    '["Golang","gRPC","K8s","System Design","Leadership"]',
    'REMOTE', 'LEAD', 'FLEXIBLE',
    45000000, 70000000, 'MONTH',
    1, 0,
    'ACTIVE', '2026-12-31',
    'Hà Nội', 'Ba Đình', '1 Giang Văn Minh',
    'Remote - Viettel Digital, Hà Nội',
    1,
    'Lead team 6-8 engineer, define tech roadmap, hiring.',
    '7+ năm kinh nghiệm, strong Golang, leadership skills.',
    'Full remote, equity, unlimited PTO.',
    175, 4,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
),

-- PART_TIME + MANAGER
(
    13,
    'Part-time Project Manager (IT)',
    'Project Manager',
    'Quản lý dự án CNTT bán thời gian cho các dự án nội bộ VinGroup.',
    '["PMP","Agile","Jira","Stakeholder Management"]',
    'PART_TIME', 'MANAGER', 'FLEXIBLE',
    20000000, 35000000, 'MONTH',
    1, 0,
    'ACTIVE', '2026-10-31',
    'Hà Nội', 'Long Biên', 'Vinhomes Riverside',
    'Vinhomes Riverside, Long Biên, Hà Nội',
    1,
    'Quản lý timeline, budget, resource cho 2-3 dự án IT.',
    '5+ năm kinh nghiệm PM, PMP là lợi thế.',
    'Lịch linh hoạt, phụ cấp quản lý.',
    60, 2,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    NULL
);

SET session_replication_role = 'origin';
