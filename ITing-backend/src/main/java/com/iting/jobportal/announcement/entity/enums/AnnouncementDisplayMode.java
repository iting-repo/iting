package com.iting.jobportal.announcement.entity.enums;

public enum AnnouncementDisplayMode {
  /**
   * Modal khoá overlay; user phải bấm Accept/Close (nếu requireAcknowledge=true thì phải tick
   * checkbox).
   */
  MODAL_BLOCKING,
  /** Modal hiện ngay nhưng có thể đóng bằng X hoặc click outside. */
  MODAL_DISMISSIBLE,
  /** Thanh banner trên đầu trang, không khoá page. */
  BANNER
}
