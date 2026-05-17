import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaLayerGroup, FaFileAlt, FaBriefcase, FaHeart, FaBell, FaCog,
  FaSignOutAlt, FaCheckCircle
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/auth/authSlice';
import axiosInstance from '../../utils/axiosInstance';
import { API_ORIGIN } from '../../config';
import { storage } from '../../utils/storage';

const CandidateSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);

  // ── State ──
  const [openToWork, setOpenToWork] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // ── Derived display values ──
  const displayName = useMemo(() => {
    if (currentUser?.fullName) return currentUser.fullName;
    if (currentUser?.name)     return currentUser.name;
    return currentUser?.email?.split('@')[0] || 'Ứng viên';
  }, [currentUser]);

  const avatarUrl = useMemo(() => {
    if (!currentUser?.avatar) return null;
    if (currentUser.avatar.startsWith('http')) return currentUser.avatar;
    return `${API_ORIGIN}${currentUser.avatar}`;
  }, [currentUser]);

  // ── Fetch initial Open-to-Work status ──
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = storage.getToken();
        if (!token) return;
        const res = await axiosInstance.get(
          '/candidate/profile'
        );
        setOpenToWork(res.data?.openToWork ?? false);
      } catch {
        /* silent */
      } finally {
        setProfileLoaded(true);
      }
    };
    fetchProfile();
  }, []);

  // ── Toggle handler ──
  const handleToggleOpenToWork = useCallback(async () => {
    if (isToggling || !profileLoaded) return;
    setIsToggling(true);
    const next = !openToWork;
    setOpenToWork(next);                       // optimistic
    try {
      const token = storage.getToken();
      await axiosInstance.put(
        '/candidate/profile/open-to-work',
        null,
        { params: { status: next } }
      );
    } catch {
      setOpenToWork(!next);                    // rollback
    } finally {
      setIsToggling(false);
    }
  }, [isToggling, profileLoaded, openToWork]);

  // ── Logout ──
  const handleLogout = () => {
    navigate('/');
    setTimeout(() => dispatch(logout()), 100);
  };

  // ── Menu items ──
  const menuItems = [
    { path: '/candidate/dashboard',    name: 'Tổng quan',          icon: <FaLayerGroup /> },
    { path: '/candidate/profile',      name: 'Hồ sơ của tôi',     icon: <FaFileAlt /> },
    { path: '/candidate/applied-jobs', name: 'Việc đã ứng tuyển',  icon: <FaBriefcase /> },
    { path: '/candidate/favorite-jobs',name: 'Việc đã lưu',        icon: <FaHeart /> },
    { path: '/candidate/job-alerts',   name: 'Thông báo việc làm', icon: <FaBell /> },
    { path: '/candidate/settings',     name: 'Cài đặt',           icon: <FaCog /> },
  ];

  // ══════════════════════════════════════════
  return (
    <div className="w-[17rem] bg-white min-h-screen border-r border-gray-100 hidden lg:block sticky top-20 h-[calc(100vh-80px)] overflow-y-auto no-scrollbar">

      {/* ═══ USER INFO CARD ═══ */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex flex-col items-center text-center">
          {/* Avatar với viền "Open to Work" */}
          <div className="relative mb-3">
            <div className={`w-[72px] h-[72px] rounded-full p-[3px] transition-all duration-500 ${
              openToWork 
                ? 'bg-gradient-to-br from-[#3AB4E6] via-[#2da3d3] to-[#1e8fbf] shadow-lg shadow-[#3AB4E6]/30' 
                : 'bg-gray-200'
            }`}>
              <div className="w-full h-full rounded-full bg-white p-[2px]">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-sky-50 flex items-center justify-center text-blue-400 text-2xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            {/* Badge xác thực */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
              <FaCheckCircle className="text-[#3AB4E6] text-sm" />
            </div>
          </div>

          {/* Tên + Subtitle */}
          <h3 className="text-sm font-bold text-gray-800 leading-tight">{displayName}</h3>
          <span className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3AB4E6]"></span>
            Tài khoản đã xác thực
          </span>
        </div>

        {/* ═══ TOGGLE OPEN TO WORK ═══ */}
        <div className="mt-4">
          <div className={`rounded-xl p-3 transition-all duration-500 ${
            openToWork 
              ? 'bg-[#3AB4E6]/5 border border-[#3AB4E6]/20' 
              : 'bg-gray-50 border border-gray-100'
          }`}>
            {/* Toggle Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  openToWork ? 'bg-[#3AB4E6] animate-pulse' : 'bg-gray-300'
                }`}></div>
                <span className={`text-xs font-semibold transition-colors duration-300 ${
                  openToWork ? 'text-[#2a8ab3]' : 'text-gray-500'
                }`}>
                  {openToWork ? 'Đang bật tìm việc' : 'Đang tắt tìm việc'}
                </span>
              </div>

              {/* Custom Toggle Switch */}
              <button
                id="open-to-work-toggle"
                role="switch"
                aria-checked={openToWork}
                aria-label="Bật tắt chế độ tìm việc"
                onClick={handleToggleOpenToWork}
                disabled={isToggling || !profileLoaded}
                className={`
                  otw-toggle relative inline-flex h-6 w-11 items-center rounded-full 
                  transition-all duration-300 ease-in-out
                  focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3AB4E6]
                  ${isToggling ? 'opacity-70 cursor-wait' : 'cursor-pointer'}
                  ${openToWork 
                    ? 'bg-gradient-to-r from-[#3AB4E6] to-[#2a8ab3] shadow-md shadow-[#3AB4E6]/30' 
                    : 'bg-gray-300'
                  }
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white shadow-sm
                    transition-all duration-300 ease-in-out
                    ${openToWork ? 'translate-x-[22px] scale-110' : 'translate-x-[3px]'}
                  `}
                />
              </button>
            </div>

            {/* Mô tả nhỏ */}
            <div className={`overflow-hidden transition-all duration-500 ${
              openToWork ? 'max-h-20 opacity-100 mt-2.5' : 'max-h-0 opacity-0 mt-0'
            }`}>
              <div className="flex items-start gap-2 text-[11px] text-[#2a8ab3]/80 leading-relaxed">
                <span className="shrink-0 mt-0.5">💼</span>
                <span>
                  Nhà tuyển dụng có thể <strong>tìm thấy</strong> và liên hệ bạn.
                  Hồ sơ sẽ được <strong>hiển thị nổi bật</strong> trên kết quả tìm kiếm.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ NAVIGATION MENU ═══ */}
      <div className="px-4 pb-6">
        <h3 className="text-[10px] font-bold text-gray-300 uppercase mb-3 tracking-widest px-3">
          Tổng quan ứng viên
        </h3>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isActive
                    ? 'bg-blue-50 text-[#3AB4E6] border-l-4 border-[#3AB4E6]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}

          {/* Nút Đăng xuất */}
          <li className="mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
            >
              <FaSignOutAlt className="text-base" />
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CandidateSidebar;
