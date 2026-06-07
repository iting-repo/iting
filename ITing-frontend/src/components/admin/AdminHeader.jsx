import React, { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, Menu, Search } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

const AdminHeader = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const user = currentUser ? currentUser : { name: "Quản trị viên cấp cao", email: "admin@iting.vn" };

  // Notifications
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount('ADMIN');
      setUnreadCount(data?.unreadCount || 0);
    } catch (e) {
      // ignore
    }
  };

  const fetchUnreadNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const list = await notificationService.getUnreadNotifications('ADMIN');
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
  }, []);

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
    if (opening) await fetchUnreadNotifications();
  };

  const handleOpenNotification = async (notif) => {
    if (!notif) return;
    try {
      if (!notif.isRead) {
        await notificationService.markAsRead(notif.id, 'ADMIN');
        setNotifications((prev) => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      if (notif.actionUrl) {
        if (notif.actionUrl.startsWith('/')) navigate(notif.actionUrl);
        else window.location.href = notif.actionUrl;
      }
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead('ADMIN');
      setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      // ignore
    }
  };

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      dispatch(logout());
    }, 100);
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-[#1A8FBF] flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 mr-1 text-white hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <span className="text-[#1A8FBF] font-bold text-sm">IT</span>
          </div>
          <span className="text-white font-bold text-lg font-display">Quản trị ITing</span>
        </div>
        <div className="relative ml-4 hidden md:block">
          <input
            className="peer w-56 h-9 rounded-full bg-white/15 text-white text-sm pl-10 pr-4 placeholder:text-white/70 outline-none transition-all focus:w-72 focus:bg-white focus:text-slate-700 focus:placeholder:text-slate-400"
            placeholder="Tìm kiếm user, company, job..."
          />
          <Search className="absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-white/70 transition-colors peer-focus:text-slate-400" strokeWidth={2} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative" ref={notifRef}>
          <button onClick={handleToggleNotifs} className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white">
            <Bell className="w-5 h-5" strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-semibold ring-2 ring-[#1A8FBF]">{unreadCount}</span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-96 bg-white text-gray-800 rounded-xl shadow-2xl py-2 border border-gray-100 animate-fade-in-up origin-top-right overflow-hidden z-50">
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <div className="text-sm font-semibold">Thông báo</div>
                <div className="flex items-center gap-2">
                  <button onClick={handleMarkAllRead} className="text-xs text-gray-500 hover:underline">Đánh dấu tất cả</button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
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
                <button
                  onClick={() => {
                    // Truyền state.ts để useLocation re-trigger refetch khi
                    // user đã ở /admin/notifications (navigate cùng path
                    // không tự re-render — phải đổi location.key).
                    navigate('/admin/notifications', { state: { ts: Date.now() } });
                    setIsNotifOpen(false);
                  }}
                  className="text-sm text-[#3AB4E6] hover:underline"
                >
                  Xem tất cả
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 pl-2 ml-1 border-l border-white/20">
          <button
            onClick={() => navigate('/admin/profile')}
            className="flex items-center gap-2.5 hover:bg-white/10 rounded-full px-2 py-1 transition-colors"
            title="Xem hồ sơ của tôi"
          >
            <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/40">
              {user.name ? user.name.charAt(0).toUpperCase() : 'SA'}
            </div>
            <div className="text-left hidden sm:block leading-tight">
              <p className="text-white text-sm font-semibold">{user.name || "Quản trị viên cấp cao"}</p>
              <p className="text-white/70 text-[11px]">{user.email || "admin@iting.vn"}</p>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center text-white/80 hover:text-white hover:bg-white/15 rounded-full transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
