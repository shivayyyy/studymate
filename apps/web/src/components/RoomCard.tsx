import React, { useMemo } from 'react';
import { Users, Lock, Unlock, Clock, ArrowRight, BookOpen } from 'lucide-react';

export interface Room {
    _id: string;
    name: string;
    description?: string;
    type: 'PUBLIC' | 'PRIVATE';
    examCategory: string; // 'JEE' | 'NEET' | 'UPSC' | 'GATE'
    subject: string;
    timerMode: string;
    currentOccupancy: number;
    maxOccupancy: number;
    createdBy: {
        _id: string;
        username: string;
        fullName: string;
        profilePicture?: string;
    };
}

interface RoomCardProps {
    room: Room;
    onJoin: (room: Room) => void;
}

const getGradient = (str: string) => {
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Deep Purple/Blue
        'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)', // Vivid Blue
        'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)', // Peach/Pink
        'linear-gradient(135deg, #FCCF31 0%, #F55555 100%)', // Sunny Orange/Red
        'linear-gradient(135deg, #43CBFF 0%, #9708CC 100%)', // Electric Blue/Purple
        'linear-gradient(135deg, #F6D242 0%, #FF52E5 100%)', // Golden/Magenta
        'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)', // Aqua/Mint
        'linear-gradient(135deg, #8EC5FC 0%, #E0C3FC 100%)', // Pastel Blue/Purple
    ];

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    return gradients[Math.abs(hash) % gradients.length];
};

const RoomCard: React.FC<RoomCardProps> = ({ room, onJoin }) => {
    const isFull = room.currentOccupancy >= room.maxOccupancy;

    const gradient = useMemo(() => getGradient(room.name + room.subject), [room.name, room.subject]);

    const timerLabel = useMemo(() => {
        switch (room.timerMode) {
            case 'POMODORO_25_5': return 'Pomodoro';
            case 'EXTENDED_45_10': return 'Extended';
            case 'LONG_90_20': return 'Deep Work';
            default: return 'Custom';
        }
    }, [room.timerMode]);

    return (
        <div className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-ml hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800 flex flex-col h-full">
            {/* Gradient Cover */}
            <div
                className="h-36 w-full relative p-5 flex flex-col justify-end"
                style={{ background: gradient }}
            >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />

                {/* Glass Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/10 shadow-sm flex items-center gap-1.5">
                        <BookOpen size={12} /> {room.examCategory}
                    </span>
                </div>

                <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-lg backdrop-blur-md text-xs font-bold border shadow-sm flex items-center gap-1.5 ${room.type === 'PRIVATE'
                        ? 'bg-amber-500/20 text-amber-50 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-50 border-emerald-500/30'
                        }`}>
                        {room.type === 'PRIVATE' ? <Lock size={12} /> : <Unlock size={12} />}
                        {room.type === 'PRIVATE' ? 'Private' : 'Public'}
                    </span>
                </div>

                {/* Unique Banner Title */}
                <h3 className="relative z-0 text-2xl font-black text-white leading-tight drop-shadow-md line-clamp-2 pr-2 mb-2">
                    {room.name}
                </h3>
            </div>

            {/* Content */}
            <div className="p-5 pt-4 relative flex-1 flex flex-col">
                {/* Row: Avatar + Host Info + Subject */}
                <div className="flex justify-between items-start mb-6">
                    {/* Left: Avatar & Host */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img
                                src={room.createdBy?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.createdBy?.fullName || 'User')}&background=random`}
                                alt={room.createdBy?.username}
                                className="w-12 h-12 rounded-xl border-2 border-white dark:border-slate-900 shadow-md object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900" title="Online"></div>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hosted by</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">@{room.createdBy?.username}</p>
                        </div>
                    </div>

                    {/* Right: Subject */}
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Subject</p>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md inline-block">
                            {room.subject}
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-5 mt-auto">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                            <Users size={12} /> <span>Occupancy</span>
                        </div>
                        <div className={`font-bold ${isFull ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                            {room.currentOccupancy} <span className="text-slate-400 text-xs font-normal">/ {room.maxOccupancy}</span>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                            <Clock size={12} /> <span>Timer</span>
                        </div>
                        <div className="font-bold text-slate-700 dark:text-slate-300 truncate">
                            {timerLabel}
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => onJoin(room)}
                    disabled={isFull}
                    className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300 ${isFull
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-95'
                        }`}
                >
                    {isFull ? (
                        'Room Full'
                    ) : (
                        <>
                            Join Session <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default RoomCard;
