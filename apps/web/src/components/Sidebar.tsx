import { LayoutGrid, Users, BarChart2, Medal, Settings, Mail, MessageCircle, User } from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import { useChatStore } from '../stores/useChatStore';
import { NavLink } from 'react-router-dom';
import { useEffect } from 'react';

const navItems = [
    { to: '/feed', icon: LayoutGrid, label: 'Feed' },
    { to: '/rooms', icon: Users, label: 'Rooms' },
    { to: '/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/dms', icon: window.matchMedia('(prefers-color-scheme: dark)').matches ? Mail : MessageCircle, label: 'Messages' },
    { to: '/profile', icon: Medal, label: 'Profile' },
];

export default function Sidebar() {
    const { user } = useUserStore();
    const { conversations, fetchConversations } = useChatStore();

    useEffect(() => {
        fetchConversations();

        const interval = setInterval(() => {
            fetchConversations();
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchConversations]);

    const totalUnreadMessages = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

    return (
        <aside className="fixed bottom-0 left-0 right-0 md:sticky md:top-0 h-16 md:h-screen md:w-20 bg-white/80 backdrop-blur-md md:bg-white border-t md:border-t-0 md:border-r border-slate-200 flex flex-row md:flex-col items-center md:py-6 px-4 md:px-0 z-50">
            {/* Logo - Desktop only */}
            <div className="hidden md:flex w-10 h-10 bg-blue-600 rounded-xl items-center justify-center mb-10 shadow-lg shadow-blue-600/20 cursor-pointer hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl">S</span>
            </div>

            {/* Navigation */}
            <nav className="flex flex-row md:flex-col gap-2 md:gap-6 w-full px-0 md:px-2 justify-around md:justify-start">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        className={({ isActive }) =>
                            `p-3 rounded-xl flex justify-center transition-all duration-300 group relative ${isActive
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className="relative">
                                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                    {item.label === 'Messages' && totalUnreadMessages > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                            {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                                        </span>
                                    )}
                                </div>
                                {isActive && (
                                    <div className="absolute left-0 right-0 bottom-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 h-1 md:h-8 w-full md:w-1 bg-blue-600 rounded-t-full md:rounded-r-full" />
                                )}

                                {/* Tooltip - Desktop only */}
                                <span className="hidden md:block absolute left-16 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions - Desktop only */}
            <div className="hidden md:flex mt-auto flex-col gap-6 w-full px-2">
                <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl flex justify-center transition-colors">
                    <Settings size={24} />
                </button>
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-500 to-indigo-600 p-0.5 mx-auto cursor-pointer shrink-0 hover:scale-105 transition-transform relative group">
                    {user ? (
                        <img
                            src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
                            alt="Profile"
                            className="w-full h-full rounded-full bg-white object-cover"
                        />
                    ) : (
                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <User size={20} />
                        </div>
                    )}
                    {user && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>}
                </div>
            </div>
        </aside>
    );
}
