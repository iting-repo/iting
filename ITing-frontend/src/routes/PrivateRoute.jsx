import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// import { useSelector } from 'react-redux'; // Bật cái này khi đã setup Redux xong

const PrivateRoute = ({ allowedRoles }) => {
  // --- TẠM THỜI GIẢ LẬP DỮ LIỆU ĐỂ TEST ---
  // Sau này thay bằng: const { token, role } = useSelector(state => state.auth);
  const token = "abc"; // Giả vờ đã login
  const role = "ADMIN"; // Giả vờ là ADMIN (thử đổi thành 'CANDIDATE' để test chặn)
  // ----------------------------------------

  // 1. Nếu chưa có token -> Đẩy về trang Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu có token nhưng Role không nằm trong danh sách cho phép -> Đẩy về Home
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // 3. Ok hết thì cho đi tiếp
  return <Outlet />;
};

export default PrivateRoute;