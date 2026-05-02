import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Tắt tính năng tự động khôi phục vị trí cuộn của trình duyệt
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Cố định ngay lập tức thay vì smooth
      });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;