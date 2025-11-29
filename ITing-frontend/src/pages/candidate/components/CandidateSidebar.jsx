import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// Bộ icon chuẩn cho Candidate
import { FaLayerGroup, FaFileAlt, FaBriefcase, FaHeart, FaBell, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logout } from '../../../store/auth/authSlice';

const CandidateSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { path: '/candidate/dashboard', name: 'Tổng quan', icon: <FaLayerGroup /> },
    { path: '/candidate/profile', name: 'Hồ sơ của tôi', icon: <FaFileAlt /> },
    { path: '/candidate/applied-jobs', name: 'Việc đã ứng tuyển', icon: <FaBriefcase /> },
    { path: '/candidate/favorite-jobs', name: 'Việc đã lưu', icon: <FaHeart /> },
    { path: '/candidate/job-alerts', name: 'Thông báo việc làm', icon: <FaBell /> },
    { path: '/candidate/settings', name: 'Cài đặt', icon: <FaCog /> },
  ];

  return (
    <div className="w-[17rem] bg-white min-h-screen border-r border-gray-100 hidden lg:block sticky top-20 h-[calc(100vh-80px)]">
      <div className="p-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Candidate Dashboard</h3>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-[#3AB4E6] border-l-4 border-[#3AB4E6]' // Active style
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900' // Inactive style
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}
          
          {/* Nút Đăng xuất */}
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

export default CandidateSidebar;