import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaPaperPlane, FaTimes, FaWindowMinimize } from 'react-icons/fa';
import messageService from '../../services/messageService';
import chatRealtimeService from '../../services/chatRealtimeService';
import { formatChatTime } from '../../utils/chatFormat';

const ChatDockBox = ({ conversation, currentUser, onClose, onMinimize, onSent }) => {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const listRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!conversation?.id) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const data = await messageService.getAllConversationMessages(conversation.id);
        setMessages(Array.isArray(data) ? data : []);
        await messageService.markConversationAsRead(conversation.id);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    chatRealtimeService.subscribe(
      `/topic/conversation/${conversation.id}`,
      `dock-conv-${conversation.id}`,
      (incoming) => {
        if (!incoming?.id) return;
        setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
      }
    );

    chatRealtimeService.subscribe(
      `/topic/conversation/${conversation.id}/typing`,
      `dock-typing-${conversation.id}`,
      (event) => {
        const currentActorId = currentUser?.role === 'EMPLOYER'
          ? (currentUser?.companyId || currentUser?.userId)
          : currentUser?.userId;
        if (!event || event.userId === currentActorId) return;
        setIsOtherTyping(Boolean(event.typing));
      }
    );

    return () => {
      chatRealtimeService.unsubscribe(`dock-conv-${conversation.id}`);
      chatRealtimeService.unsubscribe(`dock-typing-${conversation.id}`);
    };
  }, [conversation?.id]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const receiverInfo = useMemo(() => {
    if (!conversation) return null;
    return {
      id: conversation.otherParticipantId,
      name: conversation.otherParticipantName || 'Unknown',
      avatar: conversation.otherParticipantAvatar || '',
    };
  }, [conversation]);

  const currentActorId = currentUser?.role === 'EMPLOYER'
    ? (currentUser?.companyId || currentUser?.userId)
    : currentUser?.userId;
  const senderType = currentUser?.role === 'EMPLOYER' ? 'COMPANY' : 'USER';
  const receiverType = currentUser?.role === 'EMPLOYER' ? 'USER' : 'COMPANY';

  const handleSend = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !conversation?.id || !receiverInfo?.id || sending) return;

    setSending(true);
    try {
      const sent = await messageService.sendMessage({
        conversationId: conversation.id,
        receiverId: receiverInfo.id,
        receiverType,
        senderType,
        content,
      });
      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
      setDraft('');
      chatRealtimeService.send('/app/chat.typing', { conversationId: conversation.id, typing: false });
      if (onSent) onSent(sent);
    } finally {
      setSending(false);
    }
  };

  const handleDraftChange = (value) => {
    setDraft(value);

    if (!conversation?.id) return;
    chatRealtimeService.send('/app/chat.typing', { conversationId: conversation.id, typing: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      chatRealtimeService.send('/app/chat.typing', { conversationId: conversation.id, typing: false });
    }, 900);
  };

  const isMine = (msg) => msg?.senderId === currentActorId;

  if (!conversation) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[130] w-[360px] max-w-[calc(100vw-16px)] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
        <div className="min-w-0">
          <p className="font-semibold truncate">{receiverInfo?.name || 'Cuoc tro chuyen'}</p>
          <p className="text-xs text-slate-300">Nhan tin nhanh</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onMinimize} className="p-2 rounded-lg hover:bg-slate-700" title="Thu gon">
            <FaWindowMinimize size={11} />
          </button>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700" title="Dong">
            <FaTimes size={12} />
          </button>
        </div>
      </div>

      <div ref={listRef} className="h-80 overflow-y-auto bg-slate-50 p-3 space-y-2">
        {loading ? (
          <p className="text-center text-sm text-gray-500 py-6">Dang tai tin nhan...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-6">Bat dau cuoc tro chuyen.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${isMine(msg) ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm ${isMine(msg) ? 'bg-[#1967D2] text-white rounded-br-md' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'}`}>
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMine(msg) ? 'text-blue-100' : 'text-gray-400'}`}>{formatChatTime(msg.createdAt)}</p>
              </div>
            </div>
          ))
        )}
        {isOtherTyping ? (
          <p className="text-xs text-gray-500 pl-1">Dang nhap...</p>
        ) : null}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => handleDraftChange(e.target.value)}
          placeholder="Nhap tin nhan..."
          className="flex-1 h-10 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#3AB4E6]"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="h-10 w-10 rounded-xl bg-[#1967D2] text-white flex items-center justify-center disabled:opacity-50"
        >
          <FaPaperPlane size={12} />
        </button>
      </form>
    </div>
  );
};

export default ChatDockBox;
