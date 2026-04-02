import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Header */}
      <AdminHeader />

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="ml-52 mt-14 flex-1 flex flex-col min-w-0">
        <div className="p-6 md:p-8 flex-1 animate-fade-in-up">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;