import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { chatApi } from '../services';

export interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  content_original: string;
  content_translated?: string;
  translation_enabled: boolean;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface ChatRoom {
  id: string;
  order_id: string;
  orderer: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  picker: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  other_user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatListItem {
  id: string;
  order_id: string;
  other_user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  is_typing?: boolean;
}

interface ChatContextType {
  chatRooms: ChatListItem[];
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  fetchChatRooms: () => Promise<void>;
  fetchChatRoom: (roomId: string) => Promise<void>;
  fetchMessages: (roomId: string, page?: number) => Promise<void>;
  sendMessage: (roomId: string, content: string, translate?: boolean) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  setCurrentRoom: (room: ChatRoom | null) => void;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chatRooms, setChatRooms] = useState<ChatListItem[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const isPollingSetupRef = useRef(false);

  const clearError = useCallback(() => setError(null), []);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      await chatApi.markMessageAsRead(messageId);
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  }, []);

  const fetchChatRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chatApi.getChatRooms(1, 50);
      const data = (response as any).data || [];
      
      const formattedRooms: ChatListItem[] = data.map((room: any) => ({
        id: room.id,
        order_id: room.order_id,
        other_user: room.other_user,
        last_message: room.last_message,
        last_message_time: room.last_message_time,
        unread_count: room.unread_count,
        is_typing: false,
      }));
      
      setChatRooms(formattedRooms);
      setError(null);
    } catch (err) {
      setError('Failed to fetch chat rooms');
      console.error('Error fetching chat rooms:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChatRoom = useCallback(async (roomId: string) => {
    try {
      setLoading(true);
      const response = await chatApi.getChatRoom(roomId);
      const data = (response as any).data;
      setCurrentRoom(data);
      
      // Mark all unread messages in this room as read
      if (messages.length > 0) {
        const unreadMessages = messages.filter(msg => !msg.is_read && msg.sender_id !== 'current-user');
        for (const msg of unreadMessages) {
          await markMessageAsRead(msg.id);
        }
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch chat room');
      console.error('Error fetching chat room:', err);
      setCurrentRoom(null);
    } finally {
      setLoading(false);
    }
  }, [messages, markMessageAsRead]);

  const fetchMessages = useCallback(async (roomId: string, page = 1) => {
    try {
      const response = await chatApi.getMessages(roomId, page, 50);
      const data = (response as any).data?.data || (response as any).data || [];
      
      if (page === 1) {
        setMessages(data);
        if (data.length > 0) {
          lastMessageIdRef.current = data[data.length - 1].id;
        }
      } else {
        setMessages(prev => [...prev, ...data]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch messages');
      console.error('Error fetching messages:', err);
    }
  }, []);

  const sendMessage = useCallback(async (roomId: string, content: string, translate = false) => {
    try {
      const response = await chatApi.sendMessage(roomId, content, translate);
      const newMessage = (response as any).data?.data || (response as any).data;
      
      setMessages(prev => [...prev, newMessage]);
      lastMessageIdRef.current = newMessage.id;
      setError(null);
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      throw err;
    }
  }, []);

  // Polling for new messages every 2 seconds
  useEffect(() => {
    if (!currentRoom) {
      // Clean up polling if no room
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      isPollingSetupRef.current = false;
      return;
    }

    // Only set up polling once per room
    if (isPollingSetupRef.current) {
      return;
    }

    isPollingSetupRef.current = true;

    const pollMessages = async () => {
      try {
        const response = await chatApi.getMessages(currentRoom.id, 1, 50);
        const newMessages = (response as any).data?.data || (response as any).data || [];
        
        if (newMessages.length > 0) {
          setMessages(prev => {
            // Filter out duplicates by checking if message already exists
            const existingIds = new Set(prev.map(m => m.id));
            const uniqueNewMessages = newMessages.filter((msg: ChatMessage) => !existingIds.has(msg.id));
            
            if (uniqueNewMessages.length > 0) {
              lastMessageIdRef.current = newMessages[newMessages.length - 1].id;
              return [...prev, ...uniqueNewMessages];
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Error polling messages:', err);
      }
    };

    pollingIntervalRef.current = setInterval(pollMessages, 2000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      isPollingSetupRef.current = false;
    };
  }, [currentRoom]);

  return (
    <ChatContext.Provider
      value={{
        chatRooms,
        currentRoom,
        messages,
        loading,
        error,
        fetchChatRooms,
        fetchChatRoom,
        fetchMessages,
        sendMessage,
        markMessageAsRead,
        setCurrentRoom,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
