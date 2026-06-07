import React, { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { PermissionsProvider } from '../contexts/PermissionsContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 768);

  // Lắng nghe resize để điều chỉnh trạng thái sidebar tự động
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  return (
    <PermissionsProvider>
    <div className="admin-layout">
      {/* Header */}
      <AdminHeader onToggleSidebar={handleToggleSidebar} />

      {/* Mobile Overlay */}
      <div 
        className={`admin-layout__overlay ${!sidebarCollapsed ? 'admin-layout__overlay--active' : ''}`}
        onClick={() => setSidebarCollapsed(true)}
      />

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
    </PermissionsProvider>
  );
};

export default AdminLayout;