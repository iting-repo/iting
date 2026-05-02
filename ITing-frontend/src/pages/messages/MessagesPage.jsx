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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      background: BG,
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* ─── Top bar ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px',
        background: PRIMARY,
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(58,180,230,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>💬</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
            Nhắn tin
          </span>
        </div>
        <button
          onClick={handleExit}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 16px', borderRadius: 8,
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.35)',
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
        >
          <FaSignOutAlt size={12} />
          Thoát
        </button>
      </div>

      {/* ─── Main area ─── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* ─── Sidebar ─── */}
        <aside style={{
          width: 340, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          background: BG,
          borderRight: `1px solid ${BORDER}`,
        }}>
          {/* Search */}
          <div style={{ padding: 14, borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: TEXT_MUTED, fontSize: 13,
              }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm tin nhắn"
                style={{
                  width: '100%', height: 40, paddingLeft: 36, paddingRight: 12,
                  borderRadius: 10, border: `1px solid ${BORDER}`,
                  background: BG_SECONDARY, color: TEXT_PRIMARY,
                  fontSize: 13, outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.currentTarget.style.borderColor = PRIMARY}
                onBlur={e => e.currentTarget.style.borderColor = BORDER}
              />
            </div>
          </div>

          {/* Conversations list */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {loading ? (
              <p style={{ padding: 16, color: TEXT_MUTED, fontSize: 13 }}>Đang tải...</p>
            ) : filteredConversations.length === 0 ? (
              <p style={{ padding: 16, color: TEXT_MUTED, fontSize: 13 }}>Chưa có cuộc trò chuyện.</p>
            ) : (
              filteredConversations.map((conv) => {
                const active = conv.id === activeConversationId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '12px 14px', display: 'block',
                      borderBottom: `1px solid ${BORDER}`,
                      background: active ? PRIMARY_LIGHT : BG,
                      borderLeft: active ? `3px solid ${PRIMARY}` : '3px solid transparent',
                      cursor: 'pointer', transition: 'all 0.15s',
                      border: 'none',
                      borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: BORDER,
                      ...(active ? { borderLeft: `3px solid ${PRIMARY}`, background: PRIMARY_LIGHT } : {}),
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = BG_SECONDARY; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? PRIMARY_LIGHT : BG; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%',
                          background: BG_SECONDARY, overflow: 'hidden',
                          border: active ? `2px solid ${PRIMARY}` : `2px solid ${BORDER}`,
                          padding: 2,
                        }}>
                          <CompanyLogo
                            logoUrl={conv.otherParticipantAvatar}
                            companyId={conv.otherParticipantId}
                            companyName={conv.otherParticipantName}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        {onlineUsers[conv.otherParticipantId] && (
                          <span style={{
                            position: 'absolute', right: 0, bottom: 0,
                            width: 12, height: 12, borderRadius: '50%',
                            background: '#22c55e', border: '2px solid #fff',
                          }} />
                        )}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 6 }}>
                          <p style={{
                            fontWeight: conv.unreadCount > 0 ? 700 : 500,
                            color: TEXT_PRIMARY, fontSize: 14, margin: 0,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {conv.otherParticipantName || 'Unknown'}
                          </p>
                          <span style={{ fontSize: 11, color: TEXT_MUTED, flexShrink: 0 }}>
                            {formatChatTime(conv.lastMessageTime)}
                          </span>
                        </div>
                        <p style={{
                          fontSize: 12, margin: '3px 0 0',
                          color: conv.unreadCount > 0 ? TEXT_PRIMARY : TEXT_SECONDARY,
                          fontWeight: conv.unreadCount > 0 ? 600 : 400,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {conv.lastMessageContent || 'Chưa có nội dung'}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span style={{
                          minWidth: 20, height: 20, padding: '0 6px',
                          borderRadius: 10, background: '#ef4444',
                          color: '#fff', fontSize: 11, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}

            {/* Applied companies */}
            {pendingAppliedCompanies.length > 0 && (
              <div>
                <div style={{
                  padding: '8px 14px', background: BG_SECONDARY,
                  borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
                }}>
                  <p style={{
                    fontSize: 10, fontWeight: 700, color: TEXT_MUTED,
                    textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0,
                  }}>Các công ty đã ứng tuyển</p>
                </div>
                {pendingAppliedCompanies.map((comp) => (
                  <button
                    key={`applied-${comp.id}`}
                    onClick={async () => {
                      try {
                        const sent = await messageService.sendMessage({
                          receiverId: comp.id,
                          receiverType: 'COMPANY',
                          senderType: 'USER',
                          content: `Chào ${comp.name}, tôi muốn trao đổi về vị trí ${comp.jobTitle || 'đang ứng tuyển'}.`,
                        });
                        setActiveConversationId(sent.conversationId);
                      } catch (err) {
                        console.error("Initiation failed", err);
                      }
                    }}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '12px 14px', display: 'block',
                      borderBottom: `1px solid ${BORDER}`,
                      background: BG, cursor: 'pointer',
                      transition: 'all 0.15s', border: 'none',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = BG_SECONDARY}
                    onMouseLeave={e => e.currentTarget.style.background = BG}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: BG_SECONDARY, overflow: 'hidden',
                        border: `2px solid ${BORDER}`, padding: 2, flexShrink: 0,
                      }}>
                        <CompanyLogo
                          logoUrl={comp.avatar}
                          companyId={comp.id}
                          companyName={comp.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontWeight: 500, color: TEXT_PRIMARY, fontSize: 14, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {comp.name}
                        </p>
                        <p style={{ fontSize: 11, color: PRIMARY, fontStyle: 'italic', margin: '3px 0 0' }}>
                          Chưa có tin nhắn • Nhấp để liên hệ
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ─── Chat area ─── */}
        <section style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          minWidth: 0, minHeight: 0,
          background: BG_SECONDARY,
        }}>
          {activeConversation ? (
            <>
              {/* Chat header */}
              <div style={{
                padding: '12px 24px',
                borderBottom: `1px solid ${BORDER}`,
                display: 'flex', alignItems: 'center', gap: 12,
                background: BG, flexShrink: 0,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: BG_SECONDARY, overflow: 'hidden',
                  border: `2px solid ${PRIMARY}`, padding: 2,
                }}>
                  <CompanyLogo
                    logoUrl={activeConversation.otherParticipantAvatar}
                    companyId={activeConversation.otherParticipantId}
                    companyName={activeConversation.otherParticipantName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: TEXT_PRIMARY, fontSize: 15, margin: 0 }}>
                    {activeConversation.otherParticipantName || 'Unknown'}
                  </p>
                  <p style={{ fontSize: 12, margin: '2px 0 0', color: activeConversation.otherParticipantActive === false ? '#EF4444' : TEXT_SECONDARY }}>
                    {activeConversation.otherParticipantActive === false 
                      ? '🚫 Tài khoản bị đình chỉ'
                      : typingUsers[activeConversation.otherParticipantId]
                        ? '✏️ Đang nhập...'
                        : (onlineUsers[activeConversation.otherParticipantId]
                          ? '🟢 Đang hoạt động'
                          : 'Cuộc trò chuyện')}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={messagesRef}
                style={{
                  flex: 1, overflowY: 'auto', padding: '20px 24px',
                  minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10,
                }}
              >
                {messages.map((msg) => {
                  const mine = msg.senderId === myActorId;
                  return (
                    <div key={msg.id} style={{
                      display: 'flex',
                      justifyContent: mine ? 'flex-end' : 'flex-start',
                    }}>
                      <div style={{
                        maxWidth: '70%',
                        padding: '10px 16px',
                        borderRadius: mine ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                        fontSize: 14, lineHeight: 1.5,
                        ...(mine
                          ? { background: PRIMARY, color: '#fff' }
                          : { background: '#fff', color: TEXT_PRIMARY, border: `1px solid ${BORDER}` }),
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      }}>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {msg.content}
                        </p>
                        <p style={{
                          fontSize: 10, marginTop: 4, marginBottom: 0,
                          color: mine ? 'rgba(255,255,255,0.7)' : TEXT_MUTED,
                        }}>
                          {formatChatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              {activeConversation.otherParticipantActive === false ? (
                <div style={{
                  padding: '16px 24px',
                  borderTop: `1px solid ${BORDER}`,
                  background: '#FEF2F2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <p style={{ color: '#DC2626', fontSize: 14, margin: 0, fontWeight: 500, textAlign: 'center' }}>
                    Tài khoản công ty này hiện đang bị đình chỉ. Không thể gửi hoặc nhận tin nhắn mới.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSend} style={{
                  padding: '12px 24px',
                  borderTop: `1px solid ${BORDER}`,
                  background: BG,
                  display: 'flex', alignItems: 'center', gap: 10,
                  flexShrink: 0,
                }}>
                  <input
                    value={draft}
                    onChange={(e) => handleDraftChange(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    style={{
                      flex: 1, height: 42, padding: '0 16px',
                      borderRadius: 12,
                      border: `1px solid ${BORDER}`,
                      background: BG_SECONDARY,
                      color: TEXT_PRIMARY, fontSize: 14, outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = PRIMARY}
                    onBlur={e => e.currentTarget.style.borderColor = BORDER}
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: !draft.trim() || sending ? '#c3e6f5' : PRIMARY,
                      color: '#fff', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: !draft.trim() || sending ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s', flexShrink: 0,
                    }}
                  >
                    <FaPaperPlane size={14} />
                  </button>
                </form>
              )}
            </>
          ) : (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: TEXT_MUTED, gap: 10,
            }}>
              <div style={{ fontSize: 48, opacity: 0.35 }}>💬</div>
              <p style={{ fontSize: 15, margin: 0 }}>Chọn một cuộc trò chuyện để bắt đầu.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MessagesPage;
