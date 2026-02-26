import { Bell } from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useFriendStore } from '../stores/useFriendStore';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { NotificationsList } from './NotificationsList';

export function Header() {
    const { user } = useUserStore();
    const navigate = useNavigate();
    const { unreadCount, markAsRead } = useNotificationStore();
    const { incomingCount } = useFriendStore();

    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Close notifications if clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        if (showNotifications) {
            document.addEventListener("mousedown", handleClickOutside);
            if (unreadCount > 0) markAsRead();
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showNotifications]);

    return (
        <>
            {/* Context Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 lg:hidden bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <h1 className="text-lg font-black text-slate-900 tracking-tight lg:hidden">StudyMate</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group" ref={showNotifications ? notificationRef : null}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                        >
                            <Bell size={20} strokeWidth={showNotifications ? 2.5 : 2} />
                            {(unreadCount > 0 || incomingCount > 0) && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                    {unreadCount + incomingCount > 9 ? '9+' : unreadCount + incomingCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown Tray */}
                        {showNotifications && (
                            <div className="absolute right-0 top-12 w-[380px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden">
                                <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
                                    <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    <NotificationsList />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/profile')}>
                        <div className="text-right">
                            <h4 className="font-bold text-sm text-slate-900">{user?.fullName || 'Guest'}</h4>
                            <p className="text-xs text-slate-500">{user?.username ? `@${user.username}` : ''}</p>
                        </div>
                        <img
                            src={user?.profilePicture || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                        />
                    </div>

                    {/* Mobile Profile Icon */}
                    <img
                        src={user?.profilePicture || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
                        alt="Profile"
                        className="w-8 h-8 sm:hidden rounded-full border border-slate-200 cursor-pointer object-cover"
                        onClick={() => navigate('/profile')}
                    />
                </div>
            </header>
        </>
    );
}
