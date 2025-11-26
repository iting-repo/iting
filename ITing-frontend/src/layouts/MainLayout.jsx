import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div>
      <nav style={{ padding: 10, background: '#eee' }}>
        <Link to="/" style={{ marginRight: 10 }}>Home</Link>
        <Link to="/jobs" style={{ marginRight: 10 }}>Việc làm</Link>
        <Link to="/login">Đăng nhập</Link>
      </nav>

      <div style={{ padding: 20 }}>
        {/* Đây là nơi nội dung các trang con (Home, Jobs...) hiện ra */}
        <Outlet />
      </div>

      <footer style={{ padding: 10, background: '#333', color: '#fff' }}>
        Footer Chung
      </footer>
    </div>
  );
};

export default MainLayout;