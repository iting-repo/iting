import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import { checkAuth } from './store/auth/authSlice';
import ScrollToTop from './components/common/ScrollToTop';
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

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

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
