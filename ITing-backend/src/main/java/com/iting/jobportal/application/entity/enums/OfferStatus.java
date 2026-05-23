package com.iting.jobportal.application.entity.enums;

public enum OfferStatus {
    /** HR đã gửi cho candidate, đang chờ response. */
    SENT,
    /** Candidate đã accept — application tự move pipeline sang HIRED. */
    ACCEPTED,
    /** Candidate từ chối. */
    DECLINED,
    /** HR thu hồi offer trước khi candidate respond. */
    REVOKED,
    /** Quá hạn (expires_at < now) mà chưa ai respond. */
    EXPIRED
}
