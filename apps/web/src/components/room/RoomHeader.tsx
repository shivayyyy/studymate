import { useRoomStore } from '../../stores/useRoomStore';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, Shield, MapPin } from 'lucide-react';

export default function RoomHeader() {
    const { roomName, subject, isFocusMode, users, leaveRoom, roomType } = useRoomStore();
    const navigate = useNavigate();

    const handleLeave = () => {
        leaveRoom();
        navigate('/rooms');
    };

    return (
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl shrink-0">
                        {roomName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-base sm:text-xl font-bold text-slate-800 flex items-center gap-2 truncate">
                            {roomName}
                            {roomType === 'PRIVATE' && <Shield size={16} className="text-amber-500 shrink-0" />}
                        </h1>
                        <span className="text-xs sm:text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {subject}
                        </span>
                    </div>
                </div>

                {isFocusMode && (
                    <div className="hidden sm:flex ml-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs sm:text-sm font-bold rounded-full items-center gap-1 animate-pulse shrink-0">
                        <MapPin size={14} /> FOCUS
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="hidden sm:flex items-center gap-2 text-slate-600 font-medium px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                    <Users size={16} className="text-blue-500" />
                    <span>{users.length}</span>
                </div>

                {/* Mobile: icon only */}
                <div className="flex sm:hidden items-center gap-1 text-slate-600 font-medium px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <Users size={14} className="text-blue-500" />
                    <span>{users.length}</span>
                </div>

                <button
                    onClick={handleLeave}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg transition-colors border border-red-100 text-sm"
                >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Leave Room</span>
                </button>
            </div>
        </header>
    );
}
