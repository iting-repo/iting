import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import { checkAuth } from './store/auth/authSlice';
import ScrollToTop from './components/common/ScrollToTop';
import MaintenanceScreen from './components/common/MaintenanceScreen';
import axiosInstance from './utils/axiosInstance';
// Lazy-load: modal chỉ render khi có announcement active, không cần trong initial bundle.
const SystemAnnouncementModal = lazy(() => import('./components/common/SystemAnnouncementModal'));

const PUBLIC_LANDING_PATTERNS = [
  /^\/$/,
  /^\/jobs(\/|$)/,
  /^\/tim-viec-lam-/,
  /^\/viec-lam(\/|$)/,
  /^\/companies(\/|$)/,
  /^\/blog(s)?(\/|$)/,
  /^\/about(\/|$)/,
  /^\/contact(\/|$)/,
];

const isPublicLanding = (pathname) => PUBLIC_LANDING_PATTERNS.some((re) => re.test(pathname));

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.auth);
  const hasRedirected = useRef(false);
  const [maintenance, setMaintenance] = useState({ on: false, message: '' });

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Kiểm tra trạng thái bảo trì (public, không bị interceptor chặn) — poll mỗi 60s.
  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const { data } = await axiosInstance.get('/public/maintenance');
        if (active) setMaintenance({ on: !!data?.maintenanceMode, message: data?.message || '' });
      } catch {
        if (active) setMaintenance({ on: false, message: '' });
      }
    };
    check();
    const id = setInterval(check, 60000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      hasRedirected.current = false;
      return;
    }
    if (hasRedirected.current) return;

    const role = currentUser.role;
    if (!role) return;

    const onAuthRoute = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password']
      .some((p) => location.pathname.startsWith(p));
    const shouldRedirectFrom = onAuthRoute || isPublicLanding(location.pathname);

    if (role === 'EMPLOYER' && shouldRedirectFrom) {
      hasRedirected.current = true;
      navigate('/employer/dashboard', { replace: true });
    } else if (role === 'ADMIN' && shouldRedirectFrom) {
      hasRedirected.current = true;
      navigate('/admin/dashboard', { replace: true });
    } else {
      hasRedirected.current = true;
    }
  }, [currentUser, location.pathname, navigate]);

  // Bảo trì: chặn user thường; admin và các route quản trị/đăng nhập vẫn vào được để tắt.
  const isAdmin = currentUser?.role === 'ADMIN';
  const onAdminOrAuth =
    location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');
  if (maintenance.on && !isAdmin && !onAdminOrAuth) {
    return <MaintenanceScreen message={maintenance.message} />;
  }

  return (
    <>
      <ScrollToTop />
      <AppRoutes />
      <Suspense fallback={null}>
        <SystemAnnouncementModal />
      </Suspense>
    </>
  );
}

export default App;
