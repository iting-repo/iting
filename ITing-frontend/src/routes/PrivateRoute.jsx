import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { storage } from '../utils/storage';

const PrivateRoute = ({ allowedRoles }) => {
  // 1. Lấy currentUser từ Redux
  const { currentUser } = useSelector((state) => state.auth);

  // 2. Lấy thông tin từ currentUser (hoặc từ localStorage nếu F5 lại)
  // Ưu tiên lấy từ Redux, nếu không có thì check localStorage (phòng trường hợp F5)
  const role = currentUser?.role || storage.getRole();
  const token = storage.getToken();

  // 3. Kiểm tra đăng nhập
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 4. Kiểm tra quyền
  // Quan trọng: role lấy ra có thể là undefined nếu chưa load xong, nên cần check kỹ
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Nếu role không khớp -> Đá về trang chủ
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;