import React from 'react';
// Dùng AVIF 10KB từ public/ — Footer logo hiển thị max 40px.
const logoIting = '/logo-iting-small.avif';
import { Link } from 'react-router-dom';
import { BsBriefcaseFill } from 'react-icons/bs';

const Footer = () => {
  return (
    // White theme đồng bộ với header — gray-50 bg để hơi tách biệt với main content
    // (main usually bg-white), border-t gray-200 phân giới. Text contrast WCAG AA.
    <footer className="bg-gray-50 text-gray-700 pt-10 md:pt-16 pb-8 border-t border-gray-200">
      <div className="container mx-auto px-4">

        {/* --- PHẦN TRÊN: 4 CỘT --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          {/* CỘT 1: LOGO & GIỚI THIỆU */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
               <img src={logoIting} alt="ITing Logo" width="120" height="40" className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Nền tảng tuyển dụng dành riêng cho lĩnh vực công nghệ thông tin.
            </p>
            <p className="text-gray-800 font-semibold text-base leading-relaxed">
              Kết nối lập trình viên, kỹ sư và chuyên gia IT với các doanh nghiệp uy tín hàng đầu Việt Nam.
            </p>
          </div>

          {/* CỘT 2: CÔNG TY */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-gray-900">Công ty</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link to="/about" className="hover:text-[#3AB4E6] transition-colors">Giới thiệu</Link></li>
              <li><Link to="/team" className="hover:text-[#3AB4E6] transition-colors">Đội ngũ của chúng tôi</Link></li>
              <li><Link to="/partners" className="hover:text-[#3AB4E6] transition-colors">Đối tác</Link></li>
              <li><Link to="/for-candidates" className="hover:text-[#3AB4E6] transition-colors">Dành cho ứng viên</Link></li>
              <li><Link to="/for-employers" className="hover:text-[#3AB4E6] transition-colors">Dành cho nhà tuyển dụng</Link></li>
            </ul>
          </div>

          {/* CỘT 3: DANH MỤC VIỆC LÀM */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-gray-900">Danh mục việc làm</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link to="/jobs?category=SOFTWARE_DEVELOPMENT" className="hover:text-[#3AB4E6] transition-colors">Lập trình & Phát triển phần mềm</Link></li>
              <li><Link to="/jobs?category=MOBILE_DEVELOPMENT" className="hover:text-[#3AB4E6] transition-colors">Lập trình Di động</Link></li>
              <li><Link to="/jobs?category=UI_UX" className="hover:text-[#3AB4E6] transition-colors">Thiết kế UI/UX</Link></li>
              <li><Link to="/jobs?category=PROJECT_MANAGEMENT" className="hover:text-[#3AB4E6] transition-colors">Quản lý dự án IT</Link></li>
              <li><Link to="/jobs?category=CYBERSECURITY" className="hover:text-[#3AB4E6] transition-colors">An ninh mạng & Hệ thống</Link></li>
            </ul>
          </div>

          {/* CỘT 4: ĐĂNG KÝ NHẬN TIN */}
          <div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">Đăng ký nhận tin</h3>
            <p className="text-gray-600 text-sm mb-4">Bản tin tuyển dụng</p>

            <form className="space-y-3">
              <input
                type="email"
                placeholder="Nhập địa chỉ email"
                className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#3AB4E6] focus:ring-1 focus:ring-[#3AB4E6]/30 transition-colors"
              />
              <button
                type="button"
                className="w-full bg-[#3AB4E6] hover:bg-blue-600 text-white font-bold py-3 rounded transition-colors"
              >
                Đăng ký ngay
              </button>
            </form>
          </div>
        </div>

        {/* --- PHẦN DƯỚI: COPYRIGHT --- */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <p className="mb-4 md:mb-0">
             © 2025 ITing – Nền tảng tuyển dụng công nghệ hàng đầu Việt Nam.
          </p>
          <div className="flex gap-6">
             <Link to="/privacy" className="hover:text-[#3AB4E6] transition-colors underline">Chính sách bảo mật</Link>
             <Link to="/terms" className="hover:text-[#3AB4E6] transition-colors underline">Điều khoản sử dụng</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
