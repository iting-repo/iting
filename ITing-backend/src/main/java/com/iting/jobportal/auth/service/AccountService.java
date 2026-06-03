package com.iting.jobportal.auth.service;

import com.iting.jobportal.auth.dto.request.BanRequest;

public interface AccountService {

  /**
   * Thực hiện cấm một tài khoản và lưu lịch sử.
   *
   * @param targetId ID của tài khoản bị cấm
   * @param request Chứa lý do và thời hạn cấm
   * @param adminEmail Email của admin thực hiện (lấy từ Security Context)
   */
  void banAccount(Long targetId, BanRequest request, String adminEmail);

  /**
   * Mở khóa tài khoản và cập nhật trạng thái lịch sử cấm.
   *
   * @param targetId ID của tài khoản cần mở khóa
   */
  void unbanAccount(Long targetId);
}
