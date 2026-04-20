import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/auth/authSlice';
// Import Icons
import { BsBriefcaseFill, BsBell, BsEnvelope } from 'react-icons/bs';
import {
  FaChevronDown, FaSignOutAlt, FaUserAlt, FaBuilding,
  FaLayerGroup, FaFileAlt, FaHistory, FaHeart, FaCog
} from 'react-icons/fa';
import notificationService from '../services/notificationService';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { currentUser } = useSelector((state) => state.auth);
  const role = currentUser ? currentUser.role : 'guest';
  const user = currentUser ? currentUser : null;
  const displayName = user?.name || user?.fullName || user?.companyName || user?.email || 'Người dùng';
  const displayAvatar = user?.avatar || user?.avatarUrl || user?.logoUrl || '';
  const initial = displayName?.charAt(0)?.toUpperCase() || 'U';

  // Notifications
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      dispatch(logout());
    }, 100);
  }

  // State cho Dropdown User
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recipientTypeForRole = (role) => {
    if (!role) return 'USER';
    if (role === 'EMPLOYER') return 'COMPANY';
    if (role === 'ADMIN') return 'ADMIN';
    return 'USER';
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const recipientType = recipientTypeForRole(role);
      const data = await notificationService.getUnreadCount(recipientType);
      setUnreadCount(data?.unreadCount || 0);
    } catch (e) {
      // ignore
    }
  };

  const fetchUnreadNotifications = async () => {
    if (!user) return;
    setLoadingNotifs(true);
    try {
      const recipientType = recipientTypeForRole(role);
      const list = await notificationService.getUnreadNotifications(recipientType);
      setNotifications(list || []);
    } catch (e) {
      // ignore
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const iv = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(iv);
  }, [user, role]);

  const formatTime = (time) => {
    try {
      if (!time) return '';
      const d = typeof time === 'string' ? parseISO(time) : time;
      return formatDistanceToNowStrict(d, { addSuffix: true });
    } catch (e) {
      return '';
    }
  };

  const handleToggleNotifs = async () => {
    const opening = !isNotifOpen;
    setIsNotifOpen(opening);
    if (opening) {
      await fetchUnreadNotifications();
    }
  };

  const handleOpenNotification = async (notif) => {
    if (!notif) return;
    try {
      const recipientType = recipientTypeForRole(role);
      if (!notif.isRead) {
        await notificationService.markAsRead(notif.id, recipientType);
        setNotifications((prev) => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      if (notif.actionUrl) {
        if (notif.actionUrl.startsWith('/')) {
          navigate(notif.actionUrl);
        } else {
          window.location.href = notif.actionUrl;
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const recipientType = recipientTypeForRole(role);
      await notificationService.markAllAsRead(recipientType);
      setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      // ignore
    }
  };

  const renderNavLinks = () => {
    const linkClass = "text-gray-300 hover:text-white font-medium transition-colors duration-200 text-sm md:text-base";
    const activeClass = "text-white font-bold text-sm md:text-base";
    const isActive = (path) => location.pathname === path ? activeClass : linkClass;

    switch (role) {
      case 'CANDIDATE':
        return (
          <>
            <Link to="/" className={isActive('/')}>Trang chủ</Link>
            <Link to="/jobs" className={isActive('/jobs')}>Công việc</Link>
            <Link to="/companies" className={isActive('/companies')}>Công ty</Link>
            <Link to="/about" className={isActive('/about')}>Về chúng tôi</Link>
            <Link to="/contact" className={isActive('/contact')}>Liên hệ</Link>
          </>
        );
      case 'EMPLOYER':
        return (
          <>
            <Link to="/employer/dashboard" className={isActive('/employer/dashboard')}>Tổng quan</Link>
            <Link to="/employer/manage-jobs" className={isActive('/employer/manage-jobs')}>Tin đã đăng</Link>
            <Link to="/employer/find-cv" className={isActive('/employer/find-cv')}>Tìm hồ sơ</Link>
            <Link to="/employer/post-job" className="text-[#3AB4E6] hover:text-blue-300 font-bold transition-colors">
              + Đăng tin mới
            </Link>
          </>
        );
      default: // Guest
        return (
          <>
            <Link to="/" className={isActive('/')}>Trang chủ</Link>
            <Link to="/jobs" className={isActive('/jobs')}>Công việc</Link>
            <Link to="/companies" className={isActive('/companies')}>Công ty</Link>
            <Link to="/about" className={isActive('/about')}>Về chúng tôi</Link>
            <Link to="/contact" className={isActive('/contact')}>Liên hệ</Link>
          </>
        );
    }
  };

  const renderDropdownMenu = () => {
    if (role === 'CANDIDATE') {
      return (
        <div className="py-2">
          <Link to="/candidate/dashboard" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
            <FaLayerGroup className="text-gray-400" /> Tổng quan
          </Link>
          <Link to="/candidate/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
            <FaFileAlt className="text-gray-400" /> Hồ sơ của tôi
          </Link>
          <Link to="/candidate/applied-jobs" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
            <FaHistory className="text-gray-400" /> Việc đã ứng tuyển
          </Link>
          <Link to="/candidate/favorite-jobs" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
            <FaHeart className="text-gray-400" /> Việc đã lưu
          </Link>
          <Link to="/candidate/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
            <FaCog className="text-gray-400" /> Cài đặt tài khoản
          </Link>
        </div>
      );
    }

    if (role === 'EMPLOYER') {
      return (
        <div className="py-2">
          <Link to="/employer/dashboard" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
            <FaLayerGroup className="text-gray-400" /> Vào trang quản lí
          </Link>
          <Link to="/employer/company-profile" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
            <FaBuilding className="text-gray-400" /> Hồ sơ công ty
          </Link>
          <Link to="/employer/account-settings" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
            <FaCog className="text-gray-400" /> Cài đặt tài khoản
          </Link>
        </div>
      );
    }
  };

  return (
    <header className="bg-black text-white h-20 sticky top-0 z-40 shadow-md">
      <div className="container mx-auto px-12 h-full flex items-center justify-between">
        <Link to={role === 'EMPLOYER' ? '/employer/dashboard' : '/'} className="flex items-center gap-2 select-none group">
          <img 
            src="/assets/logo.png" 
            alt="ITing Logo" 
            className="h-14 w-auto object-contain transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(58,180,230,0.6)]" 
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {renderNavLinks()}
        </nav>

        <div className="flex items-center gap-4">
          {role === 'guest' ? (
            <>
              <Link to="/login" className="hidden md:block text-white font-medium hover:text-gray-300 transition-colors">
                Đăng nhập
              </Link>
              <Link to="/register" className="bg-[#3AB4E6] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20 text-sm">
                Đăng Ký
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mr-2">
                <button className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors relative">
                  <BsEnvelope className="text-lg" />
                </button>

                <div className="relative" ref={notifRef}>
                  <button onClick={handleToggleNotifs} className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors relative">
                    <BsBell className="text-lg" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-semibold">{unreadCount}</span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 mt-3 w-96 bg-white text-gray-800 rounded-xl shadow-2xl py-2 border border-gray-100 animate-fade-in origin-top-right overflow-hidden z-50">
                      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                        <div className="text-sm font-semibold">Thông báo</div>
                        <div className="flex items-center gap-2">
                          <button onClick={handleMarkAllRead} className="text-xs text-gray-500 hover:underline">Đánh dấu tất cả</button>
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto no-scrollbar">
                        {loadingNotifs && <div className="p-4 text-sm text-gray-500">Đang tải...</div>}
                        {!loadingNotifs && notifications.length === 0 && (
                          <div className="p-4 text-sm text-gray-500">Không có thông báo mới</div>
                        )}
                        {!loadingNotifs && notifications.map((n) => (
                          <button key={n.id} onClick={() => handleOpenNotification(n)} className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3 ${n.isRead ? '' : 'bg-gray-50'}`}>
                            <div className="flex-1">
                              <div className="text-sm text-gray-800 break-words">{n.content}</div>
                              <div className="text-xs text-gray-500 mt-1">{formatTime(n.time)}</div>
                            </div>
                            {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full self-start mt-2"></div>}
                          </button>
                        ))}
                      </div>
                      <div className="border-t px-3 py-2 text-center">
                        <Link to="/notifications" className="text-sm text-[#3AB4E6] hover:underline">Xem tất cả</Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:bg-gray-900 py-1 px-2 rounded-lg transition-colors border border-transparent focus:border-gray-700"
                >
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-gray-600" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-sky-500 flex items-center justify-center text-sm font-bold text-white shadow-inner">
                      {initial}
                    </div>
                  )}
                  <FaChevronDown className={`text-xs text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white text-gray-800 rounded-xl shadow-2xl py-2 border border-gray-100 animate-fade-in origin-top-right overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                      <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {role === 'CANDIDATE' ? 'Ứng viên' : 'Nhà tuyển dụng'}
                      </p>
                    </div>

                    {renderDropdownMenu()}

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
                      >
                        <FaSignOutAlt /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
