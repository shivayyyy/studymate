import { Search, MoreVertical, Phone, Video, Send, ArrowLeft, Circle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

// Mock Data for Online Users
const ONLINE_USERS = [
    { id: '1', name: 'Aarav Patel', subject: 'Physics', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav' },
    { id: '2', name: 'Sneha Gupta', subject: 'Organic Chem', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha' },
    { id: '3', name: 'Rohan Kumar', subject: 'Calculus', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan' },
    { id: '4', name: 'Priya Sharma', subject: 'Biology', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
    { id: '5', name: 'Vikram Singh', subject: 'History', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram' },
    { id: '6', name: 'Ananya Das', subject: 'Economics', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya' },
    { id: '7', name: 'Karan Malhotra', subject: 'CS Fundamentals', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karan' },
    { id: '8', name: 'Ishaan Verma', subject: 'GATE Prep', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ishaan' },
];

export default function DMPage() {
    const { chatId } = useParams();
    const navigate = useNavigate();

    // -------------------------------------------------------------------------
    // VIEW 1: ONLINE USERS DIRECTORY (No Chat ID)
    // -------------------------------------------------------------------------
    if (!chatId) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-2rem)]">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Online Students</h1>
                        <p className="text-slate-500 mt-1">Found {ONLINE_USERS.length} students studying right now</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 shadow-sm w-64"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {ONLINE_USERS.map((user) => (
                        <div
                            key={user.id}
                            onClick={() => navigate(`/dms/${user.id}`)}
                            className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                        >
                            <div className="relative mb-4">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-20 h-20 rounded-full bg-slate-50 object-cover border-4 border-white shadow-sm group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">{user.name}</h3>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mt-2">
                                <Circle className="w-2 h-2 fill-current" />
                                Studying {user.subject}
                            </span>
                            <button className="mt-6 w-full py-2 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold rounded-xl transition-all text-sm">
                                Message
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // VIEW 2: CHAT INTERFACE (With Chat ID)
    // -------------------------------------------------------------------------
    // Find active user mock data
    const activeUser = ONLINE_USERS.find(u => u.id === chatId) || ONLINE_USERS[0];

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-6 p-6 max-w-[1600px] mx-auto">
            {/* Left Sidebar: Recent Chats (Hidden on mobile if needed, but keeping simple for now) */}
            <div className="hidden lg:flex w-80 bg-white border border-slate-200 rounded-2xl flex-col overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                    <button onClick={() => navigate('/dms')} className="p-2 -ml-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">Messages</h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {ONLINE_USERS.slice(0, 5).map((user) => (
                        <div
                            key={user.id}
                            onClick={() => navigate(`/dms/${user.id}`)}
                            className={`p-4 flex gap-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 ${user.id === chatId ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''}`}
                        >
                            <div className="relative">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-full bg-white object-cover border border-slate-200"
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`font-semibold truncate ${user.id === chatId ? 'text-blue-700' : 'text-slate-900'}`}>{user.name}</h3>
                                    <span className="text-xs text-slate-400">12:30 PM</span>
                                </div>
                                <p className="text-sm text-slate-500 truncate">Let's solve that problem...</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side: Chat Window */}
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/dms')} className="lg:hidden p-2 -ml-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="relative">
                            <img
                                src={activeUser.avatar}
                                alt={activeUser.name}
                                className="w-10 h-10 rounded-full bg-slate-100 object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{activeUser.name}</h3>
                            <p className="text-xs text-green-600 font-medium">Online • {activeUser.subject}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><Phone className="w-5 h-5" /></button>
                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><Video className="w-5 h-5" /></button>
                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><MoreVertical className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 bg-slate-50/50 p-6 overflow-y-auto flex flex-col gap-4">
                    <div className="self-center bg-slate-200 text-slate-500 text-xs px-3 py-1 rounded-full mb-4">Today</div>

                    <div className="self-start max-w-[70%] bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm text-slate-700 text-sm">
                        Hey! I saw you're studying {activeUser.subject}. Can we discuss a few topics?
                    </div>
                    <div className="self-end max-w-[70%] bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm shadow-blue-500/20 text-sm">
                        Sure! I'm active right now. What's on your mind?
                    </div>
                    <div className="self-start max-w-[70%] bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm text-slate-700 text-sm">
                        I was stuck on the module 3 concepts.
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                    <div className="flex gap-4 items-center max-w-4xl mx-auto">
                        <input
                            type="text"
                            placeholder={`Message ${activeUser.name}...`}
                            className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                        <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg shadow-blue-600/20">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
