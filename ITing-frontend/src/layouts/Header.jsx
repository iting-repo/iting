import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/auth/authSlice';
import messageService from '../services/messageService';
import chatRealtimeService from '../services/chatRealtimeService';
import { formatChatTime, sortConversationsForInbox } from '../utils/chatFormat';
import ChatDockBox from '../components/chat/ChatDockBox';
// Import Icons
import { BsBriefcaseFill, BsBell, BsEnvelope } from 'react-icons/bs';
import {
  FaChevronDown, FaSignOutAlt, FaUserAlt, FaBuilding,
  FaLayerGroup, FaFileAlt, FaHistory, FaHeart, FaCog
} from 'react-icons/fa';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { currentUser } = useSelector((state) => state.auth);
  const role = currentUser ? currentUser.role : 'guest';
  const user = currentUser ? currentUser : null;
  const displayName = user?.name || user?.fullName || user?.companyName || user?.email || 'User';
  const displayAvatar = user?.avatar || user?.avatarUrl || user?.logoUrl || '';
  const initial = displayName?.charAt(0)?.toUpperCase() || 'U';

  const handleLogout = () => {
    // 1. Navigate về trang chủ trước (để thoát khỏi PrivateRoute)
    navigate('/');

    // 2. Sau đó mới clear state/token (dùng setTimeout để đảm bảo đã nhảy trang xong hoặc queue sự kiện)
    setTimeout(() => {
      dispatch(logout());
    }, 100);
  }

  // State cho Dropdown User
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isQuickChatMinimized, setIsQuickChatMinimized] = useState(false);
  const [recentConversations, setRecentConversations] = useState([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [activeQuickConversation, setActiveQuickConversation] = useState(null);
  const messageDropdownRef = useRef(null);

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
    if (msg.senderId !== myActorId) {
      setUnreadMessageCount((prev) => prev + 1);
    }
  };

  // Đóng dropdown khi click ra ngoài
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
  }, [role]);

  useEffect(() => {
    if (role === 'guest') return;
    const token = localStorage.getItem('access_token');
    chatRealtimeService.connect(token);

    chatRealtimeService.subscribe('/topic/messages', 'header-topic-messages', (msg) => {
      updateRecentOnIncomingMessage(msg);
    });

    return () => {
      chatRealtimeService.unsubscribe('header-topic-messages');
    };
  }, [role, currentUser?.userId, currentUser?.companyId]);

  const topConversations = sortConversationsForInbox(recentConversations).slice(0, 4);

  const handleOpenQuickChat = async (conversation) => {
    setActiveQuickConversation(conversation);
    setIsQuickChatMinimized(false);
    setIsMessagesOpen(false);

    try {
      await messageService.markConversationAsRead(conversation.id);
      setRecentConversations((prev) =>
        prev.map((item) => (item.id === conversation.id ? { ...item, unreadCount: 0 } : item))
      );
      setUnreadMessageCount((prev) => Math.max(0, prev - (conversation.unreadCount || 0)));
    } catch {
      // ignore read errors for quick open
    }
  };

  const handleQuickMessageSent = (message) => {
    setRecentConversations((prev) => {
      const updated = prev.map((item) =>
        item.id === message.conversationId
          ? { ...item, lastMessageContent: message.content, lastMessageTime: message.createdAt }
          : item
      );
      return sortConversationsForInbox(updated);
    });
  };


  // --- HÀM RENDER MENU GIỮA (NAVIGATION) ---
  const renderNavLinks = () => {
    const linkClass = "text-gray-300 hover:text-white font-medium transition-colors duration-200 text-sm md:text-base";
    const activeClass = "text-white font-bold text-sm md:text-base";
    const isActive = (path) => location.pathname === path ? activeClass : linkClass;

    switch (role) {
      case 'CANDIDATE':
        // Candidate: Menu chính vẫn là tìm việc
        return (
          <>
            <Link to="/" className={isActive('/')}>Trang chủ</Link>
            <Link to="/jobs" className={isActive('/jobs')}>Công việc</Link>
            <Link to="/about" className={isActive('/about')}>Về chúng tôi</Link>
            <Link to="/contact" className={isActive('/contact')}>Liên hệ</Link>
          </>
        );
      case 'EMPLOYER':
        // Employer: Menu chính là các công cụ quản lý
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
            <Link to="/about" className={isActive('/about')}>Về chúng tôi</Link>
            <Link to="/contact" className={isActive('/contact')}>Liên hệ</Link>
          </>
        );
    }
  };

  // --- HÀM RENDER DROPDOWN CONTENT (MENU CON KHI BẤM AVATAR) ---
  // Đây là phần quan trọng để điều hướng vào Dashboard
  const renderDropdownMenu = () => {
    if (role === 'CANDIDATE') {
      return (
        <div className="py-2">
          <Link to="/candidate/dashboard" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
            <FaLayerGroup className="text-gray-400" /> Tổng quan (Dashboard)
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
    <>
    <header className="bg-black text-white h-20 sticky top-0 z-40 shadow-md">
      <div className="container mx-auto px-12 h-full flex items-center justify-between">

        {/* LOGO */}
        <Link to={role === 'EMPLOYER' ? '/employer/dashboard' : '/'} className="flex items-center gap-2 select-none group">
          <BsBriefcaseFill className="text-white text-2xl group-hover:text-[#3AB4E6] transition-colors" />
          <span className="text-2xl font-bold tracking-tight group-hover:text-[#3AB4E6] transition-colors">ITing</span>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden md:flex items-center gap-8">
          {renderNavLinks()}
        </nav>

        {/* ACTIONS */}
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
              {/* Icons */}
                <div className="relative flex items-center gap-3 mr-2" ref={messageDropdownRef}>
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
                   <div className="absolute top-14 right-14 w-[360px] max-w-[calc(100vw-16px)] bg-white text-gray-800 rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-[120]">
                     <div className="px-4 py-3 border-b border-gray-100">
                       <p className="font-bold text-gray-900">Tin nhan gan day</p>
                       <p className="text-xs text-gray-500 mt-0.5">Uu tien cuoc tro chuyen chua doc</p>
                     </div>
                     <div className="max-h-80 overflow-y-auto">
                       {topConversations.length === 0 ? (
                         <p className="text-sm text-gray-500 p-4">Chua co cuoc tro chuyen.</p>
                       ) : (
                         topConversations.map((conv) => (
                           <button
                             key={conv.id}
                             onClick={() => handleOpenQuickChat(conv)}
                             className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50"
                           >
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                 {conv.otherParticipantAvatar ? (
                                   <img src={conv.otherParticipantAvatar} alt={conv.otherParticipantName} className="w-full h-full object-cover" />
                                 ) : null}
                               </div>
                               <div className="min-w-0 flex-1">
                                 <div className="flex justify-between items-start gap-2">
                                   <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                     {conv.otherParticipantName || 'Unknown'}
                                   </p>
                                   <span className="text-[11px] text-gray-400">{formatChatTime(conv.lastMessageTime)}</span>
                                 </div>
                                 <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>
                                   {conv.lastMessageContent || 'Chua co tin nhan'}
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
                         Hien thi toan bo cuoc tro chuyen
                       </button>
                     </div>
                   </div>
                 )}
                 <button className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors relative">
                   <BsBell className="text-lg" />
                   <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#3AB4E6] rounded-full animate-pulse"></span>
                 </button>
               </div>

              {/* Avatar Dropdown */}
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

                {/* Dropdown Menu Content */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white text-gray-800 rounded-xl shadow-2xl py-2 border border-gray-100 animate-fade-in-up origin-top-right overflow-hidden">

                    {/* Header của dropdown */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                      <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {role === 'CANDIDATE' ? 'Ứng viên' : 'Nhà tuyển dụng'}
                      </p>
                    </div>

                    {/* MENU ITEMS (Đã tách ra hàm riêng renderDropdownMenu) */}
                    {renderDropdownMenu()}

                    {/* Logout Button */}
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
        Mo chat: {activeQuickConversation.otherParticipantName || 'Tin nhan'}
      </button>
    ) : null}
    </>
  );
};

export default Header;
