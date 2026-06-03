import axiosInstance from '../utils/axiosInstance';

const messageService = {
  getConversations: async (params = {}) => axiosInstance.get('/messages/conversations', { params }),

  getConversationById: async (conversationId) => axiosInstance.get(`/messages/conversations/${conversationId}`),

  getConversationMessages: async (conversationId, params = { page: 0, size: 20 }) =>
    axiosInstance.get(`/messages/conversations/${conversationId}/messages`, { params }),

  getAllConversationMessages: async (conversationId) =>
    axiosInstance.get(`/messages/conversations/${conversationId}/messages/all`),

  sendMessage: async (payload) => axiosInstance.post('/messages', payload),

  markConversationAsRead: async (conversationId) =>
    axiosInstance.patch(`/messages/conversations/${conversationId}/read`),

  getUnreadCount: async () => axiosInstance.get('/messages/unread/count'),

  // CRUD: edit + soft delete cho tin nhắn của chính mình.
  // Backend: PUT/DELETE /api/messages/{id} — chỉ sender mới được, window 24h cho edit.
  editMessage: async (messageId, content) =>
    axiosInstance.put(`/messages/${messageId}`, { content }),

  deleteMessage: async (messageId) =>
    axiosInstance.delete(`/messages/${messageId}`),
};

export default messageService;
