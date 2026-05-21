import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/auth/authSlice';
import messageService from '../services/messageService';
import chatRealtimeService from '../services/chatRealtimeService';
import { formatChatTime, sortConversationsForInbox } from '../utils/chatFormat';
import ChatDockBox from '../components/chat/ChatDockBox';
import notificationService from '../services/notificationService';
import axiosInstance from '../utils/axiosInstance';
import { storage } from '../utils/storage';
import { CompanyLogo } from '../components/common';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { BsBell, BsEnvelope } from 'react-icons/bs';
import { FaChevronDown, FaSignOutAlt, FaBuilding, FaLayerGroup, FaFileAlt, FaHistory, FaHeart, FaCog } from 'react-icons/fa';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.auth);
  const role = currentUser ? currentUser.role : 'guest';
  const user = currentUser ? currentUser : null;
  const displayName = user?.name || user?.fullName || user?.companyName || user?.email || 'Người dùng';
  const displayAvatar = user?.avatar || user?.avatarUrl || user?.logoUrl || user?.companyLogo || '';
  const initial = displayName?.charAt(0)?.toUpperCase() || 'U';

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' ? 'text-[#3AB4E6] font-bold' : 'text-white hover:text-gray-300 transition-colors';
    return location.pathname.startsWith(path) ? 'text-[#3AB4E6] font-bold' : 'text-white hover:text-gray-300 transition-colors';
  };

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isQuickChatMinimized, setIsQuickChatMinimized] = useState(false);
  const [recentConversations, setRecentConversations] = useState([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [activeQuickConversation, setActiveQuickConversation] = useState(null);
  const messageDropdownRef = useRef(null);

  // ── Open to Work toggle (Candidate only) ──
  const [openToWork, setOpenToWork] = useState(false);
  const [isTogglingOTW, setIsTogglingOTW] = useState(false);

  useEffect(() => {
    if (role !== 'CANDIDATE') return;
    const fetchOTW = async () => {
      try {
        const res = await axiosInstance.get('/candidate/profile');
        setOpenToWork(res?.openToWork ?? false);
      } catch { /* silent */ }
    };
    fetchOTW();
  }, [role]);

  const handleToggleOTW = useCallback(async () => {
    if (isTogglingOTW) return;
    setIsTogglingOTW(true);
    const next = !openToWork;
    setOpenToWork(next);
    try {
      await axiosInstance.put('/candidate/profile/open-to-work', null, { params: { status: next } });
    } catch {
      setOpenToWork(!next);
    } finally {
      setIsTogglingOTW(false);
    }
  }, [isTogglingOTW, openToWork]);

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => dispatch(logout()), 100);
  };

  const updateRecentOnIncomingMessage = (msg) => {
    if (!msg?.conversationId) return;
    setRecentConversations((prev) => {
      const found = prev.find((item) => item.id === msg.conversationId);
      if (!found) return prev;

      const myActorId = role === 'EMPLOYER'
        ? (currentUser?.companyId || currentUser?.userId)
        : currentUser?.userId;
      const shouldIncreaseUnread = msg.senderId !== myActorId;

      const updated = prev.map((item) => {
        if (item.id !== msg.conversationId) return item;
        return {
          ...item,
          lastMessageContent: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: shouldIncreaseUnread ? (item.unreadCount || 0) + 1 : item.unreadCount,
        };
      });
      return sortConversationsForInbox(updated);
    });

    const myActorId = role === 'EMPLOYER'
      ? (currentUser?.companyId || currentUser?.userId)
      : currentUser?.userId;
    if (msg.senderId !== myActorId) setUnreadMessageCount((prev) => prev + 1);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (messageDropdownRef.current && !messageDropdownRef.current.contains(event.target)) {
        setIsMessagesOpen(false);
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

  useEffect(() => {
    if (role === 'guest') {
      chatRealtimeService.disconnect();
      setRecentConversations([]);
      setUnreadMessageCount(0);
      return;
    }

    let cancelled = false;
    const loadMessages = async () => {
      try {
        const [conversationData, unreadData] = await Promise.all([
          messageService.getConversations({ page: 0, size: 12 }),
          messageService.getUnreadCount(),
        ]);
        if (cancelled) return;
        setRecentConversations(sortConversationsForInbox(conversationData?.conversations || []));
        setUnreadMessageCount(unreadData?.unreadCount || 0);
      } catch {
        if (!cancelled) {
          setRecentConversations([]);
          setUnreadMessageCount(0);
        }
      }
    };

    loadMessages();
    const intervalId = setInterval(loadMessages, 15000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [role, currentUser?.userId, currentUser?.companyId]);

  useEffect(() => {
    if (role === 'guest') return;
    const token = localStorage.getItem('access_token');
    chatRealtimeService.connect(token);
    chatRealtimeService.subscribe('/topic/messages', 'header-topic-messages', (msg) => updateRecentOnIncomingMessage(msg));
    return () => chatRealtimeService.unsubscribe('header-topic-messages');
  }, [role, currentUser?.userId, currentUser?.companyId]);

  const recipientTypeForRole = (r) => {
    if (!r) return 'USER';
    if (r === 'EMPLOYER') return 'COMPANY';
    if (r === 'ADMIN') return 'ADMIN';
    return 'USER';
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const recipientType = recipientTypeForRole(role);
      const data = await notificationService.getUnreadCount(recipientType);
      setUnreadCount(data?.unreadCount || 0);
    } catch {
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
    } catch {
      // ignore
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const iv = setInterval(fetchUnreadCount, 30000);
    // Listen for manual refresh events (e.g. after applying to a job)
    const handleRefresh = () => fetchUnreadCount();
    window.addEventListener('notification-refresh', handleRefresh);
    return () => {
      clearInterval(iv);
      window.removeEventListener('notification-refresh', handleRefresh);
    };
  }, [role, user?.userId]);

  const formatTime = (time) => {
    try {
      if (!time) return '';
      const d = typeof time === 'string' ? parseISO(time) : time;
      return formatDistanceToNowStrict(d, { addSuffix: true, locale: vi });
    } catch {
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
      const recipientType = recipientTypeForRole(role);
      if (!notif.isRead) {
        await notificationService.markAsRead(notif.id, recipientType);
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      if (notif.actionUrl) {
        if (notif.actionUrl.startsWith('/')) navigate(notif.actionUrl);
        else window.location.href = notif.actionUrl;
      }
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const recipientType = recipientTypeForRole(role);
      await notificationService.markAllAsRead(recipientType);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (role === 'guest') {
      chatRealtimeService.disconnect();
      setRecentConversations([]);
      setUnreadMessageCount(0);
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      try {
        const [conversationData, unreadData] = await Promise.all([
          messageService.getConversations({ page: 0, size: 12 }),
          messageService.getUnreadCount(),
        ]);

        if (cancelled) return;
        const sorted = sortConversationsForInbox(conversationData?.conversations || []);
        setRecentConversations(sorted);
        setUnreadMessageCount(unreadData?.unreadCount || 0);
      } catch {
        if (!cancelled) {
          setRecentConversations([]);
          setUnreadMessageCount(0);
        }
      }
    };

    loadMessages();
    const intervalId = setInterval(loadMessages, 15000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [role, user]);

  useEffect(() => {
    if (role === 'guest') return;
    const token = localStorage.getItem('access_token');
    chatRealtimeService.connect(token);

    chatRealtimeService.subscribe('/topic/messages', 'header-topic-messages', (msg) => {
      updateRecentOnIncomingMessage(msg);
    });

    const recipientType = recipientTypeForRole(role).toLowerCase();
    const recipientId = role === 'EMPLOYER' ? (currentUser?.companyId || currentUser?.userId) : currentUser?.userId;

    if (recipientId) {
      const notifTopic = `/topic/${recipientType}/${recipientId}/notifications`;
      const notifCountTopic = `/topic/${recipientType}/${recipientId}/notifications/unread-count`;

      chatRealtimeService.subscribe(notifTopic, 'header-topic-notifs', (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        toast.info(notif.content, {
          action: {
            label: 'Xem',
            onClick: () => handleOpenNotification(notif)
          }
        });
      });

      chatRealtimeService.subscribe(notifCountTopic, 'header-topic-notif-count', (data) => {
        setUnreadCount(data.unreadCount || 0);
      });
    }

    return () => {
      chatRealtimeService.unsubscribe('header-topic-messages');
      chatRealtimeService.unsubscribe('header-topic-notifs');
      chatRealtimeService.unsubscribe('header-topic-notif-count');
    };
  }, [role, currentUser?.userId, currentUser?.companyId]);

  const topConversations = sortConversationsForInbox(recentConversations).slice(0, 4);

  const handleOpenQuickChat = async (conversation) => {
    setActiveQuickConversation(conversation);
    setIsQuickChatMinimized(false);
    setIsMessagesOpen(false);
    try {
      await messageService.markConversationAsRead(conversation.id);
      setRecentConversations((prev) => prev.map((item) => item.id === conversation.id ? { ...item, unreadCount: 0 } : item));
      setUnreadMessageCount((prev) => Math.max(0, prev - (conversation.unreadCount || 0)));
    } catch {
      // ignore
    }
  };

  const handleQuickMessageSent = (message) => {
    setRecentConversations((prev) => sortConversationsForInbox(prev.map((item) => item.id === message.conversationId
      ? { ...item, lastMessageContent: message.content, lastMessageTime: message.createdAt }
      : item)));
  };

  const renderNavLinks = () => {
    if (role === 'CANDIDATE') {
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
    if (role === 'EMPLOYER') {
      return (
        <>
          <Link to="/employer/dashboard" className={isActive('/employer/dashboard')}>Tổng quan</Link>
          <Link to="/employer/manage-jobs" className={isActive('/employer/manage-jobs')}>Tin đã đăng</Link>
          <Link to="/employer/find-cv" className={isActive('/employer/find-cv')}>Tìm hồ sơ</Link>
          <Link to="/employer/post-job" className="text-[#3AB4E6] hover:text-blue-300 font-bold transition-colors">+ Đăng tin mới</Link>
        </>
      );
    }
    return (
      <>
        <Link to="/" className={isActive('/')}>Trang chủ</Link>
        <Link to="/jobs" className={isActive('/jobs')}>Công việc</Link>
        <Link to="/companies" className={isActive('/companies')}>Công ty</Link>
        <Link to="/about" className={isActive('/about')}>Về chúng tôi</Link>
        <Link to="/contact" className={isActive('/contact')}>Liên hệ</Link>
      </>
    );
  };

  const renderDropdownMenu = () => {
    if (role === 'CANDIDATE') {
      return (
        <div className="py-2">
          <Link to="/candidate/dashboard" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"><FaLayerGroup className="text-gray-400" /> Tổng quan</Link>
          <Link to="/candidate/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"><FaFileAlt className="text-gray-400" /> Hồ sơ của tôi</Link>
          <Link to="/candidate/applied-jobs" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"><FaHistory className="text-gray-400" /> Việc đã ứng tuyển</Link>
          <Link to="/candidate/favorite-jobs" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"><FaHeart className="text-gray-400" /> Việc đã lưu</Link>
          <Link to="/candidate/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"><FaCog className="text-gray-400" /> Cài đặt tài khoản</Link>
        </div>
      );
    }
    if (role === 'EMPLOYER') {
      return (
        <div className="py-2">
          <Link to="/employer/dashboard" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"><FaLayerGroup className="text-gray-400" /> Vào trang quản lý</Link>
          <Link to="/employer/company-profile" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"><FaBuilding className="text-gray-400" /> Hồ sơ công ty</Link>
          <Link to="/employer/account-settings" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"><FaCog className="text-gray-400" /> Cài đặt tài khoản</Link>
        </div>
      );
    }
    return null;
  };

  return (
    <>
    <header className="bg-black text-white h-20 sticky top-0 z-40 shadow-md">
      <div className="container mx-auto px-12 h-full flex items-center justify-between">
        <Link to={role === 'EMPLOYER' ? '/employer/dashboard' : '/'} className="flex items-center gap-2 select-none group">
          <img 
            src="/logo-iting.png" 
            alt="ITing Logo" 
            className="h-14 w-auto object-contain transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(58,180,230,0.6)]" 
          />
        </Link>

          <nav className="hidden md:flex items-center gap-8">{renderNavLinks()}</nav>

        <div className="flex items-center gap-4">
          {role === 'guest' ? (
            <>
              <Link to="/login" className="hidden md:block text-white font-medium hover:text-gray-300 transition-colors">
                Đăng nhập
              </Link>
              <Link to="/register" className="bg-[#3AB4E6] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20 text-sm">
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mr-2">
                {/* Messages Dropdown */}
                <div className="relative flex items-center" ref={messageDropdownRef}>
                  <button
                    onClick={() => setIsMessagesOpen((prev) => !prev)}
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors relative"
                  >
                    <BsEnvelope className="text-lg" />
                    {unreadMessageCount > 0 ? (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                      </span>
                    ) : null}
                  </button>
                  {isMessagesOpen && (
                    <div className="absolute top-14 right-0 w-[360px] max-w-[calc(100vw-16px)] bg-white text-gray-800 rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-[120]">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-bold text-gray-900">Tin nhắn gần đây</p>
                        <p className="text-xs text-gray-500 mt-0.5">Ưu tiên cuộc trò chuyện chưa đọc</p>
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {topConversations.length === 0 ? (
                          <p className="text-sm text-gray-500 p-4">Chưa có cuộc trò chuyện.</p>
                        ) : (
                          topConversations.map((conv) => (
                            <button
                              key={conv.id}
                              onClick={() => handleOpenQuickChat(conv)}
                              className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-gray-100 p-0.5">
                                  <CompanyLogo 
                                    logoUrl={conv.otherParticipantAvatar} 
                                    companyId={conv.otherParticipantId}
                                    companyName={conv.otherParticipantName}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex justify-between items-start gap-2">
                                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                      {conv.otherParticipantName || 'Không xác định'}
                                    </p>
                                    <span className="text-[11px] text-gray-400">{formatChatTime(conv.lastMessageTime)}</span>
                                  </div>
                                  <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>
                                    {conv.lastMessageContent || 'Chưa có tin nhắn'}
                                  </p>
                                </div>
                                {conv.unreadCount > 0 ? (
                                  <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {conv.unreadCount}
                                  </span>
                                ) : null}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                        <button
                          onClick={() => {
                            setIsMessagesOpen(false);
                            navigate('/messages');
                          }}
                          className="w-full h-10 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-black transition-colors"
                        >
                          Hiển thị toàn bộ cuộc trò chuyện
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button onClick={handleToggleNotifs} className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors relative">
                    <BsBell className="text-lg" />
                    {unreadCount > 0 ? <span className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-semibold">{unreadCount}</span> : null}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 mt-3 w-96 bg-white text-gray-800 rounded-xl shadow-2xl py-2 border border-gray-100 animate-fade-in origin-top-right overflow-hidden z-50">
                      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                        <div className="text-sm font-semibold">Thông báo</div>
                        <button onClick={handleMarkAllRead} className="text-xs text-gray-500 hover:underline">Đánh dấu tất cả</button>
                      </div>
                      <div className="max-h-80 overflow-y-auto no-scrollbar">
                        {loadingNotifs && <div className="p-4 text-sm text-gray-500">Đang tải...</div>}
                        {!loadingNotifs && notifications.length === 0 && <div className="p-4 text-sm text-gray-500">Không có thông báo mới</div>}
                        {!loadingNotifs && notifications.map((n) => (
                          <button key={n.id} onClick={() => handleOpenNotification(n)} className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3 ${n.isRead ? '' : 'bg-gray-50'}`}>
                            <div className="flex-1">
                              <div className="text-sm text-gray-800 break-words">{n.content}</div>
                              <div className="text-xs text-gray-500 mt-1">{formatTime(n.time)}</div>
                            </div>
                            {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full self-start mt-2" />}
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
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-600 p-0.5 bg-gray-800">
                    <CompanyLogo 
                      logoUrl={displayAvatar} 
                      companyId={role === 'EMPLOYER' ? (currentUser?.companyId || currentUser?.userId) : currentUser?.userId}
                      companyName={displayName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <FaChevronDown className={`text-xs text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white text-gray-800 rounded-xl shadow-2xl py-2 border border-gray-100 animate-fade-in origin-top-right overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{role === 'CANDIDATE' ? 'Ứng viên' : 'Nhà tuyển dụng'}</p>
                        {role === 'CANDIDATE' && (
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-[11px] font-semibold ${openToWork ? 'text-[#3AB4E6]' : 'text-gray-400'}`}>
                              {openToWork ? '🟢 Đang tìm việc' : '⚪ Tắt tìm việc'}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleOTW(); }}
                              disabled={isTogglingOTW}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 ${isTogglingOTW ? 'opacity-60 cursor-wait' : 'cursor-pointer'} ${openToWork ? 'bg-[#3AB4E6]' : 'bg-gray-300'}`}
                            >
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${openToWork ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                            </button>
                          </div>
                        )}
                      </div>
                      {renderDropdownMenu()}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors">
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

      {activeQuickConversation && !isQuickChatMinimized ? (
        <ChatDockBox
          conversation={activeQuickConversation}
          currentUser={currentUser}
          onClose={() => setActiveQuickConversation(null)}
          onMinimize={() => setIsQuickChatMinimized(true)}
          onSent={handleQuickMessageSent}
        />
      ) : null}

    {activeQuickConversation && isQuickChatMinimized ? (
      <button
        onClick={() => setIsQuickChatMinimized(false)}
        className="fixed bottom-4 right-4 z-[130] h-12 px-4 rounded-xl bg-slate-900 text-white shadow-xl"
      >
        Mở chat: {activeQuickConversation.otherParticipantName || 'Tin nhắn'}
      </button>
    ) : null}
    </>
  );
};

export default Header;
