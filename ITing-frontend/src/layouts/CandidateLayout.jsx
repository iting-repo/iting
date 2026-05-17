import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import CandidateSidebar from '../components/candidate/CandidateSidebar';
import { FaArrowRight } from 'react-icons/fa';

const CandidateLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">

      {/* ═══ CTA BANNER (Compact, dưới Header) ═══ */}
      <div className="w-full px-4 sm:px-6 lg:px-10 pt-3 pb-0">
        <button
          id="cta-update-profile"
          onClick={() => navigate('/candidate/profile?tab=professional')}
          className="group relative block w-full h-[56px] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-sky-200/30 focus-visible:ring-2 focus-visible:ring-[#3AB4E6] focus-visible:ring-offset-2"
        >
          {/* Ảnh CTA nền — crop nhỏ gọn */}
          <img
            src="/CTA.png"
            alt="Hãy chia sẻ nhu cầu công việc để nhận gợi ý việc làm tốt nhất"
            className="w-full h-full object-cover rounded-xl"
          />

          {/* Nút CTA nhỏ gọn bên phải */}
          <div className="absolute inset-y-0 right-3 sm:right-5 flex items-center">
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-[#3AB4E6] text-xs font-bold py-1.5 px-4 rounded-lg shadow group-hover:bg-white group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              Cập nhật hồ sơ
              <FaArrowRight className="text-[10px] transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>
        </button>
      </div>

      {/* ═══ SIDEBAR + CONTENT ═══ */}
      <div className="flex flex-1">
        {/* Sidebar bên trái */}
        <CandidateSidebar />

        {/* Khu vực nội dung bên phải (Thay đổi theo Route con) */}
        <div className="flex-1 p-6 lg:p-10 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
               <Outlet />
          </div>
        </div>
      </div>

    </div>
  );
};

export default CandidateLayout;