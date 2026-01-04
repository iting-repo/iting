# 🕷️ ITviec Scraper cho ITing Job Portal

Công cụ cào dữ liệu việc làm từ ITviec.com để đổ vào database của ITing Job Portal.

## ⚠️ Lưu ý quan trọng

- **Chỉ sử dụng cho mục đích học tập và nghiên cứu**
- Tuân thủ robots.txt và Terms of Service của ITviec
- Không spam requests, sử dụng delay hợp lý
- Dữ liệu cào được thuộc bản quyền của ITviec

## 📦 Cài đặt

```bash
# Di chuyển vào thư mục scraper
cd scraper

# Tạo virtual environment (khuyến nghị)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Cài đặt dependencies
pip install -r requirements.txt
```

## ⚙️ Cấu hình

1. Copy file cấu hình:
```bash
copy config_example.txt .env
```

2. Chỉnh sửa file `.env` với thông tin database của bạn:
```
DB_HOST=pg-390391d1-nghiavo6777-55a3.g.aivencloud.com
DB_PORT=23388
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=your_actual_password

SCRAPE_PAGES=5
```

## 🚀 Sử dụng

### Cách 1: Chạy trực tiếp (Insert vào database)

```bash
python itviec_scraper.py
```

Script sẽ:
1. Cào dữ liệu từ ITviec (số trang theo `SCRAPE_PAGES`)
2. Insert trực tiếp vào database PostgreSQL
3. Export ra file SQL backup

### Cách 2: Chỉ export ra file SQL

Nếu không muốn connect database, script vẫn sẽ tạo file SQL:
- `scraped_jobs.sql` - Câu lệnh INSERT cho jobs
- `scraped_companies.sql` - Thông tin companies

Sau đó bạn có thể chạy SQL file thủ công trong pgAdmin hoặc DBeaver.

## 📊 Mapping dữ liệu

### ITviec → ITing Jobs

| ITviec Field | ITing Field | Kiểu dữ liệu |
|--------------|-------------|--------------|
| Job Title | `position` | VARCHAR(255) |
| Description | `description` | TEXT(5000) |
| Requirements | `requirements` | TEXT(1000) |
| City | `location` | VARCHAR(255) |
| Skills/Tags | `tech_required` | VARCHAR(1000) |
| Job Type | `job_type` | ENUM |
| Experience | `experience_level` | ENUM |
| Salary | `min_salary`, `max_salary` | BIGINT |

### Job Type Mapping

| ITviec | ITing |
|--------|-------|
| Full-time | `FULL_TIME` |
| Part-time | `PART_TIME` |
| Contract | `CONTRACT` |
| Internship | `INTERNSHIP` |
| Remote | `REMOTE` |

### Experience Level Mapping

| ITviec Keywords | ITing |
|-----------------|-------|
| Fresher, Intern, 0 year | `FRESHER` |
| Junior, 1-2 years | `JUNIOR` |
| 3-4 years | `MIDDLE` |
| Senior, 5+ years | `SENIOR` |
| Lead, Manager | `LEAD` |

## 📁 Output Files

```
scraper/
├── scraped_jobs.sql       # INSERT statements cho jobs table
├── scraped_companies.sql  # Thông tin companies (reference)
└── scraper.log           # Log file (nếu có)
```

## 🔧 Tùy chỉnh

### Thay đổi số trang cào

Trong file `.env`:
```
SCRAPE_PAGES=10  # Cào 10 trang
```

Hoặc trong code:
```python
scraper.scrape_all(pages=10)
```

### Thay đổi employer_id mặc định

Jobs cào về cần gắn với một employer (company). Mặc định là ID 11 (FPT).

Trong code, sửa `Config.DEFAULT_EMPLOYER_ID`:
```python
DEFAULT_EMPLOYER_ID = 11  # Đổi thành ID công ty bạn muốn
```

### Thêm filters

Bạn có thể filter theo skill, location:
```python
# Sửa URL trong Config
JOBS_URL = "https://itviec.com/it-jobs/java/ho-chi-minh-hcm"
```

## ❌ Troubleshooting

### Lỗi "No jobs scraped"

ITviec có thể đã thay đổi cấu trúc HTML. Cần update các CSS selectors trong:
- `parse_job_card()` - Cho job list
- `scrape_job_detail()` - Cho job detail

### Lỗi database connection

1. Kiểm tra thông tin trong `.env`
2. Đảm bảo IP được whitelist trên Aiven (nếu dùng Aiven)
3. Kiểm tra SSL mode (`sslmode=require`)

### Bị block/rate limit

1. Tăng delay: `DELAY_MIN = 3`, `DELAY_MAX = 5`
2. Giảm số trang: `SCRAPE_PAGES = 3`
3. Sử dụng proxy (cần implement thêm)

## 📝 Ví dụ Output SQL

```sql
-- scraped_jobs.sql
INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at) VALUES
(11, 'Senior Java Developer', 'Develop backend services...', '5+ years Java experience...', 'Ho Chi Minh', 'Java, Spring Boot, MySQL, Docker', 'FULL_TIME', 'SENIOR', 'ACTIVE', 5, 0, 25000000, 50000000, '2025-01-10', 0, 0, NOW());
```

## 🤝 Đóng góp

Nếu ITviec thay đổi cấu trúc, vui lòng update các CSS selectors và tạo pull request.

---

*Disclaimer: Tool này chỉ dùng cho mục đích học tập. Tác giả không chịu trách nhiệm cho việc sử dụng sai mục đích.*

