import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Phone } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { imageUtils } from '../../utils';
import PickerDashboardSidebar from '../../components/layout/PickerDashboardSidebar';
import PickerDashboardHeader from '../../components/layout/PickerDashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';
import { useChat } from '../../context/ChatContext';
import { useUser } from '../../context/UserContext';

const Chat = () => {
  const { roomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();
  const { avatarUrl, avatarError, handleAvatarError } = useUser();
  const { chatRooms, currentRoom, messages, fetchChatRooms, fetchChatRoom, fetchMessages, sendMessage } = useChat();

  const [messageInput, setMessageInput] = useState('');
  const [showTranslated, setShowTranslated] = useState<{ [key: string]: boolean }>({});
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch chat rooms on mount
  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  // Fetch specific room if roomId is provided
  // GUARD: Only fetch if roomId exists to prevent null API calls
  useEffect(() => {
    if (roomId) {
      fetchChatRoom(roomId);
      fetchMessages(roomId);
    }
  }, [roomId, fetchChatRoom, fetchMessages]);

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

  const toggleTranslation = (messageId: string) => {
    setShowTranslated(prev => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const getMessageContent = (message: any) => {
    if (showTranslated[message.id] && message.content_translated) {
      return message.content_translated;
    }
    return message.content_original;
  };

  const shouldShowTranslateButton = (message: any) => {
    return message.content_translated && message.sender_id !== currentRoom?.picker.id;
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
                    className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${currentRoom?.id === room.id
                        ? 'bg-[#4D0013] text-white'
                        : 'hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {room.other_user.avatar_url ? (
                          <img
                            src={getImageUrl(room.other_user.avatar_url)}
                            alt={room.other_user.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">
                            {room.other_user.full_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <h3 className={`font-bold text-sm truncate ${currentRoom?.id === room.id ? 'text-white' : 'text-gray-900'}`}>
                            {room.other_user.full_name}
                          </h3>
                          <span className={`text-xs flex-shrink-0 ${currentRoom?.id === room.id ? 'text-white/70' : 'text-gray-500'}`}>
                            {room.last_message_time ? new Date(room.last_message_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '.') : ''}
                          </span>
                        </div>
                        <p className={`text-xs truncate mt-1 ${currentRoom?.id === room.id ? 'text-white/70' : 'text-gray-500'}`}>
                          {room.last_message || 'No messages yet'}
                        </p>
                      </div>
                      {room.unread_count > 0 && (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${currentRoom?.id === room.id ? 'bg-white' : 'bg-gray-900'}`}>
                          <span className={`text-xs font-bold ${currentRoom?.id === room.id ? 'text-[#4D0013]' : 'text-white'}`}>
                            {room.unread_count}
                          </span>
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
                      <p className="text-xs text-gray-500">
                        Order: {currentRoom.order_id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Phone size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Transparency Notice */}
                <div className="bg-red-50 border-b border-red-200 px-6 py-3">
                  <p className="text-sm text-red-900 font-medium">
                    For transparency and protection, please keep all communication and order details within the app.
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
                        className={`flex ${message.sender_id === currentRoom?.picker.id ? 'justify-end' : 'justify-start'
                          }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${message.sender_id === currentRoom?.picker.id
                              ? 'bg-[#4D0013] text-white'
                              : 'bg-gray-100 text-gray-900'
                            }`}
                        >
                          <p className="text-sm">{getMessageContent(message)}</p>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className={`text-xs ${message.sender_id === currentRoom?.picker.id ? 'text-white/70' : 'text-gray-600'}`}>
                              {new Date(message.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {message.sender_id === currentRoom?.picker.id && (
                              <span className={`text-xs font-bold ${message.is_read ? 'text-blue-300' : 'text-white/50'
                                }`}>
                                {message.is_read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                          {shouldShowTranslateButton(message) && (
                            <button
                              onClick={() => toggleTranslation(message.id)}
                              className="mt-2 text-xs bg-white text-[#4D0013] px-2 py-1 rounded font-semibold hover:bg-gray-100 transition-colors"
                            >
                              {showTranslated[message.id] ? 'Original' : 'Translate'}
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
                      <Send size={20} className="text-gray-900" />
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
