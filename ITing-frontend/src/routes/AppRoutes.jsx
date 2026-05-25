import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import PrivateRoute from './PrivateRoute';
import { GlobalLoading } from '../components/common';

const HomePage = lazy(() => import('../pages/public/HomePage'));
const Login = lazy(() => import('../pages/public/LoginPage'));
const Register = lazy(() => import('../pages/public/RegisterPage'));
const JobPage = lazy(() => import('../pages/public/JobPage'));
const ForgotPasswordPage = lazy(() => import('../pages/public/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/public/ResetPasswordPage'));
const VerifyOtpPage = lazy(() => import('../pages/public/VerifyOtpPage'));
const EmployerLayout = lazy(() => import('../layouts/EmployerLayout'));
const EmployerDashboard = lazy(() => import('../pages/employer/EmployerDashboard'));
const CompanyProfile = lazy(() => import('../pages/employer/company-profile/CompanyProfile'));
const PostJob = lazy(() => import('../pages/employer/PostJob'));
const ManageJobs = lazy(() => import('../pages/employer/ManageJobs'));
const EditJob = lazy(() => import('../pages/employer/EditJob'));
const JobApplications = lazy(() => import('../pages/employer/JobApplications'));
const ManageApplications = lazy(() => import('../pages/employer/ManageApplications'));
const LegacyEmployerJobApplicationsRedirect = lazy(() => import('../pages/employer/LegacyEmployerJobApplicationsRedirect'));
const SuspendAppealPage = lazy(() => import('../pages/employer/SuspendAppealPage'));
const Verification = lazy(() => import('../pages/employer/Verification'));
const DataProcessing = lazy(() => import('../pages/employer/DataProcessing'));
const FindCandidate = lazy(() => import('../pages/employer/FindCandidate'));
const FavoriteCandidates = lazy(() => import('../pages/employer/FavoriteCandidates'));
const EmployerServicesPage = lazy(() => import('../pages/employer/EmployerServicesPage'));
const SubscriptionPricingPage = lazy(() => import('../pages/employer/subscription/SubscriptionPricingPage'));
const ManageSubscriptionPage = lazy(() => import('../pages/employer/subscription/ManageSubscriptionPage'));
const HrReportPage = lazy(() => import('../pages/employer/HrReportPage'));
const CandidateDashboard = lazy(() => import('../pages/candidate/CandidateDashboard'));
const CandidateLayout = lazy(() => import('../layouts/CandidateLayout'));
const CandidateProfile = lazy(() => import('../pages/candidate/profile/CandidateProfile'));
const AppliedJobs = lazy(() => import('../pages/candidate/AppliedJobs'));
const JobAlerts = lazy(() => import('../pages/candidate/JobAlerts'));
const FavoriteJobs = lazy(() => import('../pages/candidate/FavoriteJobs'));
const SettingsPage = lazy(() => import('../pages/candidate/SettingsPage'));
const CandidateOffers = lazy(() => import('../pages/candidate/CandidateOffers'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const UserManagement = lazy(() => import('../pages/admin/users/UserManagement'));
const CompanyManagement = lazy(() => import('../pages/admin/companies/CompanyManagement'));
const ReportManagement = lazy(() => import('../pages/admin/reports/ReportManagement'));
const JobDetailPage = lazy(() => import('../pages/public/JobDetailPage'));
const LegacyJobRedirect = lazy(() => import('../pages/public/LegacyJobRedirect'));
const BlogPage = lazy(() => import('../pages/public/BlogPage'));
const BlogDetailPage = lazy(() => import('../pages/public/BlogDetailPage'));
const AboutPage = lazy(() => import('../pages/public/AboutPage'));
const ContactPage = lazy(() => import('../pages/public/ContactPage'));
const PrivacyPage = lazy(() => import('../pages/public/PrivacyPage'));
const TermsPage = lazy(() => import('../pages/public/TermsPage'));
const AdminJobPage = lazy(() => import('../pages/admin/jobs/AdminJobPage'));
const ApprovalManagement = lazy(() => import('../pages/admin/approvals/ApprovalManagement'));
const AuditLogPage = lazy(() => import('../pages/admin/audit/AuditLogPage'));
const SystemConfig = lazy(() => import('../pages/admin/config/SystemConfig'));
const NotificationManagement = lazy(() => import('../pages/admin/notifications/NotificationManagement'));
const CategoryManagement = lazy(() => import('../pages/admin/categories/CategoryManagement'));
const BannerManagement = lazy(() => import('../pages/admin/banner/BannerManagement'));
const AnnouncementManagement = lazy(() => import('../pages/admin/announcements/AnnouncementManagement'));
const BlogManagement = lazy(() => import('../pages/admin/blog/BlogManagement'));
const FaqManagement = lazy(() => import('../pages/admin/faq/FaqManagement'));
const RoleManagement = lazy(() => import('../pages/admin/roles/RoleManagement'));
const CompaniesPage = lazy(() => import('../pages/public/CompaniesPage'));
const CompanyDetailPage = lazy(() => import('../pages/public/CompanyDetailPage'));
const SalaryLookupPage = lazy(() => import('../pages/public/SalaryLookupPage'));
const MessagesPage = lazy(() => import('../pages/messages/MessagesPage'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<GlobalLoading message="Đang nạp ứng dụng..." />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/blogs" element={<BlogPage />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobPage />} />
          <Route path="/tim-viec-lam-:keyword" element={<JobPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/viec-lam/:slug/:jobKey" element={<JobDetailPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/salary-lookup" element={<SalaryLookupPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
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
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="banner" element={<BannerManagement />} />
            <Route path="announcements" element={<AnnouncementManagement />} />
            <Route path="blog" element={<BlogManagement />} />
            <Route path="faq" element={<FaqManagement />} />
            <Route path="roles" element={<RoleManagement />} />
          </Route>
        </Route>

        <Route path="/employer" element={<PrivateRoute allowedRoles={['EMPLOYER']} />}>
          <Route element={<MainLayout />}>
            <Route element={<EmployerLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EmployerDashboard />} />
              <Route path="company-profile" element={<CompanyProfile />} />
              <Route path="appeal" element={<SuspendAppealPage />} />
              <Route path="verification" element={<Verification />} />
              <Route path="data-processing" element={<DataProcessing />} />
              <Route path="post-job" element={<PostJob />} />
              <Route path="manage-jobs" element={<ManageJobs />} />
              <Route path="manage-jobs/:id" element={<EditJob />} />
              <Route path="manage-applications" element={<ManageApplications />} />
              <Route path="job/:id/applications" element={<LegacyEmployerJobApplicationsRedirect />} />
              <Route path="job/:slug/:jobKey/applications" element={<JobApplications />} />
              <Route path="find-cv" element={<FindCandidate />} />
              <Route path="favorite-candidates" element={<FavoriteCandidates />} />
              <Route path="services" element={<EmployerServicesPage />} />
              <Route path="subscriptions" element={<SubscriptionPricingPage />} />
              <Route path="subscriptions/manage" element={<ManageSubscriptionPage />} />
              <Route path="reports" element={<HrReportPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/candidate" element={<PrivateRoute allowedRoles={['CANDIDATE']} />}>
          <Route element={<MainLayout />}>
            <Route element={<CandidateLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<CandidateDashboard />} />

              {/* Các trang con khác làm sau, hiện tại để tạm div rỗng để ko lỗi */}
              <Route path="profile" element={<CandidateProfile defaultTab="personal" />} />
              <Route path="applied-jobs" element={<AppliedJobs />} />
              <Route path="offers" element={<CandidateOffers />} />
              <Route path="favorite-jobs" element={<FavoriteJobs />} />
              <Route path="job-alerts" element={<JobAlerts />} />
              <Route path="settings" element={<SettingsPage />} />

            </Route>
          </Route>
        </Route>

        {/* Add messages route inside MainLayout so it gets Header, but Footer is hidden via MainLayout logic */}
        <Route element={<MainLayout />}>
          <Route path="/messages" element={<PrivateRoute allowedRoles={['CANDIDATE', 'EMPLOYER']} />}>
            <Route index element={<MessagesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<div>Không tìm thấy trang</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
