import { useState, useEffect, useRef } from 'react';
import { Search, Send, Paperclip, Phone, Info, Plus } from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileFooter from '../../components/layout/MobileFooter';

interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  attachments?: string[];
  needs_translation?: boolean;
}

interface ChatRoom {
  id: string;
  picker: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  order: {
    id: string;
    origin_city: string;
    destination_city: string;
    origin_country: string;
    destination_country: string;
  };
  picker_language?: string;
  orderer_language?: string;
}

const Chat = () => {
  const [chatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [fabPosition, setFabPosition] = useState({ x: 304, y: window.innerHeight - 120 });
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fabRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // TODO: Fetch chat room data from API
  // For now, chatRoom is null and will show "Select a chat" message

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFabMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = fabRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !fabRef.current) return;

    const newX = e.clientX - dragOffsetRef.current.x;
    const newY = e.clientY - dragOffsetRef.current.y;

    const maxX = window.innerWidth - fabRef.current.offsetWidth;
    const maxY = window.innerHeight - fabRef.current.offsetHeight;

    setFabPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleAvatarError = () => {
    setAvatarError(true);
    setAvatarUrl(null);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    // TODO: API integration
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender_id: 'current-user',
      content: messageInput,
      status: 'sent',
      created_at: new Date().toISOString(),
    };
    
    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      // TODO: Handle file upload
      console.log('Files selected:', files);
    }
  };

  const shouldShowTranslate = (message: ChatMessage) => {
    return message.needs_translation && message.sender_id !== 'current-user';
  };

  const getMessageStatus = (status: string) => {
    if (status === 'sent') return '✓';
    if (status === 'delivered') return '✓✓';
    if (status === 'read') return '✓✓';
  };

  const getStatusColor = (status: string) => {
    return status === 'read' ? 'text-blue-500' : 'text-gray-400';
  };

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      <DashboardSidebar activeTab="messages" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <DashboardHeader
          title="Messages"
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          onAvatarError={handleAvatarError}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Chat List - Left Panel */}
          <div className="hidden md:flex md:w-80 flex-col bg-white rounded-3xl shadow-lg m-4 overflow-hidden">
            <div className="p-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FFDF57]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4">
              {/* Chat list items will go here */}
              <div className="py-8 text-center text-gray-500 text-sm">
                No chats yet
              </div>
            </div>
          </div>

          {/* Chat Messages - Right Panel */}
          <div className="flex-1 flex flex-col">
            {chatRoom ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                      {chatRoom.picker.avatar_url ? (
                        <img
                          src={chatRoom.picker.avatar_url}
                          alt={chatRoom.picker.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">
                          {chatRoom.picker.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{chatRoom.picker.full_name}</h3>
                      <p className="text-xs text-gray-500">
                        From {chatRoom.order.origin_city} - {chatRoom.order.destination_city}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Phone size={20} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Info size={20} className="text-gray-600" />
                    </button>
                  </div>
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
                        className={`flex ${
                          message.sender_id === 'current-user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.sender_id === 'current-user'
                              ? 'bg-[#FFDF57] text-gray-900'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className="text-xs text-gray-600">
                              {new Date(message.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {message.sender_id === 'current-user' && (
                              <span className={`text-xs font-bold ${getStatusColor(message.status)}`}>
                                {getMessageStatus(message.status)}
                              </span>
                            )}
                          </div>
                          {shouldShowTranslate(message) && (
                            <button className="mt-2 text-xs bg-yellow-300 text-gray-900 px-2 py-1 rounded font-semibold hover:bg-yellow-400 transition-colors">
                              Translate
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
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type something..."
                      className="flex-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FFDF57]"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-[#FFDF57] hover:bg-yellow-500 rounded-full transition-colors"
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

      {/* Draggable FAB Button */}
      <div
        ref={fabRef}
        onMouseDown={handleFabMouseDown}
        style={{
          position: 'fixed',
          left: `${fabPosition.x}px`,
          top: `${fabPosition.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg z-40"
      >
        <Plus size={28} className="text-white" />
      </div>
    </div>
  );
};

export default Chat;
