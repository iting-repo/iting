import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaBuilding, FaPlusCircle, FaList, FaSignOutAlt, FaSearch } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logout } from '../../../store/auth/authSlice';

const EmployerSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      dispatch(logout());
    }, 100);
  };

  const menuItems = [
    { path: '/employer/dashboard', name: 'Tổng quan', icon: <FaHome /> },
    { path: '/employer/company-profile', name: 'Hồ sơ công ty', icon: <FaBuilding /> },
    { path: '/employer/post-job', name: 'Đăng tuyển dụng', icon: <FaPlusCircle /> },
    { path: '/employer/manage-jobs', name: 'Quản lý tin đăng', icon: <FaList /> },
    { path: '/employer/find-cv', name: 'Tìm kiếm ứng viên', icon: <FaSearch /> },
  ];

  return (
    <div className="w-64 bg-white min-h-screen border-r border-gray-100 hidden lg:block sticky top-20 h-[calc(100vh-80px)]">
      <div className="p-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Employers</h3>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                    ? 'bg-blue-50 text-[#3AB4E6] border-l-4 border-[#3AB4E6]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}

          <li className="mt-8 pt-8 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
            >
              <FaSignOutAlt className="text-lg" />
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EmployerSidebar;