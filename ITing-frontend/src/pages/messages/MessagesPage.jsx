import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaPaperPlane, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import { CompanyLogo } from '../../components/common';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import messageService from '../../services/messageService';
import applicationService from '../../services/applicationService';
import chatRealtimeService from '../../services/chatRealtimeService';
import { formatChatTime, sortConversationsForInbox } from '../../utils/chatFormat';

const MessagesPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [query, setQuery] = useState('');
  const [appliedCompanies, setAppliedCompanies] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [me, setMe] = useState(null);
  const messagesRef = useRef(null);
  const typingStopTimeoutRef = useRef(null);
  const [targetUser, setTargetUser] = useState(null); // For when we initiate from userId param

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user_info');
      if (raw) setMe(JSON.parse(raw));
    } catch {
      setMe(null);
    }
  }, []);

  useEffect(() => {
    if (!me || (me.role !== 'CANDIDATE' && me.role !== 'USER')) return;

    const loadApplied = async () => {
      try {
        const res = await applicationService.getMyApplications({ page: 0, size: 50 });
        const apps = res?.content || res?.data?.content || [];
        const unique = [];
        const seen = new Set();
        apps.forEach(app => {
          if (app.companyId && !seen.has(app.companyId)) {
            seen.add(app.companyId);
            unique.push({
              id: app.companyId,
              name: app.companyName,
              avatar: app.companyLogo,
              jobTitle: app.jobTitle
            });
          }
        });
        setAppliedCompanies(unique);
      } catch (err) {
        console.error("Failed to load applied companies", err);
      }
    };
    loadApplied();
  }, [me]);

  useEffect(() => {
    const forcedConversationId = Number(searchParams.get('conversationId') || 0);
    const forcedUserId = Number(searchParams.get('userId') || 0);

    const loadConversations = async () => {
      setLoading(true);
      try {
        const res = await messageService.getConversations({ page: 0, size: 50 });
        const sorted = sortConversationsForInbox(res?.conversations || []);
        setConversations(sorted);

        if (forcedConversationId && sorted.some((item) => item.id === forcedConversationId)) {
          setActiveConversationId(forcedConversationId);
        } else if (forcedUserId) {
          // Check if we already have a conversation with this user
          const existing = sorted.find(c => c.otherParticipantId === forcedUserId);
          if (existing) {
            setActiveConversationId(existing.id);
          } else {
            // Need to create a placeholder or fetch user info
            // For now, let's just use a special ID or state
            setActiveConversationId(`new-${forcedUserId}`);
          }
        } else if (sorted.length > 0 && !activeConversationId) {
          setActiveConversationId(sorted[0].id);
        }
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [searchParams]);

  useEffect(() => {
    if (!activeConversationId) return;
    if (String(activeConversationId).startsWith('new-')) {
        setMessages([]);
        return;
    }

    const loadMessages = async () => {
      const data = await messageService.getAllConversationMessages(activeConversationId);
      setMessages(Array.isArray(data) ? data : []);
      await messageService.markConversationAsRead(activeConversationId);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversationId ? { ...c, unreadCount: 0 } : c))
      );
    };

    loadMessages();

    chatRealtimeService.subscribe(
      `/topic/conversation/${activeConversationId}`,
      `messages-page-conv-${activeConversationId}`,
      (incoming) => {
        if (!incoming?.id) return;

        setMessages((prev) => {
          // If we already have this exact message (from HTTP response), ignore
          if (prev.some((m) => m.id === incoming.id)) return prev;
          
          // If we have an optimistic message from this sender with the same content,
          // ignore the websocket echo and wait for HTTP replacement to avoid duplicates.
          const isOwnOptimistic = prev.some(m => 
            m._optimistic && 
            m.senderId === incoming.senderId && 
            m.content === incoming.content
          );
          if (isOwnOptimistic) return prev;

          return [...prev, incoming];
        });

        setConversations((prev) =>
          sortConversationsForInbox(
            prev.map((item) =>
              item.id === activeConversationId
                ? {
                    ...item,
                    lastMessageContent: incoming.content,
                    lastMessageTime: incoming.createdAt,
                    unreadCount: incoming.senderId === myActorId ? item.unreadCount : 0,
                  }
                : item
            )
          )
        );
      }
    );

    chatRealtimeService.subscribe(
      `/topic/conversation/${activeConversationId}/typing`,
      `messages-page-typing-${activeConversationId}`,
      (event) => {
        if (!event?.userId || event.userId === myActorId) return;
        setTypingUsers((prev) => ({ ...prev, [event.userId]: Boolean(event.typing) }));
      }
    );

    return () => {
      chatRealtimeService.unsubscribe(`messages-page-conv-${activeConversationId}`);
      chatRealtimeService.unsubscribe(`messages-page-typing-${activeConversationId}`);
    };
  }, [activeConversationId]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    chatRealtimeService.connect(token);

    chatRealtimeService.subscribe('/topic/presence', 'messages-page-presence', (event) => {
      if (!event?.userId) return;
      setOnlineUsers((prev) => ({ ...prev, [event.userId]: Boolean(event.online) }));
    });

    // Subscribe to notifications for this specific user/company to update the inbox sidebar globally
    if (me?.role === 'EMPLOYER' && me?.companyId) {
      chatRealtimeService.subscribe(`/topic/company/${me.companyId}/notifications`, 'messages-page-notifications', (event) => {
        if (event?.type === 'MESSAGE_NEW') {
           // Reload conversations to get the latest inbox state
           messageService.getConversations({ page: 0, size: 50 }).then(res => {
             setConversations(sortConversationsForInbox(res?.conversations || []));
           });
        }
      });
    } else if (me?.userId) {
      chatRealtimeService.subscribe(`/topic/user/${me.userId}/notifications`, 'messages-page-notifications', (event) => {
        if (event?.type === 'MESSAGE_NEW') {
           // Reload conversations to get the latest inbox state
           messageService.getConversations({ page: 0, size: 50 }).then(res => {
             setConversations(sortConversationsForInbox(res?.conversations || []));
           });
        }
      });
    }

    return () => {
      chatRealtimeService.unsubscribe('messages-page-presence');
      chatRealtimeService.unsubscribe('messages-page-notifications');
    };
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => (c.otherParticipantName || '').toLowerCase().includes(q));
  }, [conversations, query]);

  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    
    // Check if it's an existing conversation
    const existing = conversations.find((c) => c.id === activeConversationId);
    if (existing) return existing;
    
    // Check if it's a new conversation from query param
    if (String(activeConversationId).startsWith('new-')) {
      const userId = Number(activeConversationId.split('-')[1]);
      return {
        id: activeConversationId,
        otherParticipantId: userId,
        otherParticipantName: location.state?.userName || `Ứng viên #${userId}`,
        otherParticipantAvatar: location.state?.userAvatar || null,
        _isNew: true
      };
    }
    
    return null;
  }, [conversations, activeConversationId, location.state]);

  const pendingAppliedCompanies = useMemo(() => {
    return appliedCompanies.filter(comp =>
      !conversations.some(conv => conv.otherParticipantId === comp.id)
    );
  }, [appliedCompanies, conversations]);

  const myActorId = me?.role === 'EMPLOYER' ? (me?.companyId || me?.userId) : me?.userId;
  const senderType = me?.role === 'EMPLOYER' ? 'COMPANY' : 'USER';
  const receiverType = me?.role === 'EMPLOYER' ? 'USER' : 'COMPANY';

  const handleSend = async (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !activeConversationId || sending) return;

    const isNew = String(activeConversationId).startsWith('new-');
    const targetUserId = isNew ? Number(activeConversationId.split('-')[1]) : activeConversation.otherParticipantId;

    // Optimistic update — show message instantly
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const optimisticMsg = {
      id: tempId,
      conversationId: isNew ? null : activeConversation.id,
      senderId: myActorId,
      senderType,
      receiverId: targetUserId,
      receiverType,
      content,
      isRead: false,
      createdAt: now,
      _optimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setDraft('');
    
    if (!isNew) {
        setConversations((prev) =>
          sortConversationsForInbox(
            prev.map((c) =>
              c.id === activeConversation.id
                ? { ...c, lastMessageContent: content, lastMessageTime: now }
                : c
            )
          )
        );
        chatRealtimeService.send('/app/chat.typing', { conversationId: activeConversation.id, typing: false });
    }

    // Fire API in background
    setSending(true);
    try {
      const sent = await messageService.sendMessage({
        conversationId: isNew ? null : activeConversation.id,
        receiverId: targetUserId,
        receiverType,
        senderType,
        content,
      });
      
      if (isNew) {
          // If it was a new conversation, we now have a real ID
          setActiveConversationId(sent.conversationId);
          // Refresh conversation list to include the new one
          const res = await messageService.getConversations({ page: 0, size: 50 });
          setConversations(sortConversationsForInbox(res?.conversations || []));
      }
      
      // Replace optimistic message with real one
      setMessages((prev) => prev.map((m) => m.id === tempId ? sent : m));
    } catch (err) {
      console.error('Send failed', err);
      // Remove failed optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(content); // restore draft so user can retry
    } finally {
      setSending(false);
    }
  };

  const handleDraftChange = (value) => {
    setDraft(value);
    if (!activeConversation?.id) return;
    chatRealtimeService.send('/app/chat.typing', { conversationId: activeConversation.id, typing: true });

    if (typingStopTimeoutRef.current) {
      clearTimeout(typingStopTimeoutRef.current);
    }
    typingStopTimeoutRef.current = setTimeout(() => {
      chatRealtimeService.send('/app/chat.typing', { conversationId: activeConversation.id, typing: false });
    }, 900);
  };

  const handleExit = () => {
    navigate(-1);
  };

  /* ── Color tokens ── */
  const PRIMARY = '#3AB4E6';
  const PRIMARY_LIGHT = '#e8f6fc';
  const PRIMARY_DARK = '#2a9fd4';
  const BG = '#ffffff';
  const BG_SECONDARY = '#f7f9fb';
  const BORDER = '#e5eaf0';
  const TEXT_PRIMARY = '#1a2332';
  const TEXT_SECONDARY = '#5f6d7e';
  const TEXT_MUTED = '#94a3b8';

  return (
    <div className="flex-1 flex overflow-hidden bg-white w-full h-full">
      
      {/* ─── Sidebar (Conversations List) ─── */}
      <aside 
        className={`w-full md:w-[360px] flex-shrink-0 flex-col bg-white border-r border-slate-200 ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header & Search */}
        <div className="p-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Đoạn chat</h2>
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm trên Messenger"
              className="w-full h-10 pl-10 pr-4 bg-slate-100 rounded-full text-[15px] outline-none placeholder-slate-500 focus:bg-slate-200/50 transition-colors"
            />
          </div>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar px-2">
          {loading ? (
            <p className="p-4 text-slate-400 text-sm text-center">Đang tải...</p>
          ) : filteredConversations.length === 0 ? (
            <p className="p-4 text-slate-400 text-sm text-center">Chưa có cuộc trò chuyện.</p>
          ) : (
            filteredConversations.map((conv) => {
              const active = conv.id === activeConversationId;
              const hasUnread = conv.unreadCount > 0;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors mb-1 ${
                    active ? 'bg-sky-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-14 h-14 rounded-full bg-slate-100 overflow-hidden border-2 flex-shrink-0 ${hasUnread ? 'border-sky-500' : 'border-transparent'}`}>
                      <CompanyLogo
                        logoUrl={conv.otherParticipantAvatar}
                        companyId={conv.otherParticipantId}
                        companyName={conv.otherParticipantName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {onlineUsers[conv.otherParticipantId] && (
                      <span className="absolute right-0 bottom-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[15px] mb-0.5 truncate ${hasUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
                      {conv.otherParticipantName || 'Người dùng'}
                    </p>
                    <div className="flex items-center gap-1.5 text-[13px]">
                      <p className={`truncate ${hasUnread ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                        {conv.lastMessageContent || 'Chưa có nội dung'}
                      </p>
                      <span className={`flex-shrink-0 ${hasUnread ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                        · {formatChatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                  </div>
                  {hasUnread && (
                    <span className="w-3 h-3 rounded-full bg-sky-500 flex-shrink-0"></span>
                  )}
                </button>
              );
            })
          )}

          {/* Applied companies */}
          {pendingAppliedCompanies.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-2">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Các công ty đã ứng tuyển
              </p>
              {pendingAppliedCompanies.map((comp) => (
                <button
                  key={`applied-${comp.id}`}
                  onClick={async (e) => {
                    if (e.currentTarget.disabled) return;
                    e.currentTarget.disabled = true;
                    try {
                      const existing = conversations.find(c => c.otherParticipantId === comp.id);
                      if (existing) {
                        setActiveConversationId(existing.id);
                        return;
                      }
                      const sent = await messageService.sendMessage({
                        receiverId: comp.id,
                        receiverType: 'COMPANY',
                        senderType: 'USER',
                        content: `Chào ${comp.name}, tôi muốn trao đổi về vị trí ${comp.jobTitle || 'đang ứng tuyển'}.`,
                      });
                      const res = await messageService.getConversations({ page: 0, size: 50 });
                      setConversations(sortConversationsForInbox(res?.conversations || []));
                      setActiveConversationId(sent.conversationId);
                    } catch (err) {
                      console.error("Initiation failed", err);
                    } finally {
                      if (e.currentTarget) e.currentTarget.disabled = false;
                    }
                  }}
                  className="w-full text-left p-2 rounded-lg flex items-center gap-3 hover:bg-slate-50 transition-colors mb-1"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                    <CompanyLogo
                      logoUrl={comp.avatar}
                      companyId={comp.id}
                      companyName={comp.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium text-slate-800 truncate mb-0.5">
                      {comp.name}
                    </p>
                    <p className="text-[13px] text-sky-600 font-medium truncate">
                      Chưa có tin nhắn · Nhấp để liên hệ
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ─── Chat area (Main content) ─── */}
      <section 
        className={`flex-1 flex-col min-w-0 min-h-0 bg-white ${
          activeConversationId ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 flex-shrink-0 shadow-sm z-10">
              <button 
                onClick={() => setActiveConversationId(null)}
                className="md:hidden w-10 h-10 rounded-full text-sky-500 hover:bg-slate-100 flex items-center justify-center -ml-2 transition-colors flex-shrink-0"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                <CompanyLogo
                  logoUrl={activeConversation.otherParticipantAvatar}
                  companyId={activeConversation.otherParticipantId}
                  companyName={activeConversation.otherParticipantName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[15px] text-slate-900 truncate">
                  {activeConversation.otherParticipantName || 'Người dùng'}
                </p>
                <p className={`text-xs truncate ${activeConversation.otherParticipantActive === false ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                  {activeConversation.otherParticipantActive === false 
                    ? '🚫 Tài khoản bị đình chỉ'
                    : typingUsers[activeConversation.otherParticipantId]
                      ? 'Đang soạn tin nhắn...'
                      : (onlineUsers[activeConversation.otherParticipantId]
                        ? 'Đang hoạt động'
                        : '')}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesRef}
              className="flex-1 overflow-y-auto px-4 py-4 min-h-0 flex flex-col gap-1.5 custom-scrollbar"
            >
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                 <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden mb-3">
                  <CompanyLogo
                    logoUrl={activeConversation.otherParticipantAvatar}
                    companyId={activeConversation.otherParticipantId}
                    companyName={activeConversation.otherParticipantName}
                    className="w-full h-full object-cover"
                  />
                 </div>
                 <h3 className="font-bold text-lg text-slate-900">{activeConversation.otherParticipantName}</h3>
                 <p className="text-sm text-slate-500 mt-1">Các bạn hiện đã có thể nhắn tin với nhau</p>
              </div>

              {messages.map((msg, idx) => {
                const mine = msg.senderId === myActorId;
                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;
                
                const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;
                const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;

                let roundedClasses = "";
                if (mine) {
                   roundedClasses = `rounded-l-2xl ${isFirstInGroup ? 'rounded-tr-2xl' : 'rounded-tr-[4px]'} ${isLastInGroup ? 'rounded-br-2xl' : 'rounded-br-[4px]'}`;
                } else {
                   roundedClasses = `rounded-r-2xl ${isFirstInGroup ? 'rounded-tl-2xl' : 'rounded-tl-[4px]'} ${isLastInGroup ? 'rounded-bl-2xl' : 'rounded-bl-[4px]'}`;
                }

                return (
                  <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-2' : ''}`}>
                    <div className="flex items-end gap-2 max-w-[75%] md:max-w-[65%]">
                      {!mine && isLastInGroup && (
                        <div className="w-7 h-7 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 mb-[2px]">
                          <CompanyLogo
                            logoUrl={activeConversation.otherParticipantAvatar}
                            companyId={activeConversation.otherParticipantId}
                            companyName={activeConversation.otherParticipantName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {!mine && !isLastInGroup && (
                        <div className="w-7 flex-shrink-0"></div>
                      )}

                      <div className={`
                        px-3.5 py-2 text-[15px] shadow-sm
                        ${mine ? 'bg-[#0084FF] text-white' : 'bg-[#E4E6EB] text-slate-900'}
                        ${roundedClasses}
                      `}>
                        <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            {activeConversation.otherParticipantActive === false ? (
              <div className="p-4 bg-red-50 border-t border-red-100 flex-shrink-0 text-center">
                <p className="text-red-600 text-sm font-medium">
                  Tài khoản này hiện đang bị đình chỉ. Không thể gửi hoặc nhận tin nhắn mới.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="p-4 bg-white flex items-center gap-2 flex-shrink-0 pb-6 md:pb-4 border-t border-slate-100">
                <input
                  value={draft}
                  onChange={(e) => handleDraftChange(e.target.value)}
                  placeholder="Aa"
                  className="flex-1 h-[40px] px-4 rounded-full bg-slate-100 text-[15px] text-slate-900 outline-none placeholder-slate-500 focus:bg-slate-200/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    !draft.trim() || sending ? 'text-slate-300' : 'text-[#0084FF] hover:bg-sky-50'
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M3.4 20.4l17.4.5-17.4-4.5 3-4-3-4 17.4-4.5-17.4.5a2 2 0 0 0-1.8 2.2l1.3 5.4v.8l-1.3 5.4a2 2 0 0 0 1.8 2.2z"></path>
                  </svg>
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50/50">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-10 h-10 text-slate-300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
            </div>
            <p className="text-lg font-medium text-slate-500">Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MessagesPage;
