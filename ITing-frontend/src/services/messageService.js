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
};

export default messageService;
