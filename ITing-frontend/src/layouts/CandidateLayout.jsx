import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import CandidateSidebar from '../components/candidate/CandidateSidebar';
import { FaArrowRight, FaBars, FaTimes } from 'react-icons/fa';

const CandidateLayout = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">

      {/* ═══ MOBILE HEADER & CTA BANNER (Sticky on mobile/tablet) ═══ */}
      <div className="sticky top-20 sm:top-[80px] z-30 bg-gray-50 lg:static lg:bg-transparent pb-3 lg:pb-0 shadow-sm lg:shadow-none border-b border-gray-200 lg:border-none">


        {/* ═══ CTA BANNER (Compact, dưới Header) ═══ */}
        <div className="w-full px-4 sm:px-6 lg:px-10 pt-3">
          <button
            id="cta-update-profile"
            onClick={() => navigate('/candidate/profile?tab=professional')}
            className="group relative block w-full h-[56px] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-sky-200/30 focus-visible:ring-2 focus-visible:ring-[#3AB4E6] focus-visible:ring-offset-2"
          >
            {/* Ảnh CTA nền — crop nhỏ gọn */}
            <img
              src="/cta-1.png"
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
        {/* Mobile Sidebar Toggle Header */}
        <div className="lg:hidden flex items-center bg-white px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-[#3AB4E6]/10 rounded-lg text-[#3AB4E6] hover:bg-[#3AB4E6]/20 transition-colors"
          >
            <FaBars size={20} />
          </button>
        </div>
      </div>

      {/* ═══ SIDEBAR + CONTENT ═══ */}
      <div className="flex flex-1 relative">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block">
          <CandidateSidebar />
        </div>

        {/* Sidebar Mobile Overlay (Slide animation) */}
        <div className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Drawer */}
          <div className={`relative z-10 w-[17rem] h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <CandidateSidebar isMobile={true} onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>

        {/* Khu vực nội dung bên phải (Thay đổi theo Route con) */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 overflow-x-hidden w-full">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>

    </div>
  );
};

export default CandidateLayout;