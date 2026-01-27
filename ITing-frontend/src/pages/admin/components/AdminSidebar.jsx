import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../../store/auth/authSlice';
import {
  FaUserFriends, FaShieldAlt, FaEye, FaTags, FaFileAlt, FaCog, FaPowerOff
} from 'react-icons/fa';

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      dispatch(logout());
    }, 100);
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: <FaUserFriends />, label: "Dashboard" }, // Giả sử icon user group đại diện Dashboard như hình
    { path: '/admin/users', icon: <FaShieldAlt />, label: "Users" },
    { path: '/admin/reports', icon: <FaEye />, label: "Reports" },
    { path: '/admin/approvals', icon: <FaTags />, label: "Approvals" },
    { path: '/admin/documents', icon: <FaFileAlt />, label: "Documents" },
    { path: '/admin/settings', icon: <FaCog />, label: "Settings" },
  ];

  return (
    <div className="w-20 bg-[#3ab4e6] min-h-screen flex flex-col items-center py-8 fixed left-0 top-0 bottom-0 z-50 shadow-xl">
      {/* Logo Area */}
      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-12">
        JD
      </div>

      {/* Menu Items */}
      <nav className="flex-1 flex flex-col gap-6 w-full px-4">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `w-full aspect-square flex items-center justify-center rounded-xl transition-all duration-300 ${isActive
                ? 'bg-white text-[#3ab4e6] shadow-lg scale-105'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
            title={item.label}
          >
            <span className="text-xl">{item.icon}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors mt-auto mb-4"
        title="Đăng xuất"
      >
        <FaPowerOff size={20} />
      </button>
    </div>
  );
};

export default AdminSidebar;