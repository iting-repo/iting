import React from 'react';
import logoIting from '../assets/logo-iting.png';
import { Link } from 'react-router-dom';
import { BsBriefcaseFill } from 'react-icons/bs';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-10 md:pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-4">
        
        {/* --- PHẦN TRÊN: 4 CỘT --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* CỘT 1: LOGO & GIỚI THIỆU */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
               <img src={logoIting} alt="ITing Logo" className="h-10 w-auto object-contain brightness-110" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Nền tảng tuyển dụng dành riêng cho lĩnh vực công nghệ thông tin.
            </p>
            <p className="text-gray-300 font-semibold text-base leading-relaxed">
              Kết nối lập trình viên, kỹ sư và chuyên gia IT với các doanh nghiệp uy tín hàng đầu Việt Nam.
            </p>
          </div>

          {/* CỘT 2: CÔNG TY */}
          <div>
            <h3 className="text-lg font-bold mb-6">Công ty</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">Giới thiệu</Link></li>
              <li><Link to="/team" className="hover:text-white transition-colors">Đội ngũ của chúng tôi</Link></li>
              <li><Link to="/partners" className="hover:text-white transition-colors">Đối tác</Link></li>
              <li><Link to="/for-candidates" className="hover:text-white transition-colors">Dành cho ứng viên</Link></li>
              <li><Link to="/for-employers" className="hover:text-white transition-colors">Dành cho nhà tuyển dụng</Link></li>
            </ul>
          </div>

          {/* CỘT 3: DANH MỤC VIỆC LÀM */}
          <div>
            <h3 className="text-lg font-bold mb-6">Danh mục việc làm</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/jobs?category=SOFTWARE_DEVELOPMENT" className="hover:text-white transition-colors">Lập trình & Phát triển phần mềm</Link></li>
              <li><Link to="/jobs?category=MOBILE_DEVELOPMENT" className="hover:text-white transition-colors">Lập trình Di động</Link></li>
              <li><Link to="/jobs?category=UI_UX" className="hover:text-white transition-colors">Thiết kế UI/UX</Link></li>
              <li><Link to="/jobs?category=PROJECT_MANAGEMENT" className="hover:text-white transition-colors">Quản lý dự án IT</Link></li>
              <li><Link to="/jobs?category=CYBERSECURITY" className="hover:text-white transition-colors">An ninh mạng & Hệ thống</Link></li>
            </ul>
          </div>

          {/* CỘT 4: ĐĂNG KÝ NHẬN TIN */}
          <div>
            <h3 className="text-lg font-bold mb-2">Đăng ký nhận tin</h3>
            <p className="text-gray-400 text-sm mb-4">Bản tin tuyển dụng</p>
            
            <form className="space-y-3">
              <input 
                type="email" 
                placeholder="Nhập địa chỉ email" 
                className="w-full bg-black border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
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
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p className="mb-4 md:mb-0">
             © 2025 ITing – Nền tảng tuyển dụng công nghệ hàng đầu Việt Nam.
          </p>
          <div className="flex gap-6">
             <Link to="/privacy" className="hover:text-white transition-colors underline">Chính sách bảo mật</Link>
             <Link to="/terms" className="hover:text-white transition-colors underline">Điều khoản sử dụng</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;