package com.iting.jobportal.common.service.impl;

import com.iting.jobportal.common.service.EmailTemplateService;
import org.springframework.stereotype.Service;

@Service
public class EmailTemplateServiceImpl implements EmailTemplateService {

    private static final String BRAND_COLOR = "#3AB4E6";
    private static final String TEXT_COLOR = "#1f2937";
    private static final String FOOTER_COLOR = "#6b7280";

    @Override
    public String getOtpTemplate(String name, String otp, String purpose) {
        String purposeText = "để xác thực tài khoản của bạn";
        if ("RESET_PASSWORD".equals(purpose)) {
            purposeText = "để đặt lại mật khẩu cho tài khoản ITing của bạn";
        }

        return buildWrapper(
            "<div style='text-align: center; padding: 20px;'>" +
            "  <h1 style='color: " + BRAND_COLOR + "; font-size: 24px; margin-bottom: 10px;'>Mã xác thực của bạn</h1>" +
            "  <p style='color: " + TEXT_COLOR + "; font-size: 16px; margin-bottom: 30px;'>Chào " + name + ", vui lòng sử dụng mã dưới đây " + purposeText + ".</p>" +
            "  <div style='background-color: #f3f4f6; border-radius: 12px; padding: 20px; display: inline-block; min-width: 150px;'>" +
            "    <span style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: " + BRAND_COLOR + ";'>" + otp + "</span>" +
            "  </div>" +
            "  <p style='color: " + FOOTER_COLOR + "; font-size: 13px; margin-top: 30px;'>Mã này sẽ hết hạn sau 5 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>" +
            "</div>"
        );
    }

    @Override
    public String getApplicationAcceptedTemplate(String candidateName, String jobTitle, String companyName, String actionUrl) {
        return buildWrapper(
            "<div>" +
            "  <h1 style='color: " + BRAND_COLOR + "; font-size: 24px;'>Chúc mừng, hồ sơ của bạn đã được chấp nhận!</h1>" +
            "  <p style='color: " + TEXT_COLOR + "; font-size: 16px;'>Chào " + candidateName + ",</p>" +
            "  <p style='color: " + TEXT_COLOR + "; font-size: 16px; line-height: 1.6;'>" +
            "    Chúng tôi rất vui mừng thông báo rằng nhà tuyển dụng <strong>" + companyName + "</strong> đã xem xét và chấp nhận hồ sơ ứng tuyển của bạn cho vị trí " +
            "    <span style='color: " + BRAND_COLOR + "; font-weight: bold;'>" + jobTitle + "</span>." +
            "  </p>" +
            "  <p style='color: " + TEXT_COLOR + "; font-size: 16px;'>Vui lòng truy cập hệ thống để xem các bước tiếp theo hoặc phản hồi lại nhà tuyển dụng.</p>" +
            "  <div style='text-align: center; margin: 40px 0;'>" +
            "    <a href='" + actionUrl + "' style='background-color: " + BRAND_COLOR + "; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(58, 180, 230, 0.2);'>Xem chi tiết ứng tuyển</a>" +
            "  </div>" +
            "  <p style='color: " + TEXT_COLOR + "; font-size: 15px;'>Chúc bạn có một buổi phỏng vấn thành công!</p>" +
            "</div>"
        );
    }

    @Override
    public String getApplicationRejectedTemplate(String candidateName, String jobTitle, String companyName, String reason) {
        String reasonHtml = "";
        if (reason != null && !reason.isBlank()) {
            reasonHtml = "<div style='background-color: #f9fafb; border-left: 4px solid #d1d5db; padding: 15px; margin: 20px 0; font-style: italic; color: #4b5563;'>" + reason + "</div>";
        }

        return buildWrapper(
            "<div>" +
            "  <h1 style='color: #4b5563; font-size: 22px;'>Cập nhật về hồ sơ ứng tuyển của bạn</h1>" +
            "  <p style='color: " + TEXT_COLOR + "; font-size: 16px;'>Chào " + candidateName + ",</p>" +
            "  <p style='color: " + TEXT_COLOR + "; font-size: 16px; line-height: 1.6;'>" +
            "    Cảm ơn bạn đã quan tâm và dành thời gian ứng tuyển vào vị trí <strong>" + jobTitle + "</strong> tại <strong>" + companyName + "</strong>." +
            "  </p>" +
            "  <p style='color: " + TEXT_COLOR + "; font-size: 16px;'>" +
            "    Rất tiếc phải thông báo rằng nhà tuyển dụng đã quyết định chưa tiếp tục với hồ sơ của bạn vào lúc này." +
            "  </p>" +
            "  " + reasonHtml +
            "  <p style='color: " + TEXT_COLOR + "; font-size: 16px; margin-top: 30px;'>" +
            "    Đừng nản lòng! Hệ thống ITing vẫn còn hàng ngàn cơ hội khác đang chờ đón bạn. Hãy tiếp tục cập nhật hồ sơ và tìm kiếm công việc phù hợp nhé." +
            "  </p>" +
            "</div>"
        );
    }

    private String buildWrapper(String content) {
        return "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "  <meta charset='utf-8'>" +
            "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "  <style>" +
            "    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }" +
            "    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }" +
            "    .header { background-color: " + BRAND_COLOR + "; height: 120px; display: flex; align-items: center; justify-content: center; color: white; }" +
            "    .content { padding: 40px; }" +
            "    .footer { padding: 30px; text-align: center; color: " + FOOTER_COLOR + "; font-size: 12px; border-top: 1px solid #f3f4f6; }" +
            "  </style>" +
            "</head>" +
            "<body>" +
            "  <div class='container'>" +
            "    <div class='header'>" +
            "      <h1 style='margin: 0; font-size: 32px; letter-spacing: 2px;'>ITing</h1>" +
            "    </div>" +
            "    <div class='content'>" +
            "      " + content +
            "    </div>" +
            "    <div class='footer'>" +
            "      <p>&copy; 2024 ITing Job Portal. Tất cả quyền được bảo lưu.</p>" +
            "      <p>Địa chỉ: Khu CNC Hòa Lạc, Thạch Thất, Hà Nội</p>" +
            "      <p><a href='#' style='color: " + BRAND_COLOR + ";'>Điều khoản sử dụng</a> | <a href='#' style='color: " + BRAND_COLOR + ";'>Chính sách bảo mật</a></p>" +
            "    </div>" +
            "  </div>" +
            "</body>" +
            "</html>";
    }
}
