import React from 'react';
import { Outlet } from 'react-router-dom';
import EmployerSidebar from '../pages/employer/components/EmployerSidebar';

const EmployerLayout = () => {
  return (
    // bg-gray-50 để làm nền tổng thể màu xám nhẹ, giúp các card màu trắng nổi bật
    <div className="flex bg-gray-50 min-h-screen">
      
      {/* Sidebar cố định bên trái */}
      <EmployerSidebar />

      {/* Nội dung thay đổi bên phải */}
      <div className="flex-1 p-6 lg:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
             <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmployerLayout;