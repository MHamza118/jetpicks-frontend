import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { imageUtils } from '../../utils';
import PickerDashboardSidebar from '../../components/layout/PickerDashboardSidebar';
import PickerDashboardHeader from '../../components/layout/PickerDashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useChat } from '../../context/ChatContext';
import { useUser } from '../../context/UserContext';
import { authApi, pickerProfileApi } from '../../services';
import type { ChatMessage } from '../../context/ChatContext';

const Chat = () => {
  const { roomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const { chatRooms, currentRoom, messages, fetchChatRooms, fetchChatRoom, fetchMessages, sendMessage, translateMessage, markRoomMessagesAsRead } = useChat();

  const [messageInput, setMessageInput] = useState('');
  const [showTranslated, setShowTranslated] = useState<{ [key: string]: boolean }>({});
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<any>({
    translation_language: 'English',
    auto_translate_messages: false,
    show_original_and_translated: true,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUserSettings = async () => {
    try {
      const settingsResponse = await pickerProfileApi.getSettings();
      if (settingsResponse.data) {
        setUserSettings(settingsResponse.data);
      }
    } catch (err) {
      // ignore
    }
  };

  // Get current user ID on mount
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const response = await authApi.getCurrentUser();
        const userData = (response as any).data || response;
        const userId = userData.id || (userData as any).data?.id;
        if (userId) {
          setCurrentUserId(userId.toString().toLowerCase());
        }

        // Fetch user settings
        await fetchUserSettings();
      } catch (error) {
        console.error('Failed to get current user context:', error);
      }
    };
    getCurrentUserId();
  }, []);

  // Refresh settings whenever the window regains focus (so changes in Settings are reflected)
  useEffect(() => {
    const onFocus = () => {
      fetchUserSettings();
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Fetch chat rooms on mount
  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  // Fetch specific room if roomId is provided
  // GUARD: if roomId exists to prevent null API calls
  useEffect(() => {
    if (roomId) {
      fetchChatRoom(roomId);
      fetchMessages(roomId);
    }
  }, [roomId, fetchChatRoom, fetchMessages]);

  // Mark messages as read when room is opened
  useEffect(() => {
    if (currentRoom && currentUserId) {
      markRoomMessagesAsRead(currentRoom.id, currentUserId);
    }
  }, [currentRoom, currentUserId, markRoomMessagesAsRead]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  const handleSendMessage = async () => {
    if (!messageInput.trim() || !roomId || sending) return;

    setSending(true);
    try {
      await sendMessage(roomId, messageInput);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      // TODO: Handle file upload to backend
      console.log('Files selected:', files);
    }
  };

  const getImageUrl = (imagePath?: string) => {
    return imageUtils.getImageUrl(imagePath);
  };

  const toggleTranslation = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);

    // Ensure we have the latest language settings before translating
    await fetchUserSettings();

    if (message && userSettings?.translation_language) {
      // Always re-translate when the user requests it, so we honor their current preference.
      await translateMessage(messageId, userSettings.translation_language);
    }

    setShowTranslated(prev => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const isSenderMessage = (senderId?: string) => {
    return senderId?.toLowerCase() === currentUserId;
  };

  const renderMessageContent = (message: ChatMessage) => {
    const hasTranslation = !!message.content_translated;
    const isAutoTranslate = userSettings?.auto_translate_messages;
    const isShowBoth = userSettings?.show_original_and_translated;
    const manualTranslate = showTranslated[message.id];

    // Senders don't need a translation of their own message
    const isSender = isSenderMessage(message.sender_id);

    if (hasTranslation && !isSender) {
      if (isShowBoth) {
        return (
          <div className="flex flex-col gap-1">
            <span className="text-xs opacity-60 italic border-b border-white/20 pb-1 mb-1">
              {message.content_original}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-0.5">Translation</span>
              <span>{message.content_translated}</span>
            </div>
          </div>
        );
      }

      if (isAutoTranslate || manualTranslate) {
        return (
          <div className="flex flex-col">
            {manualTranslate && !isAutoTranslate && (
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-0.5">Translation</span>
            )}
            <span>{message.content_translated}</span>
          </div>
        );
      }
    }

    return message.content_original;
  };

  const shouldShowTranslateButton = (message: ChatMessage) => {
    const isSender = isSenderMessage(message.sender_id);
    if (isSender) return false;

    // Show button if:
    // 1. Not translated yet
    // OR 2. Auto-translate is OFF and Show-Both is OFF
    return !message.content_translated ||
      (!userSettings?.auto_translate_messages && !userSettings?.show_original_and_translated);
  };

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <PickerDashboardSidebar activeTab="messages" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <PickerDashboardHeader
          title="Messages"
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Chat List - Left Panel */}
          <div className="hidden md:flex md:w-80 flex-col bg-white rounded-3xl shadow-lg m-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {chatRooms.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  No chats yet
                </div>
              ) : (
                chatRooms.map(room => (
                  <div
                    key={room.id}
                    onClick={() => {
                      navigate(`/picker/chat/${room.id}`);
                      fetchChatRoom(room.id);
                      fetchMessages(room.id);
                    }}
                    className={`px-4 py-3 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 ${currentRoom?.id === room.id
                      ? 'bg-[#FDF2F4] border-l-4 border-l-[#4D0013]'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 ring-2 ring-transparent group-hover:ring-[#4D0013]/10 transition-all">
                        {room.other_user.avatar_url ? (
                          <img
                            src={getImageUrl(room.other_user.avatar_url)}
                            alt={room.other_user.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#4D0013]/5 text-[#4D0013] font-bold">
                            {room.other_user.full_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex justify-between items-baseline gap-2">
                          <h3 className={`font-bold text-sm truncate ${currentRoom?.id === room.id ? 'text-[#4D0013]' : 'text-gray-900'}`}>
                            {room.other_user.full_name}
                          </h3>
                          <span className={`text-[10px] font-medium flex-shrink-0 ${currentRoom?.id === room.id ? 'text-[#4D0013]/60' : 'text-gray-500'}`}>
                            {room.last_message_time ? new Date(room.last_message_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                          </span>
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${currentRoom?.id === room.id ? 'text-[#4D0013]/70 font-medium' : 'text-gray-500'}`}>
                          {room.last_message || 'No messages yet'}
                        </p>
                      </div>
                      {room.unread_count > 0 && (
                        <div className="mt-1">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#4D0013] shadow-sm">
                            <span className="text-[10px] text-white font-bold">
                              {room.unread_count}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Messages - Right Panel */}
          <div className="flex-1 flex flex-col">
            {currentRoom ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                      {currentRoom.orderer.avatar_url ? (
                        <img
                          src={getImageUrl(currentRoom.orderer.avatar_url)}
                          alt={currentRoom.orderer.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">
                          {currentRoom.orderer.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{currentRoom.orderer.full_name}</h3>
                    </div>
                  </div>
                </div>

                {/* Transparency Notice */}
                <div className="bg-[#FFF8F0] border-b border-[#FFE5CC] px-6 py-2.5">
                  <p className="text-[13px] text-[#994D00] font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#CC6600] rounded-full animate-pulse"></span>
                    For transparency and protection, keep communication within the app.
                  </p>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${isSenderMessage(message.sender_id) ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm ${
                              isSenderMessage(message.sender_id)
                                ? 'bg-[#4D0013] text-white rounded-tr-none'
                                : 'bg-gray-100 text-gray-900 rounded-tl-none'
                            }`}
                          >
                            <div className="text-[14px] leading-relaxed">{renderMessageContent(message)}</div>
                            <div className="flex items-center justify-end gap-1.5 mt-1.5">
                              <span className={`text-[10px] font-medium ${isSenderMessage(message.sender_id) ? 'text-white/60' : 'text-gray-500'}`}>
                                {new Date(message.created_at).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isSenderMessage(message.sender_id) && (
                                <span className={`text-[10px] font-bold ${message.is_read ? 'text-blue-300' : 'text-white/30'}`}>
                                  {message.is_read ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                            {shouldShowTranslateButton(message) && (
                              <button
                                onClick={() => toggleTranslation(message.id)}
                                className="mt-2 text-[10px] bg-white/10 hover:bg-white/20 text-current border border-current/20 px-2 py-0.5 rounded-md font-bold transition-all"
                              >
                                {showTranslated[message.id] ? 'View Original' : 'Translate'}
                              </button>
                            )}
                          </div>
                        </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAttachmentClick}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Paperclip size={20} className="text-gray-600" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      multiple
                    />
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
                      placeholder="Type something..."
                      disabled={sending}
                      className="flex-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#4D0013] disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !messageInput.trim()}
                      className="p-2 bg-[#4D0013] hover:bg-[#660019] text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Select a chat to start messaging</p>
              </div>
            )}
          </div>
        </div>

        <MobileFooter activeTab="chat" />
      </div>


    </div>
  );
};

export default Chat;
