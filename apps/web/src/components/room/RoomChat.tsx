import { useState, useRef, useEffect } from 'react';
import { useRoomStore } from '../../stores/useRoomStore';
import { useUserStore } from '../../stores/useUserStore';
import { Send, Hash } from 'lucide-react';

export default function RoomChat() {
    const { messages, sendChatMessage, setTyping, typingUsers } = useRoomStore();
    const { user } = useUserStore();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingUsers]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);

        // Handle Typing Indicator
        setTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
        }, 2000);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            sendChatMessage(inputValue);
            setInputValue('');
            setTyping(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }
    };

    const displayTypingUsers = typingUsers.filter(u => u !== user?.username);

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700 text-sm flex items-center gap-2">
                <Hash size={16} className="text-slate-400" />
                <span>Room Chat</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm text-center px-4">
                        Welcome to the room chat! Messages are now persistent.
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.userId === user?._id;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && <span className="text-xs text-slate-500 font-medium ml-1 mb-1">{msg.username}</span>}
                                <div className={`px-3 py-2 rounded-2xl max-w-[85%] wrap-break-word text-sm ${isMe
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })
                )}

                {displayTypingUsers.length > 0 && (
                    <div className="text-xs text-slate-400 italic flex items-center py-1">
                        {displayTypingUsers.join(', ')} {displayTypingUsers.length > 1 ? 'are' : 'is'} typing<span className="animate-pulse">...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-slate-50">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInput}
                        placeholder="Type a message..."
                        className="w-full bg-white border border-slate-200 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="absolute right-1.5 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
}
