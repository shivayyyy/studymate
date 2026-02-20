
import { Send, MoreVertical, Phone, Video, MessageCircle, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { UserService } from '../services/user.service';
import { ChatService } from '../services/chat.service';
import { User, useUserStore } from '../stores/useUserStore';
import { useChatStore } from '../stores/useChatStore';
import { useFriendStore } from '../stores/useFriendStore';
import { FriendRequestsList } from '../components/FriendRequestsList';
import { UserSearchPopover } from '../components/UserSearchPopover';
import { format } from 'date-fns';

export default function DMPage() {
    const { chatId: userIdParam } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useUserStore();

    const {
        conversations,
        fetchConversations,
        messages,
        activeConversationId,
        setActiveConversation,
        sendMessage,
        markMessagesAsRead,
        isUserOnline,
        typingUsers,
        setTyping
    } = useChatStore();

    const { incomingCount } = useFriendStore();

    // Local State
    const [sidebarTab, setSidebarTab] = useState<'messages' | 'requests'>('messages');
    const [messageInput, setMessageInput] = useState('');

    // For Chat View
    const [activeUser, setActiveUser] = useState<User | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // -------------------------------------------------------------------------
    // RESOLVE CHAT: When userId param changes, find or create the conversation
    // -------------------------------------------------------------------------
    useEffect(() => {
        const resolveChat = async () => {
            if (!userIdParam || !currentUser) {
                setActiveUser(null);
                setActiveConversation(null);
                return;
            }

            // If already active and matching, skip to avoid loops
            if (activeConversationId) {
                const isMatched = conversations.some(c =>
                    c._id === activeConversationId &&
                    c.participants.some(p => p._id === userIdParam)
                );
                if (isMatched) return;
            }

            setIsUserLoading(true);
            try {
                // 1. Fetch User Details for Header
                const userRes = await UserService.getUser(userIdParam);
                if (userRes.success) {
                    setActiveUser(userRes.data);
                }

                // 2. Check if we already have a conversation with this user locally
                let foundConv = conversations.find(c =>
                    c.participants.some(p => p._id === userIdParam)
                );

                if (!foundConv) {
                    // 3. If not, try to start/get conversation from server
                    const convRes = await ChatService.startConversation(userIdParam);
                    if (convRes?.success) {
                        foundConv = convRes.data;
                        fetchConversations(); // Sync with sidebar
                    }
                }

                if (foundConv) {
                    setActiveConversation(foundConv._id);
                } else {
                    setActiveConversation(null);
                }
            } catch (error) {
                console.error("Failed to resolve chat:", error);
            } finally {
                setIsUserLoading(false);
            }
        };

        resolveChat();
        // NOTE: We omit 'conversations' from deps to prevent infinite loops 
        // when markMessagesAsRead updates the unreadCount/updatedAt metadata.
    }, [userIdParam, setActiveConversation, fetchConversations, currentUser]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (activeConversationId && messages[activeConversationId]) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeConversationId]);

    // Auto-mark messages as read when viewing a chat
    useEffect(() => {
        if (!activeConversationId || !currentUser) return;

        const currentMsgs = messages[activeConversationId] || [];
        const unreadMessageIds = currentMsgs
            .filter(msg => {
                const isFromMe = typeof msg.senderId === 'string'
                    ? msg.senderId === currentUser._id
                    : (msg.senderId as any)?._id === currentUser._id;

                // If it's not from us, and our ID isn't in the readBy array
                return !isFromMe && (!msg.readBy || !msg.readBy.includes(currentUser._id));
            })
            .map(msg => msg._id as string)
            .filter(Boolean);

        if (unreadMessageIds.length > 0) {
            markMessagesAsRead(activeConversationId, unreadMessageIds, currentUser._id);
        }
    }, [messages, activeConversationId, currentUser, markMessagesAsRead]);



    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeConversationId) return;

        const content = messageInput;
        setMessageInput('');

        await sendMessage(content);
    };

    // Emit typing events on input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);
        if (activeConversationId && e.target.value.trim()) {
            setTyping(activeConversationId, true);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // -------------------------------------------------------------------------
    // Sidebar (shared between both views)
    // -------------------------------------------------------------------------
    const renderSidebar = () => {
        const sidebarClasses = userIdParam
            ? "hidden lg:flex w-80 shrink-0"
            : "flex w-full lg:w-80 shrink-0";

        return (
            <div className={`${sidebarClasses} bg-white border border-slate-200 rounded-2xl flex-col overflow-hidden shadow-sm`}>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Messages</h2>
                    <UserSearchPopover />
                </div>

                <div className="flex px-4 pt-2 border-b border-slate-50">
                    <button
                        onClick={() => setSidebarTab('messages')}
                        className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${sidebarTab === 'messages' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Chats
                    </button>
                    <button
                        onClick={() => setSidebarTab('requests')}
                        className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${sidebarTab === 'requests' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Requests
                        {incomingCount > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px]">{incomingCount}</span>}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {sidebarTab === 'requests' ? (
                        <FriendRequestsList />
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {conversations.length === 0 ? (
                                <div className="p-4 text-center text-slate-400 text-sm italic">
                                    No recent chats. Start a new one!
                                </div>
                            ) : (
                                conversations.map(conv => {
                                    const otherUser = conv.participants.find(p => p._id !== currentUser?._id) || conv.participants[0];
                                    const isActive = conv._id === activeConversationId;
                                    return (
                                        <div
                                            key={conv._id}
                                            onClick={() => navigate(`/dms/${otherUser._id}`)}
                                            className={`p-4 flex gap-3 hover:bg-slate-50 cursor-pointer transition-colors ${isActive ? 'bg-blue-50/50' : ''}`}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={otherUser.profilePicture || `https://ui-avatars.com/api/?name=${otherUser.username}`}
                                                    alt={otherUser.username}
                                                    className="w-12 h-12 rounded-full bg-slate-100 object-cover"
                                                />
                                                <div className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full" style={{ backgroundColor: isUserOnline(otherUser._id) ? '#22c55e' : '#94a3b8' }}></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-semibold text-slate-900 truncate">{otherUser.fullName || otherUser.username}</h4>
                                                    {conv.lastMessage && (
                                                        <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                                            {format(new Date(conv.updatedAt), 'HH:mm')}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                                                    {conv.lastMessage?.senderId === currentUser?._id ? 'You: ' : ''}
                                                    {conv.lastMessage?.text || 'Started a conversation'}
                                                </p>
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <div className="self-center ml-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                                    {conv.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // -------------------------------------------------------------------------
    // RENDER: NO CHAT SELECTED — show sidebar + empty state
    // -------------------------------------------------------------------------
    if (!userIdParam) {
        return (
            <div className="flex h-[calc(100vh-2rem)] gap-0 lg:gap-6 p-2 sm:p-6 max-w-[1600px] mx-auto">
                {renderSidebar()}

                {/* Empty State */}
                <div className="hidden lg:flex flex-1 bg-white border border-slate-200 rounded-2xl flex-col items-center justify-center shadow-sm">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MessageCircle className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Your Messages</h3>
                        <p className="text-slate-500 text-sm max-w-xs">
                            Select a conversation from the left, or click the <strong>+</strong> icon to find and add new friends.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // RENDER: CHAT INTERFACE
    // -------------------------------------------------------------------------
    if (!activeUser && isUserLoading) {
        return (
            <div className="flex h-[calc(100vh-2rem)] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        )
    }

    if (!activeUser) return null;

    const currentMessages = activeConversationId ? messages[activeConversationId] || [] : [];

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-0 lg:gap-6 p-2 lg:p-6 max-w-[1600px] mx-auto">
            {/* Left Sidebar: Chats & Requests */}
            {renderSidebar()}

            {/* Right Side: Chat Window */}
            <div className="flex flex-1 bg-white border border-slate-200 rounded-2xl flex-col overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/dms')} className="lg:hidden p-2 -ml-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="relative">
                            <img
                                src={activeUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeUser.fullName || activeUser.username)}&background=random`}
                                alt={activeUser.username}
                                className="w-10 h-10 rounded-full bg-slate-100 object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full" style={{ backgroundColor: isUserOnline(userIdParam!) ? '#22c55e' : '#94a3b8' }}></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{activeUser.fullName || activeUser.username}</h3>
                            {(() => {
                                const convTyping = activeConversationId ? typingUsers[activeConversationId] || [] : [];
                                const otherTyping = convTyping.filter(id => id !== currentUser?._id);
                                if (otherTyping.length > 0) {
                                    return <p className="text-xs text-blue-600 font-medium animate-pulse">typing...</p>;
                                }
                                return <p className={`text-xs font-medium ${isUserOnline(userIdParam!) ? 'text-green-600' : 'text-slate-400'}`}>{isUserOnline(userIdParam!) ? 'Online' : 'Offline'}</p>;
                            })()}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <UserSearchPopover />
                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><Phone className="w-5 h-5" /></button>
                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><Video className="w-5 h-5" /></button>
                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><MoreVertical className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 bg-slate-50/50 p-6 overflow-y-auto flex flex-col gap-4">
                    {currentMessages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <p>No messages yet.</p>
                            <p className="text-sm">Say hello to start the conversation!</p>
                        </div>
                    ) : (
                        currentMessages.map((msg, idx) => {
                            const isMe = typeof msg.senderId === 'string'
                                ? msg.senderId === currentUser?._id
                                : (msg.senderId as any)?._id === currentUser?._id;

                            return (
                                <div key={msg._id || idx} className={`flex flex-col max-w-[70%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                                    <div
                                        className={`p-3 rounded-2xl text-sm shadow-sm ${isMe
                                            ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/20'
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 px-1">
                                        <span className="text-[10px] text-slate-400">
                                            {format(new Date(msg.createdAt), 'HH:mm')}
                                        </span>
                                        {isMe && (
                                            msg.readBy && msg.readBy.length > 0 ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3 text-slate-400" />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                    <div className="flex gap-4 items-center max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyPress}
                            placeholder={`Message ${activeUser.fullName || activeUser.username}...`}
                            className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!messageInput.trim()}
                            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl transition-colors shadow-lg shadow-blue-600/20 disabled:shadow-none"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
