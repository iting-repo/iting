# 01. CHIẾN LƯỢC KIỂM THỬ (TEST STRATEGY)

> **Dự án:** ITing - Hệ thống gợi ý việc làm IT  
> **Tài liệu:** Test Strategy  
> **Phiên bản:** 1.0  
> **Ngày:** 22/04/2026  
> **Người soạn:** QA Lead  
> **Trạng thái:** Draft

---

## MỤC LỤC

1. [Giới thiệu](#1-giới-thiệu)
2. [Phạm vi kiểm thử](#2-phạm-vi-kiểm-thử)
3. [Phương pháp kiểm thử](#3-phương-pháp-kiểm-thử)
4. [Môi trường kiểm thử](#4-môi-trường-kiểm-thử)
5. [Tiêu chí Entry & Exit](#5-tiêu-chí-entry--exit)
6. [Quản lý rủi ro](#6-quản-lý-rủi-ro)
7. [Phân công & Timeline](#7-phân-công--timeline)

---

## 1. GIỚI THIỆU

### 1.1 Mục đích
Tài liệu này định nghĩa chiến lược kiểm thử tổng thể cho dự án **ITing**. Mục tiêu đảm bảo:
- Chất lượng sản phẩm đạt chuẩn trước khi bàn giao/demo.
- Quy trình kiểm thử được chuẩn hóa, có thể lặp lại và đo lường.
- Phát hiện sớm lỗi, giảm thiểu chi phí sửa chữa.

### 1.2 Đối tượng áp dụng
- Tester/QA: Thực thi test case, báo cáo lỗi.
- Developer: Fix lỗi, hỗ trợ test unit/integration.
- Product Owner/BA: Xác nhận acceptance criteria.
- Giảng viên hướng dẫn: Đánh giá quy trình chất lượng.

### 1.3 Tài liệu tham khảo
- Software Requirements Specification (SRS) - ITing
- API Documentation (Swagger/Postman)
- UI/UX Design (Figma)
- AI Model Documentation

---

## 2. PHẠM VI KIỂM THỬ

### 2.1 In-Scope (Trong phạm vi)

| Module | Tính năng | Loại test |
|--------|-----------|-----------|
| **Authentication** | Đăng ký, Đăng nhập, Forgot Password, OAuth | Manual, API |
| **User Profile** | CRUD thông tin, Upload CV, Kỹ năng, Sở thích | Manual, API |
| **Job Management** | Đăng job, Chỉnh sửa, Đóng job, Duyệt job | Manual, API |
| **Search & Filter** | Tìm kiếm keyword, Filter, Sort, Pagination | Manual, API |
| **Application** | Apply job, Theo dõi trạng thái, Rút đơn | Manual, API |
| **AI Recommendation** | Gợi ý việc làm, Đánh giá độ phù hợp | AI Testing, Manual |
| **Dashboard** | Thống kê, Biểu đồ, Thông báo | Manual |
| **Responsive** | Mobile, Tablet, Desktop | Manual |

### 2.2 Out-of-Scope (Ngoài phạm vi)

| Hạng mục | Lý do |
|----------|-------|
| Performance Load Testing | Không yêu cầu trong đồ án, chỉ test cơ bản |
| Security Penetration Testing | Chỉ test validation cơ bản, không test exploit |
| Cross-platform Native App | Chỉ test Web Responsive |
| Third-party Integration (Email, Payment) | Mock/Stubs, không test thực tế gateway |

---

## 3. PHƯƠNG PHÁP KIỂM THỬ

### 3.1 Manual Testing (UI/UX)

**Mục tiêu:** Đảm bảo trải nghiệm người dùng mượt mà, giao diện đúng thiết kế, flow nghiệp vụ chính xác.

#### 3.1.1 Kỹ thuật áp dụng
- **Equivalence Partitioning:** Chia dữ liệu đầu vào thành các lớp tương đương.
- **Boundary Value Analysis:** Test các giá trị biên (min, max, vừa đủ, thiếu 1, thừa 1).
- **Error Guessing:** Dựa vào kinh nghiệm đoán các lỗi thường gặp.
- **Exploratory Testing:** Khám phá tự do, tìm edge cases.
- **Scenario-based Testing:** Test theo user story thực tế.

#### 3.1.2 Ma trận kiểm thử
| Trình duyệt | Desktop (1440px) | Tablet (768px) | Mobile (375px) |
|-------------|------------------|----------------|----------------|
| Chrome | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ⚠️ (Cơ bản) |

#### 3.1.3 Tiêu chí Pass
- UI đúng Figma >= 90%.
- Không có lỗi JavaScript console.
- Flow nghiệp vụ hoàn tất không blocker.
- Responsive không vỡ layout.

---

### 3.2 Automation Testing (API)

**Mục tiêu:** Đảm bảo API hoạt động đúng contract, response chính xác, performance ổn định.

#### 3.2.1 Công cụ
- **Postman:** Tạo collection, viết test script.
- **Newman:** Chạy collection tự động qua CLI.
- **GitHub Actions:** CI/CD pipeline trigger.

#### 3.2.2 Cấu trúc Test Suite
```
ITing-API-Tests/
├── Auth/
│   ├── Register.postman_request
│   ├── Login.postman_request
│   └── Refresh Token.postman_request
├── Users/
│   ├── Get Profile.postman_request
│   └── Update Profile.postman_request
├── Jobs/
│   ├── Create Job.postman_request
│   ├── Search Jobs.postman_request
│   └── Get Job Detail.postman_request
└── AI/
    └── Get Recommendations.postman_request
```

#### 3.2.3 Test Script mẫu (JavaScript)
```javascript
pm.test("Status code is 200", () => pm.response.to.have.status(200));
pm.test("Response time < 500ms", () => pm.expect(pm.response.responseTime).to.be.below(500));
pm.test("Response has required fields", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("id");
    pm.expect(json).to.have.property("title");
    pm.expect(json).to.have.property("company");
});
pm.test("Data types are correct", () => {
    const json = pm.response.json();
    pm.expect(json.id).to.be.a("number");
    pm.expect(json.title).to.be.a("string");
});
```

#### 3.2.4 Tiêu chí Pass
- 100% endpoints có test case.
- Pass rate >= 95%.
- Response time trung bình < 500ms.
- Schema validation pass 100%.

---

### 3.3 AI Testing (Recommendation Accuracy)

**Mục tiêu:** Đo lường độ chính xác, phù hợp và đa dạng của gợi ý việc làm.

#### 3.3.1 Metrics đánh giá

| Metric | Công thức | Target | Ý nghĩa |
|--------|-----------|--------|---------|
| **Precision@K** | Relevant@K / K | >= 70% | Tỷ lệ job phù hợp trong top K |
| **Recall@K** | Relevant@K / Total Relevant | >= 60% | Tỷ lệ job phù hợp được gợi ý |
| **F1-Score** | 2 * (Prec * Rec) / (Prec + Rec) | >= 65% | Cân bằng Precision & Recall |
| **Relevance Score** | Trung bình điểm đánh giá (1-5) | >= 3.5 | Mức độ phù hợp chủ quan |
| **Diversity** | Unique Companies / K | >= 50% | Đa dạng nhà tuyển dụng |
| **Coverage** | Jobs được gợi ý / Total Jobs | >= 40% | Phạm vi gợi ý của hệ thống |

#### 3.3.2 Phương pháp đánh giá

**Cách 1: Rule-based Evaluation (Automated)**
- So khớp kỹ năng user vs yêu cầu job.
- Kiểm tra kinh nghiệm, location, salary range.
- Chấm điểm tự động dựa trên trọng số.

**Cách 2: Human-in-the-loop (Manual)**
- Chọn 20 profile mẫu đa dạng.
- 2 người đánh giá độc lập chấm điểm từng job.
- Tính trung bình, so sánh inter-rater reliability.

#### 3.3.3 Test Data cho AI

| ID | Profile | Skills | Experience | Expected Jobs |
|----|---------|--------|------------|---------------|
| P1 | Junior Frontend | React, JS, CSS | 0-1 năm | React Dev, Frontend Intern |
| P2 | Senior Backend | Python, Django, AWS | 5+ năm | Python Senior, Backend Lead |
| P3 | Fullstack Mid | React, Node, Mongo | 2-3 năm | Fullstack Dev, MEAN/MERN |
| P4 | QA Manual | Selenium, Jira, SQL | 1-2 năm | QA Tester, QC Engineer |
| P5 | Fresher Java | Java, Spring Boot | Thực tập | Java Fresher, Backend Trainee |

#### 3.3.4 Tiêu chí Pass
- Precision@10 >= 70%.
- Relevance Score >= 3.5/5.
- Không gợi ý job hết hạn, trùng lặp > 2 lần.
- Diversity >= 50%.

---

## 4. MÔI TRƯỜNG KIỂM THỬ

### 4.1 Môi trường

| Môi trường | URL | Mục đích | Dữ liệu |
|------------|-----|----------|---------|
| **Local Dev** | http://localhost:3000 | Dev test, debug | Mock/Seed |
| **Staging** | https://staging.iting.com | QA test, UAT | Anonymized Prod |
| **Production** | https://iting.com | Live monitoring | Real |

### 4.2 Cấu hình tối thiểu
- **OS:** Windows 10/11, macOS 12+, Ubuntu 20.04+
- **Browser:** Chrome 115+, Firefox 110+, Edge 115+
- **Network:** 4G/Wi-Fi ổn định, latency < 100ms
- **Device:** Desktop, Tablet (iPad), Mobile (iPhone/Android)

---

## 5. TIÊU CHÍ ENTRY & EXIT

### 5.1 Entry Criteria (Điều kiện bắt đầu test)
- [ ] Code đã merge vào branch `develop`.
- [ ] Build thành công, deploy lên Staging.
- [ ] Release notes đã được cập nhật.
- [ ] Test environment sẵn sàng, data đã seed.
- [ ] Test case đã được review và approve.

### 5.2 Exit Criteria (Điều kiện kết thúc test)
- [ ] 100% test case đã thực thi.
- [ ] Pass rate >= 90%.
- [ ] Không còn bug Critical/High open.
- [ ] Bug Medium đã fix hoặc có workaround.
- [ ] AI Metrics đạt target.
- [ ] Báo cáo test đã được gửi và approve.

---

## 6. QUẢN LÝ RỦI RO

| Rủi ro | Khả năng | Tác động | Giảm thiểu |
|--------|----------|----------|------------|
| Server staging不稳定 | Trung bình | Cao | Có local backup, mock API |
| AI model gợi ý sai | Cao | Cao | Fallback rule-based, manual filter |
| Thiếu thời gian test | Cao | Trung bình | Ưu tiên High priority, cắt scope Low |
| Data test không đủ | Trung bình | Trung bình | Script seed data tự động |
| Bug blocker phát sinh muộn | Thấp | Cao | Code freeze 3 ngày trước demo |

---

## 7. PHÂN CÔNG & TIMELINE

### 7.1 Phân công
| Thành viên | Vai trò | Trách nhiệm |
|------------|---------|-------------|
| [Tên 1] | QA Lead | Strategy, Plan, Report, Review |
| [Tên 2] | UI Tester | Manual UI, Responsive, Cross-browser |
| [Tên 3] | API/AI Tester | Automation, AI Metrics, Performance |

### 7.2 Timeline
| Tuần | Nhiệm vụ | Deliverable |
|------|----------|-------------|
| 1 | Viết plan, test case, setup env | Test Plan, Test Case Sheet |
| 2 | Test UI Auth/Profile, Setup API | UI Report, Postman Collection |
| 3 | Test UI Jobs/Apply, AI Testing | UI Report, AI Metrics Report |
| 4 | Regression, Fix bug, Demo prep | Final Report, Demo Script |

---

> **Tài liệu này sẽ được cập nhật khi có thay đổi. Phiên bản mới nhất lưu tại repository dự án.**
