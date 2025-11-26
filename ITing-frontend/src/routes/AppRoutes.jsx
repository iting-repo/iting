import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import PrivateRoute from './PrivateRoute';

// Import các trang (dùng Lazy để nhẹ web)
const HomePage = lazy(() => import('../pages/public/HomePage'));
const Login = lazy(() => import('../pages/public/LoginPage'));
const JobPage = lazy(() => import('../pages/public/JobPage'));
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Đang tải trang...</div>}>
      <Routes>
        
        {/* --- KHU VỰC PUBLIC (Ai cũng vào được) --- */}
        
        <Route path="/login" element={<Login />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobPage />} />
          
        </Route>

        {/* --- KHU VỰC ADMIN (Phải Login + Role ADMIN) --- */}
        {/* Bước 1: Bọc bằng PrivateRoute để chặn cửa */}
        <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
           {/* Bước 2: Bọc bằng AdminLayout để có giao diện Admin */}
           <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
           </Route>
        </Route>

        {/* Trang 404 */}
        <Route path="*" element={<div>Không tìm thấy trang</div>} />

      </Routes>
    </Suspense>
  );
};

export default AppRoutes;