import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

const AdminLayout = () => {
  return (
    <div className="flex bg-[#F3F4F6] min-h-screen font-sans">
      
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-20 p-6 lg:p-8 overflow-x-hidden">
        
        {/* Header dùng chung */}
        <AdminHeader />

        {/* Nội dung thay đổi theo từng trang */}
        <div className="animate-fade-in-up">
           <Outlet />
        </div>
        
      </div>
    </div>
  );
};

export default AdminLayout;