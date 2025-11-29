import React from 'react';
import { Outlet } from 'react-router-dom';
import CandidateSidebar from '../pages/candidate/components/CandidateSidebar';

const CandidateLayout = () => {
  return (
    // bg-gray-50: Màu nền tổng thể xám nhạt
    <div className="flex bg-gray-50 min-h-screen">
      
      {/* Sidebar bên trái */}
      <CandidateSidebar />

      {/* Khu vực nội dung bên phải (Thay đổi theo Route con) */}
      <div className="flex-1 p-6 lg:p-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
             <Outlet />
        </div>
      </div>
      
    </div>
  );
};

export default CandidateLayout;