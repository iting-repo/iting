package com.iting.jobportal.payment.entity;

public enum PaymentStatus {
    PENDING,      // chờ thanh toán (đang chờ webhook SEPAY)
    PAID,         // đã nhận tiền — webhook đã match
    EXPIRED,      // hết hạn (sau N giờ chưa pay)
    CANCELED,     // user hủy thủ công
    FAILED        // amount mismatch hoặc lỗi xử lý
}
