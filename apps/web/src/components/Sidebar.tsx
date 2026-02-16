import { NavLink } from 'react-router-dom';
import { LayoutGrid, Users, BarChart2, Medal, Settings, Mail, MessageCircle, Bell } from 'lucide-react';

const navItems = [
    { to: '/feed', icon: LayoutGrid, label: 'Feed' },
    { to: '/rooms', icon: Users, label: 'Rooms' },
    { to: '/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/dms', icon: window.matchMedia('(prefers-color-scheme: dark)').matches ? Mail : MessageCircle, label: 'Messages' }, // Using conditional icon just for example, but better to stick to one. Let's use MessageCircle for consistency with other line icons.
    { to: '/profile', icon: Medal, label: 'Profile' },
];

export default function Sidebar() {
    return (
        <aside className="sticky top-0 h-screen w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 z-50">
            {/* Logo */}
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-10 shadow-lg shadow-blue-600/20 cursor-pointer hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl">S</span>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-6 w-full px-2">
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
                                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                                )}

                                {/* Tooltip */}
                                <span className="absolute left-16 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto flex flex-col gap-6 w-full px-2">
                <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl flex justify-center transition-colors relative">
                    <Bell size={24} />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl flex justify-center transition-colors">
                    <Settings size={24} />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5 mx-auto cursor-pointer hover:scale-105 transition-transform relative">
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                        alt="Profile"
                        className="w-full h-full rounded-full bg-white object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
            </div>
        </aside>
    );
}
