import { apiClient } from './client';

export const chatApi = {
  // Get or create chat room for an order
  // This MUST be called before navigating to chat to ensure chatRoomId is never null
  getOrCreateChatRoom: (orderId: string, pickerId: string) =>
    apiClient.post('/chat-rooms/get-or-create', {
      order_id: orderId,
      picker_id: pickerId,
    }),

  // Get all chat rooms for the current user
  getChatRooms: (page = 1, limit = 20) =>
    apiClient.get(`/chat-rooms?page=${page}&limit=${limit}`),

  // Get specific chat room details
  getChatRoom: (roomId: string) =>
    apiClient.get(`/chat-rooms/${roomId}`),

  // Get messages in a chat room
  getMessages: (roomId: string, page = 1, limit = 50) =>
    apiClient.get(`/chat-rooms/${roomId}/messages?page=${page}&limit=${limit}`),

  // Send a message
  sendMessage: (roomId: string, content: string, translate = false) =>
    apiClient.post(`/chat-rooms/${roomId}/messages`, {
      content,
      translate,
    }),

  // Mark a single message as read
  markMessageAsRead: (messageId: string) =>
    apiClient.put(`/chat-messages/${messageId}/read`, {}),
};
