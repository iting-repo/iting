import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  return (
    <div className="admin-layout">
      {/* Header */}
      <AdminHeader />

      {/* Sidebar — state managed here */}
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
      />

      {/* Main Content Area — margin syncs with sidebar width */}
      <main className={`admin-layout__main ${sidebarCollapsed ? 'admin-layout__main--collapsed' : ''}`}>
        <div className="admin-layout__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;