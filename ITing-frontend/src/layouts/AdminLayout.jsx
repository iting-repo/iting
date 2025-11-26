import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div style={{ display: 'flex' }}>
      <aside style={{ width: 200, background: '#222', color: '#fff', height: '100vh', padding: 10 }}>
        <h3>Admin Panel</h3>
        <ul>
           <li><Link to="/admin" style={{ color: 'white' }}>Dashboard</Link></li>
        </ul>
      </aside>

      <div style={{ flex: 1, padding: 20 }}>
         <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;