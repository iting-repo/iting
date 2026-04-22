import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaPaperPlane, FaSearch } from 'react-icons/fa';
import { CompanyLogo } from '../../components/common';
import { useSearchParams } from 'react-router-dom';
import messageService from '../../services/messageService';
import applicationService from '../../services/applicationService';
import chatRealtimeService from '../../services/chatRealtimeService';
import { formatChatTime, sortConversationsForInbox } from '../../utils/chatFormat';

const MessagesPage = () => {
  const [searchParams] = useSearchParams();
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

    const loadConversations = async () => {
      setLoading(true);
      try {
        const res = await messageService.getConversations({ page: 0, size: 50 });
        const sorted = sortConversationsForInbox(res?.conversations || []);
        setConversations(sorted);
        if (forcedConversationId && sorted.some((item) => item.id === forcedConversationId)) {
          setActiveConversationId(forcedConversationId);
        } else if (sorted.length > 0 && !activeConversationId) {
          setActiveConversationId(sorted[0].id);
        }
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [activeConversationId, searchParams]);

  useEffect(() => {
    if (!activeConversationId) return;

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

        setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
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

    return () => {
      chatRealtimeService.unsubscribe('messages-page-presence');
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

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

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
    if (!content || !activeConversation || sending) return;

    setSending(true);
    try {
      const sent = await messageService.sendMessage({
        conversationId: activeConversation.id,
        receiverId: activeConversation.otherParticipantId,
        receiverType,
        senderType,
        content,
      });
      setMessages((prev) => [...prev, sent]);
      setDraft('');
      chatRealtimeService.send('/app/chat.typing', { conversationId: activeConversation.id, typing: false });
      setConversations((prev) =>
        sortConversationsForInbox(
          prev.map((c) =>
            c.id === activeConversation.id
              ? { ...c, lastMessageContent: sent.content, lastMessageTime: sent.createdAt }
              : c
          )
        )
      );
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

  return (
    <div className="bg-[#f3f5f8] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-[340px_1fr] min-h-[75vh]">
          <section className="border-r border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h1 className="text-2xl font-black text-gray-900">Nhắn tin</h1>
              <div className="mt-3 relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kiếm tin nhắn"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#3AB4E6] outline-none"
                />
              </div>
            </div>

            <div className="max-h-[calc(75vh-100px)] overflow-y-auto">
              {loading ? (
                <p className="text-sm text-gray-500 p-4">Đang tải...</p>
              ) : filteredConversations.length === 0 ? (
                <p className="text-sm text-gray-500 p-4">Chưa có cuộc trò chuyện.</p>
              ) : (
                filteredConversations.map((conv) => {
                  const active = conv.id === activeConversationId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversationId(conv.id)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${active ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 rounded-full bg-slate-200 overflow-hidden border border-gray-100 p-0.5">
                            <CompanyLogo 
                              logoUrl={conv.otherParticipantAvatar} 
                              companyId={conv.otherParticipantId}
                              companyName={conv.otherParticipantName}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          {onlineUsers[conv.otherParticipantId] ? (
                            <span className="absolute right-0 bottom-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`font-semibold truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                              {conv.otherParticipantName || 'Unknown'}
                            </p>
                            <span className="text-xs text-gray-400">{formatChatTime(conv.lastMessageTime)}</span>
                          </div>
                          <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                            {conv.lastMessageContent || 'Chưa có nội dung'}
                          </p>
                        </div>
                        {conv.unreadCount > 0 ? (
                          <span className="ml-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              )}

              {pendingAppliedCompanies.length > 0 && (
                <div className="mt-6">
                  <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Các công ty đã ứng tuyển</p>
                  </div>
                  {pendingAppliedCompanies.map((comp) => (
                    <button
                      key={`applied-${comp.id}`}
                      onClick={async () => {
                        // Create a virtual conversation state or just try to send a message
                        // For now, let's just use the receiverId and receiverType to start
                        // We can't set activeConversationId because there's no ID yet.
                        // So we might need a "temporary" state for starting a new chat.
                        // Optimization: redirect to chat by sending the first hello message
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
                      className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-slate-100 overflow-hidden border border-gray-100 p-1 flex-shrink-0">
                          <CompanyLogo 
                            logoUrl={comp.avatar} 
                            companyId={comp.id}
                            companyName={comp.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-700 truncate">{comp.name}</p>
                          <p className="text-xs text-blue-500 italic truncate">Chưa có tin nhắn • Nhấp để liên hệ</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col min-h-[75vh]">
            {activeConversation ? (
              <>
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-gray-100 p-0.5">
                    <CompanyLogo 
                      logoUrl={activeConversation.otherParticipantAvatar} 
                      companyId={activeConversation.otherParticipantId}
                      companyName={activeConversation.otherParticipantName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{activeConversation.otherParticipantName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">
                      {typingUsers[activeConversation.otherParticipantId]
                        ? 'Đang nhập...'
                        : (onlineUsers[activeConversation.otherParticipantId] ? 'Đang hoạt động' : 'Cuộc trò chuyện')}
                    </p>
                  </div>
                </div>

                <div ref={messagesRef} className="flex-1 overflow-y-auto bg-[#f8fafc] p-5 space-y-3">
                  {messages.map((msg) => {
                    const mine = msg.senderId === myActorId;
                    return (
                      <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${mine ? 'bg-[#1967D2] text-white rounded-br-md' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'}`}>
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${mine ? 'text-blue-100' : 'text-gray-400'}`}>
                            {formatChatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-100 bg-white flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(e) => handleDraftChange(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 h-11 px-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#3AB4E6]"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    className="h-11 w-11 rounded-xl bg-[#1967D2] text-white flex items-center justify-center disabled:opacity-50"
                  >
                    <FaPaperPlane size={13} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">Chọn một cuộc trò chuyện để bắt đầu.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
