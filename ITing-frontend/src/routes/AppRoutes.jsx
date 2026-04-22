import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import PrivateRoute from './PrivateRoute';

const HomePage = lazy(() => import('../pages/public/HomePage'));
const Login = lazy(() => import('../pages/public/LoginPage'));
const Register = lazy(() => import('../pages/public/RegisterPage'));
const JobPage = lazy(() => import('../pages/public/JobPage'));
const ForgotPasswordPage = lazy(() => import('../pages/public/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/public/ResetPasswordPage'));
const EmployerLayout = lazy(() => import('../layouts/EmployerLayout'));
const EmployerDashboard = lazy(() => import('../pages/employer/EmployerDashboard'));
const CompanyProfile = lazy(() => import('../pages/employer/company-profile/CompanyProfile'));
const PostJob = lazy(() => import('../pages/employer/PostJob'));
const ManageJobs = lazy(() => import('../pages/employer/ManageJobs'));
const EditJob = lazy(() => import('../pages/employer/EditJob'));
const JobApplications = lazy(() => import('../pages/employer/JobApplications'));
const LegacyEmployerJobApplicationsRedirect = lazy(() => import('../pages/employer/LegacyEmployerJobApplicationsRedirect'));
const Verification = lazy(() => import('../pages/employer/Verification'));
const DataProcessing = lazy(() => import('../pages/employer/DataProcessing'));
const FindCandidate = lazy(() => import('../pages/employer/FindCandidate'));
const CandidateDashboard = lazy(() => import('../pages/candidate/CandidateDashboard'));
const CandidateLayout = lazy(() => import('../layouts/CandidateLayout'));
const CandidateProfile = lazy(() => import('../pages/candidate/profile/CandidateProfile'));
const AppliedJobs = lazy(() => import('../pages/candidate/AppliedJobs'));
const JobAlerts = lazy(() => import('../pages/candidate/JobAlerts'));
const FavoriteJobs = lazy(() => import('../pages/candidate/FavoriteJobs'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const UserManagement = lazy(() => import('../pages/admin/users/UserManagement'));
const CompanyManagement = lazy(() => import('../pages/admin/companies/CompanyManagement'));
const ReportManagement = lazy(() => import('../pages/admin/reports/ReportManagement'));
const JobDetailPage = lazy(() => import('../pages/public/JobDetailPage'));
const LegacyJobRedirect = lazy(() => import('../pages/public/LegacyJobRedirect'));
const AboutPage = lazy(() => import('../pages/public/AboutPage'));
const ContactPage = lazy(() => import('../pages/public/ContactPage'));
const AdminJobPage = lazy(() => import('../pages/admin/jobs/AdminJobPage'));
const ApprovalManagement = lazy(() => import('../pages/admin/approvals/ApprovalManagement'));
const AuditLogPage = lazy(() => import('../pages/admin/audit/AuditLogPage'));
const SystemConfig = lazy(() => import('../pages/admin/config/SystemConfig'));
const NotificationManagement = lazy(() => import('../pages/admin/notifications/NotificationManagement'));
const MessagesPage = lazy(() => import('../pages/messages/MessagesPage'));
const CompaniesPage = lazy(() => import('../pages/public/CompaniesPage'));
const CompanyDetailPage = lazy(() => import('../pages/public/CompanyDetailPage'));

import { LoadingSpinner } from '../components';
import { Settings } from 'lucide-react';

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/jobs/:id" element={<LegacyJobRedirect />} />
          <Route path="/viec-lam/:slug/:jobKey" element={<JobDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="companies" element={<CompanyManagement />} />
            <Route path="reports" element={<ReportManagement />} />
            <Route path="jobs" element={<AdminJobPage />} />
            <Route path="audit" element={<AuditLogPage />} />
            <Route path="config" element={<SystemConfig />} />
            <Route path="notifications" element={<NotificationManagement />} />
          </Route>
        </Route>

        <Route path="/employer" element={<PrivateRoute allowedRoles={['EMPLOYER']} />}>
          <Route element={<MainLayout />}>
            <Route element={<EmployerLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EmployerDashboard />} />
              <Route path="company-profile" element={<CompanyProfile />} />
              <Route path="verification" element={<Verification />} />
              <Route path="data-processing" element={<DataProcessing />} />
              <Route path="post-job" element={<PostJob />} />
              <Route path="manage-jobs" element={<ManageJobs />} />
              <Route path="manage-jobs/:id" element={<EditJob />} />
              <Route path="job/:id/applications" element={<LegacyEmployerJobApplicationsRedirect />} />
              <Route path="job/:slug/:jobKey/applications" element={<JobApplications />} />
              <Route path="find-cv" element={<FindCandidate />} />
            </Route>
          </Route>
        </Route>

        <Route path="/candidate" element={<PrivateRoute allowedRoles={['CANDIDATE']} />}>
          <Route element={<MainLayout />}>
            <Route element={<CandidateLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<CandidateDashboard />} />
              <Route path="profile" element={<CandidateProfile defaultTab="personal" />} />
              <Route path="applied-jobs" element={<AppliedJobs />} />
              <Route path="favorite-jobs" element={<FavoriteJobs />} />
              <Route path="job-alerts" element={<JobAlerts />} />
              <Route path="settings" element={<Settings defaultTab="account" />} />
            </Route>
          </Route>
        </Route>

        <Route path="/messages" element={<PrivateRoute allowedRoles={['CANDIDATE', 'EMPLOYER']} />}>
          <Route element={<MainLayout />}>
            <Route index element={<MessagesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<div>Không tìm thấy trang</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
