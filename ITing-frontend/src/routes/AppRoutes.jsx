import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import PrivateRoute from './PrivateRoute';
import { Navigate } from 'react-router-dom';

// Import các trang (dùng Lazy để nhẹ web)
const HomePage = lazy(() => import('../pages/public/HomePage'));
const Login = lazy(() => import('../pages/public/LoginPage'));
const Register = lazy(() => import('../pages/public/RegisterPage'));
const JobPage = lazy(() => import('../pages/public/JobPage'));
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const ForgotPasswordPage = lazy(() => import('../pages/public/ForgotPasswordPage'));
const EmployerLayout = lazy(() => import('../layouts/EmployerLayout'));
const EmployerDashboard = lazy(() => import('../pages/employer/EmployerDashboard'));
const CompanyProfile = lazy(() => import('../pages/employer/company-profile/CompanyProfile'));
const PostJob = lazy(() => import('../pages/employer/PostJob'));
const ManageJobs = lazy(() => import('../pages/employer/ManageJobs'));
const EditJob = lazy(() => import('../pages/employer/EditJob'));
const JobApplications = lazy(() => import('../pages/employer/JobApplications'));
const CandidateDashboard = lazy(() => import('../pages/candidate/CandidateDashboard'));
const CandidateLayout = lazy(() => import('../layouts/CandidateLayout'));
const CandidateProfile = lazy(() => import('../pages/candidate/profile/CandidateProfile'));
const AppliedJobs = lazy(() => import('../pages/candidate/AppliedJobs'));
const JobAlerts = lazy(() => import('../pages/candidate/JobAlerts'));
const FavoriteJobs = lazy(() => import('../pages/candidate/FavoriteJobs'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Đang tải trang...</div>}>
      <Routes>

        {/* --- KHU VỰC PUBLIC (Ai cũng vào được) --- */}

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

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

        <Route path="/employer" element={<PrivateRoute allowedRoles={['employer']} />}>
          {/* Lớp 1: MainLayout (Có Header đen + Footer) */}
          <Route element={<MainLayout />}>

            {/* Lớp 2: EmployerLayout (Có Sidebar bên trái) */}
            <Route element={<EmployerLayout />}>

              {/* Lớp 3: Các trang nội dung cụ thể */}
              {/* Mặc định vào /employer -> tự nhảy sang /employer/dashboard */}
              <Route index element={<Navigate to="dashboard" replace />} />

              <Route path="dashboard" element={<EmployerDashboard />} />
              <Route path="company-profile" element={<CompanyProfile />} />
              <Route path="post-job" element={<PostJob />} />
              <Route path="manage-jobs" element={<ManageJobs />} />
              <Route path="manage-jobs/:id" element={<EditJob />} />
              <Route path="job/:id/applications" element={<JobApplications />} />
              <Route path="find-cv" element={<div>Trang Tìm Ứng Viên</div>} />

            </Route>
          </Route>
        </Route>

        <Route path="/candidate" element={<PrivateRoute allowedRoles={['candidate']} />}>
          <Route element={<MainLayout />}>
            <Route element={<CandidateLayout />}>

              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<CandidateDashboard />} />

              {/* Các trang con khác làm sau, hiện tại để tạm div rỗng để ko lỗi */}
              <Route path="profile" element={<CandidateProfile />} />
              <Route path="applied-jobs" element={<AppliedJobs />} />
              <Route path="favorite-jobs" element={<FavoriteJobs />} />
              <Route path="job-alerts" element={<JobAlerts />} />
              <Route path="settings" element={<div>Settings Page</div>} />

            </Route>
          </Route>
        </Route>

        {/* Trang 404 */}
        <Route path="*" element={<div>Không tìm thấy trang</div>} />

      </Routes>
    </Suspense>
  );
};

export default AppRoutes;