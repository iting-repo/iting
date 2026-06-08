import axiosInstance from '../utils/axiosInstance';

const messageService = {
  getConversations: async (params = {}) => axiosInstance.get('/messages/conversations', { params }),

  getConversationById: async (conversationId) => axiosInstance.get(`/messages/conversations/${conversationId}`),

  getConversationMessages: async (conversationId, params = { page: 0, size: 20 }) =>
    axiosInstance.get(`/messages/conversations/${conversationId}/messages`, { params }),

  getAllConversationMessages: async (conversationId) =>
    axiosInstance.get(`/messages/conversations/${conversationId}/messages/all`),

  sendMessage: async (payload) => axiosInstance.post('/messages', payload),

  // Upload tệp đính kèm (ảnh / PDF / DOCX) → trả về { url, name, contentType, size }.
  uploadAttachment: async (file) => {
    const form = new FormData();
    form.append('file', file);
    return axiosInstance.post('/messages/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Lấy thẻ xem trước (Open Graph) cho 1 URL. Trả về null nếu không lấy được.
  getLinkPreview: async (url) =>
    axiosInstance.get('/messages/link-preview', { params: { url } }),

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
