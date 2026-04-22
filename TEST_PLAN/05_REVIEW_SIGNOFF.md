# 05. REVIEW & SIGN-OFF

> **Dự án:** ITing - Hệ thống gợi ý việc làm IT  
> **Tài liệu:** Review Process & Sign-off Checklist  
> **Phiên bản:** 1.0  
> **Ngày:** 22/04/2026  
> **Người soạn:** QA Lead  
> **Trạng thái:** Draft

---

## MỤC LỤC

1. [Mục đích](#1-mục-đích)
2. [Quy trình Review Template](#2-quy-trình-review-template)
3. [Checklist Review](#3-checklist-review)
4. [Biên bản xác nhận](#4-biên-bản-xác-nhận)
5. [Lịch sử phiên bản](#5-lịch-sử-phiên-bản)

---

## 1. MỤC ĐÍCH

Tài liệu này ghi nhận quá trình review và xác nhận của các thành viên trong nhóm đối với bộ Test Plan. Mục tiêu:
- Đảm bảo template dễ sử dụng, phù hợp với năng lực nhóm.
- Có sự đồng thuận và cam kết từ tất cả thành viên.
- Tạo traceability cho giảng viên đánh giá quy trình.

---

## 2. QUY TRÌNH REVIEW TEMPLATE

### 2.1 Các bước

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ QA Lead soạn │────▶│ Gửi cho team │────▶│ Team review  │────▶│ Cập nhật theo│
│ draft        │     │ review       │     │ & feedback   │     │ feedback     │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                    │
                     ┌──────────────┐     ┌──────────────┐          │
                     │ Lưu version  │◀────│ Sign-off     │◀─────────┘
                     │ chính thức   │     │ chính thức   │
                     └──────────────┘     └──────────────┘
```

### 2.2 Chi tiết

| Bước | Hành động | Người thực hiện | Thời gian |
|------|-----------|-----------------|-----------|
| 1 | Soạn draft Test Plan, Template, Checklist | QA Lead | Ngày 1-2 |
| 2 | Gửi tài liệu cho 2 thành viên còn lại | QA Lead | Ngày 3 |
| 3 | Review, ghi nhận xét, đề xuất cải tiến | Member 1, 2 | Ngày 3-4 |
| 4 | Tổng hợp feedback, cập nhật tài liệu | QA Lead | Ngày 5 |
| 5 | Gửi version updated, xác nhận cuối cùng | QA Lead | Ngày 6 |
| 6 | Sign-off chính thức, lưu version | Toàn nhóm | Ngày 7 |

### 2.3 Tiêu chí review
- **Dễ hiểu:** Người mới đọc cũng nắm được cách dùng.
- **Đầy đủ:** Không thiếu cột, bước, tiêu chí quan trọng.
- **Thực tế:** Áp dụng được ngay, không lý thuyết suông.
- **Ngắn gọn:** Không dài dòng, tập trung vào thông tin cần thiết.
- **Nhất quán:** Thuật ngữ, format, quy ước đồng nhất.

---

## 3. CHECKLIST REVIEW

### 3.1 Dành cho người review

| STT | Tiêu chí | Đạt | Không đạt | Ghi chú |
|-----|----------|-----|-----------|---------|
| 1 | Cấu trúc tài liệu rõ ràng, dễ tìm thông tin | ⬜ | ⬜ | |
| 2 | Test Case Template có đủ cột cần thiết | ⬜ | ⬜ | |
| 3 | Hướng dẫn điền test case dễ hiểu | ⬜ | ⬜ | |
| 4 | Ví dụ minh họa sát với thực tế dự án | ⬜ | ⬜ | |
| 5 | Acceptance Criteria đầy đủ, đo lường được | ⬜ | ⬜ | |
| 6 | Bug Tracking workflow rõ ràng, không mơ hồ | ⬜ | ⬜ | |
| 7 | SLA và escalation hợp lý | ⬜ | ⬜ | |
| 8 | Template dễ điền, không phức tạp hóa | ⬜ | ⬜ | |
| 9 | Thuật ngữ nhất quán xuyên suốt | ⬜ | ⬜ | |
| 10 | Có thể áp dụng ngay cho sprint tới | ⬜ | ⬜ | |

### 3.2 Câu hỏi phản hồi

| Câu hỏi | Trả lời |
|---------|---------|
| Template có dễ điền không? | ⬜ Rất dễ / ⬜ Dễ / ⬜ Bình thường / ⬜ Khó |
| Phần nào cần cải thiện? | |
| Có thiếu tiêu chí nào quan trọng không? | |
| Đề xuất thêm gì? | |
| Bạn có sẵn sàng sử dụng template này không? | ⬜ Có / ⬜ Cần sửa trước |

---

## 4. BIÊN BẢN XÁC NHẬN

### 4.1 Thông tin chung

| Thông tin | Giá trị |
|-----------|---------|
| **Dự án** | ITing - Hệ thống gợi ý việc làm IT |
| **Tài liệu review** | Test Plan, Test Case Template, Acceptance Criteria, Bug Tracking |
| **Ngày review** | DD/MM/YYYY |
| **Phiên bản** | 1.0 |

### 4.2 Xác nhận thành viên

| STT | Thành viên | Vai trò | Nhận xét | Xác nhận | Chữ ký | Ngày |
|-----|------------|---------|----------|----------|--------|------|
| 1 | [Tên 1] | QA Lead | Người soạn, tự review | ✅ | | |
| 2 | [Tên 2] | UI Tester | "Template rõ ràng, đủ cột, ví dụ dễ hiểu. Phần Acceptance Criteria chi tiết, dễ check." | ✅ Đồng ý sử dụng | | |
| 3 | [Tên 3] | API/AI Tester | "Bug Tracking workflow hợp lý, SLA rõ ràng. Nên thêm ví dụ bug report đã có." | ✅ Đồng ý sử dụng | | |

### 4.3 Kết luận

> **Cả 3 thành viên đã review và xác nhận bộ Test Plan là "Dễ điền & Sẵn sàng sử dụng".**
> 
> Tài liệu này sẽ được áp dụng chính thức cho dự án ITing từ ngày [DD/MM/YYYY].
> Mọi thay đổi sau này phải được review và sign-off lại.

---

## 5. LỊCH SỬ PHIÊN BẢN

| Version | Ngày | Người cập nhật | Mô tả thay đổi | Người review |
|---------|------|----------------|----------------|--------------|
| 0.1 | DD/MM/YYYY | [QA Lead] | Draft đầu tiên | - |
| 0.2 | DD/MM/YYYY | [QA Lead] | Cập nhật theo feedback: thêm cột Test Data, ví dụ bug report | [Tên 2], [Tên 3] |
| 1.0 | DD/MM/YYYY | [QA Lead] | Version chính thức sau sign-off | Toàn nhóm |

---

## PHỤ LỤC: DANH SÁCH TÀI LIỆU TEST PLAN

Bộ Test Plan hoàn chỉnh gồm 5 tài liệu:

| STT | File | Nội dung | Trạng thái |
|-----|------|----------|------------|
| 1 | `01_TEST_STRATEGY.md` | Chiến lược kiểm thử (Manual, Automation, AI) | ⬜ Draft / ✅ Final |
| 2 | `02_TEST_CASE_TEMPLATE.md` | Template Test Case & Hướng dẫn | ⬜ Draft / ✅ Final |
| 3 | `03_ACCEPTANCE_CRITERIA.md` | Checklist Acceptance Criteria | ⬜ Draft / ✅ Final |
| 4 | `04_BUG_TRACKING.md` | Quy trình quản lý lỗi | ⬜ Draft / ✅ Final |
| 5 | `05_REVIEW_SIGNOFF.md` | Review & Sign-off | ⬜ Draft / ✅ Final |

---

> **Tài liệu này là một phần của bộ Test Plan dự án ITing. Lưu trữ cùng với 4 tài liệu còn lại.**
