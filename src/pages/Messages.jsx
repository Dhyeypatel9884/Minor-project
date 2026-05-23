import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import ClientSidebar from '../components/dashboard/ClientSidebar';
import TopBar from '../components/dashboard/TopBar';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Send, 
  MessageSquare, 
  User, 
  CheckCheck,
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Smile,
  SearchX,
  Loader2
} from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import { getImageUrl } from '../utils/formatters';

const Messages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState('student');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    const storedRole = localStorage.getItem('role') || 'student';
    setRole(storedRole);
    fetchConversations(storedRole, location.state?.conversationId);
  }, [location.state]);

  const fetchConversations = async (userRole, targetConvId) => {
    setIsLoadingConvs(true);
    try {
      const data = await api.get('/messages/conversations');
      const convs = data.conversations || [];
      setConversations(convs);

      // Auto-select a conversation if navigated from BidsReceived
      if (targetConvId) {
        setActiveChatId(targetConvId);
        fetchMessages(targetConvId);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load conversations');
    } finally {
      setIsLoadingConvs(false);
    }
  };

  const fetchMessages = async (convId) => {
    setIsLoadingMsgs(true);
    try {
      const data = await api.get(`/messages/${convId}`);
      setMessages(data.messages || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      toast.error(err.message || 'Failed to load messages');
    } finally {
      setIsLoadingMsgs(false);
    }
  };

  const handleSelectConversation = (convId) => {
    setActiveChatId(convId);
    fetchMessages(convId);
  };

  // --- Real-time polling: fetch new messages every 4 seconds ---
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (!activeChatId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const data = await api.get(`/messages/${activeChatId}`);
        const incoming = data.messages || [];
        setMessages(prev => {
          if (incoming.length > prev.length) {
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
            return incoming;
          }
          return prev;
        });
      } catch {
        // Silently ignore polling errors
      }
    }, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeChatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId || isSending) return;

    const text = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    // Optimistic update
    const optimisticMsg = {
      _id: `temp-${Date.now()}`,
      conversationId: activeChatId,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: role,
      text,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const data = await api.post(`/messages/${activeChatId}`, { text });
      // Replace optimistic message with real one
      setMessages(prev => prev.map(m => m._id === optimisticMsg._id ? data.message : m));
      
      // Update conversation's last message in list
      setConversations(prev => prev.map(c => 
        c._id === activeChatId ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() } : c
      ));
    } catch (err) {
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m._id !== optimisticMsg._id));
      toast.error(err.message || 'Failed to send message');
      setNewMessage(text); // restore the text
    } finally {
      setIsSending(false);
    }
  };

  const activeConv = conversations.find(c => c._id === activeChatId);

  const filteredConversations = conversations.filter(c => 
    (c.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.projectTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.clientName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getDisplayName = (conv) => {
    return role === 'client' ? conv.studentName : conv.clientName;
  };

  const getAvatar = (conv) => {
    const name = role === 'client' ? conv.studentName : conv.clientName;
    const avatar = role === 'client' ? conv.studentAvatar : conv.clientAvatar;
    return getImageUrl(avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'User')}`;
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {role === 'client' 
        ? <ClientSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        : <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      }
      
      <div className="lg:pl-64 flex flex-col h-screen">
        <TopBar setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 flex overflow-hidden p-4 lg:p-6 gap-6">
          <div className="max-w-7xl mx-auto w-full flex bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden shadow-teal-500/5 relative">
            
            {/* Left Panel: Conversations List */}
            <div className={`w-full lg:w-96 border-r border-gray-50 flex flex-col bg-white z-20 transition-all ${activeChatId ? 'hidden lg:flex' : 'flex'}`}>
              <div className="p-6 border-b border-gray-50">
                <h1 className="text-2xl font-black text-gray-900 mb-6 italic tracking-tight">Messages</h1>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1ab2a6] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1ab2a6]/5 focus:border-[#1ab2a6] focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoadingConvs ? (
                  <div className="flex flex-col items-center justify-center h-40">
                    <Loader2 className="w-6 h-6 text-[#1ab2a6] animate-spin" />
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <div className="divide-y divide-gray-50/50">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv._id}
                        onClick={() => handleSelectConversation(conv._id)}
                        className={`w-full p-6 flex items-start gap-4 hover:bg-gray-50/80 transition-all text-left relative group ${activeChatId === conv._id ? 'bg-teal-50/50' : ''}`}
                      >
                        {activeChatId === conv._id && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-[#1ab2a6] rounded-r-full shadow-[2px_0_10px_rgba(26,178,166,0.3)]"></div>
                        )}
                        
                        <div className="relative flex-shrink-0">
                          <img 
                            src={getAvatar(conv)} 
                            alt={getDisplayName(conv)}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <h3 className="text-sm font-bold text-gray-900 truncate">{getDisplayName(conv)}</h3>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{formatTime(conv.lastMessageAt)}</span>
                          </div>
                          <p className="text-xs font-bold text-[#1ab2a6] mb-1.5 truncate uppercase tracking-widest opacity-70">{conv.projectTitle}</p>
                          <p className="text-sm text-gray-500 font-medium truncate">
                            {conv.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-40">
                    <SearchX className="w-12 h-12 mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">No conversations yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Chat Window */}
            <div className={`flex-1 flex flex-col bg-[#fafbfc]/50 transition-all ${!activeChatId ? 'hidden lg:flex' : 'flex'}`}>
              {activeConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 bg-white border-b border-gray-50 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setActiveChatId(null)}
                        className="lg:hidden p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-400"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={getAvatar(activeConv)} 
                            alt={getDisplayName(activeConv)}
                            className="w-12 h-12 rounded-2xl object-cover border border-gray-100 shadow-sm"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <h3 className="text-base font-black text-gray-900 tracking-tight">{getDisplayName(activeConv)}</h3>
                          <p className="text-[10px] text-[#1ab2a6] font-bold uppercase tracking-widest">{activeConv.projectTitle}</p>
                        </div>
                      </div>
                    </div>
                    <button className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-gray-900">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {isLoadingMsgs ? (
                      <div className="flex items-center justify-center h-20">
                        <Loader2 className="w-6 h-6 text-[#1ab2a6] animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center opacity-40 space-y-3">
                        <MessageSquare className="w-10 h-10" />
                        <p className="text-sm font-bold">No messages yet. Say hello!</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.senderId?.toString() === currentUser.id?.toString() || 
                                     msg.senderRole === role;
                        return (
                          <div 
                            key={msg._id} 
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                          >
                            <div className="flex items-end gap-3 max-w-[85%] md:max-w-[75%]">
                              <div className={`px-6 py-4 rounded-3xl text-sm font-medium leading-relaxed ${
                                isMe 
                                  ? 'bg-[#1ab2a6] text-white rounded-tr-none shadow-[0_10px_25px_-5px_rgba(26,178,166,0.3)]' 
                                  : 'bg-white text-gray-700 rounded-tl-none border border-gray-50 shadow-sm'
                              }`}>
                                {msg.text}
                              </div>
                            </div>
                            <div className={`flex items-center gap-2 mt-2 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && <CheckCheck className="w-3 h-3 text-[#1ab2a6]" />}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-6 bg-white border-t border-gray-50 flex flex-col gap-4">
                    {/* Suggested Replies */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {[
                        "Sure, I'll send it today",
                        "Can you share more details?",
                        "I'm working on it 👍",
                        "Let's discuss this further"
                      ].map((suggestion, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setNewMessage(suggestion)}
                          className="flex-shrink-0 px-4 py-2 rounded-full border border-teal-100 bg-teal-50/30 text-[#1ab2a6] text-xs font-bold hover:bg-[#1ab2a6] hover:text-white hover:border-[#1ab2a6] transition-all active:scale-95"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="relative flex items-center gap-4">
                      <div className="hidden md:flex items-center gap-1">
                        <button type="button" className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400">
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <button type="button" className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400">
                          <Smile className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="relative flex-1">
                        <input 
                          type="text" 
                          placeholder="Write your message here..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          disabled={isSending}
                          className="w-full pl-8 pr-16 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-full focus:outline-none focus:ring-4 focus:ring-[#1ab2a6]/10 focus:border-[#1ab2a6] focus:bg-white transition-all duration-300 text-sm font-medium text-gray-800 placeholder:text-gray-400 disabled:opacity-60"
                        />
                        <button 
                          type="submit"
                          disabled={!newMessage.trim() || isSending}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#1ab2a6] hover:bg-[#148e85] disabled:bg-gray-200 text-white rounded-full transition-all flex items-center justify-center shadow-lg hover:shadow-[#1ab2a6]/30 active:scale-95"
                        >
                          {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-8 animate-in fade-in duration-700">
                  <div className="relative">
                    <div className="w-32 h-32 bg-teal-50 rounded-[3rem] flex items-center justify-center border border-teal-100/50 rotate-3">
                      <MessageSquare className="w-12 h-12 text-[#1ab2a6] -rotate-3" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl border border-gray-50 shadow-sm flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-300" />
                    </div>
                  </div>
                  <div className="max-w-sm">
                    <h2 className="text-2xl font-black text-gray-900 mb-3 italic tracking-tight">Your Inbox</h2>
                    <p className="text-gray-500 font-medium leading-relaxed">
                      {role === 'client' 
                        ? 'Click "Chat" on a bid in Bids Received to start a conversation.'
                        : 'Select a conversation from the list to start messaging.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </main>

        <footer className="py-6 px-10 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest opacity-60">
          © 2025 CampusFreelance Secure Messaging
        </footer>
      </div>
    </div>
  );
};

export default Messages;
