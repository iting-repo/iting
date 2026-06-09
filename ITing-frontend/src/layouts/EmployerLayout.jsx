import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import EmployerSidebar from '../components/employer/EmployerSidebar';
import { FaBan, FaBars } from 'react-icons/fa';
import companyService from '../services/companyService';
import './EmployerLayout.css';

const EmployerLayout = () => {
  const [companySuspended, setCompanySuspended] = useState(false);
  const [suspendReason, setSuspendReason] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkCompanyStatus = async () => {
      try {
        const res = await companyService.getMyCompany();
        const company = res?.data || res;
        if (company && company.active === false) {
          setCompanySuspended(true);
          setSuspendReason(company.statusReason || null);
        }
      } catch (err) {
        // Ignore errors - company might not exist yet
      }
    };
    checkCompanyStatus();
  }, []);

  return (
    // bg-gray-50 để làm nền tổng thể màu xám nhẹ, giúp các card màu trắng nổi bật
    <div className="flex bg-gray-50 min-h-screen">

      {/* Sidebar cố định bên trái */}
      <EmployerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Nội dung thay đổi bên phải */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden hide-scrollbar">

        {/* Mobile Header / Hamburger Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-extrabold text-[#3AB4E6] tracking-tight">Trang cho Nhà tuyển dụng</h2>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 text-[#3AB4E6] hover:bg-[#EAF6FF] transition-colors"
          >
            <FaBars size={18} />
          </button>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Banner đình chỉ */}
          {companySuspended && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 backdrop-blur-sm p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <FaBan className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-red-800 mb-1">
                    Tài khoản công ty đã bị đình chỉ
                  </h3>
                  <p className="text-sm text-red-600 leading-relaxed">
                    Tất cả tin tuyển dụng của bạn đã bị tạm ẩn khỏi ứng viên.
                    Bạn không thể đăng tin mới cho đến khi được gỡ đình chỉ. Vui lòng xem chi tiết hồ sơ và đọc các điều khoản để tiến hành khiếu nại (nếu có).
                  </p>
                  {suspendReason && (
                    <div className="mt-3 px-4 py-2.5 bg-white/60 rounded-xl border border-red-100">
                      <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">Lý do</span>
                      <p className="text-sm text-red-700 mt-1">{suspendReason}</p>
                    </div>
                  )}
                  <button
                    onClick={() => navigate('/employer/appeal')}
                    className="mt-3 text-sm font-bold text-red-600 hover:text-red-800 hover:underline transition-colors"
                  >
                    Xem chi tiết và hướng dẫn khiếu nại →
                  </button>
                </div>
              </div>
            </div>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmployerLayout;