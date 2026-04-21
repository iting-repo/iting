export const formatChatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

export const getConversationSortScore = (conversation) => {
  const unreadScore = (conversation?.unreadCount || 0) > 0 ? 1 : 0;
  const timeScore = conversation?.lastMessageTime ? new Date(conversation.lastMessageTime).getTime() : 0;
  return { unreadScore, timeScore };
};

export const sortConversationsForInbox = (items = []) => {
  return [...items].sort((a, b) => {
    const aScore = getConversationSortScore(a);
    const bScore = getConversationSortScore(b);

    if (aScore.unreadScore !== bScore.unreadScore) {
      return bScore.unreadScore - aScore.unreadScore;
    }

    return bScore.timeScore - aScore.timeScore;
  });
};
