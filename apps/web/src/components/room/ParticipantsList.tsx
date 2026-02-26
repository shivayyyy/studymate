import { useRoomStore } from '../../stores/useRoomStore';
import { useUserStore } from '../../stores/useUserStore';
import { Crown, Mic, MicOff, MoreVertical } from 'lucide-react';
import { PresenceStatus } from '@studymate/types';

export default function ParticipantsList() {
    const { users, ownerId } = useRoomStore();
    const { user: currentUser } = useUserStore();

    const getPresenceColor = (status: PresenceStatus) => {
        switch (status) {
            case PresenceStatus.ONLINE: return 'bg-green-500';
            case PresenceStatus.IDLE: return 'bg-amber-500';
            case PresenceStatus.OFFLINE: return 'bg-slate-300';
            default: return 'bg-slate-300';
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700 text-sm flex justify-between items-center">
                <span>Participants ({users.length})</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {users.map(user => {
                    const isMe = user.userId === currentUser?._id;
                    const isOwner = user.userId === ownerId;

                    return (
                        <div key={user.userId} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg group">
                            <div className="flex items-center gap-3 w-full pr-2">
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                                        {user.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${getPresenceColor(user.presence)}`}></div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-800 truncate flex items-center gap-1.5">
                                        {user.username} {isMe && <span className="text-xs text-slate-400 font-normal">(You)</span>}
                                        {isOwner && <Crown size={12} className="text-amber-500 shrink-0" />}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {user.isMuted ? (
                                    <MicOff size={16} className="text-red-400" />
                                ) : (
                                    <div className="relative flex items-center justify-center">
                                        <Mic size={16} className="text-green-500 z-10" />
                                        <div className="absolute w-full h-full bg-green-500/20 rounded-full animate-ping"></div>
                                    </div>
                                )}

                                {isMe && isOwner && users.length > 1 && (
                                    <button className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
