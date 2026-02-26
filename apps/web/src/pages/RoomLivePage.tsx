import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomStore } from '../stores/useRoomStore';
import RoomHeader from '../components/room/RoomHeader';
import ParticipantsList from '../components/room/ParticipantsList';
import RoomChat from '../components/room/RoomChat';
import AudioControls from '../components/room/AudioControls';
import { Users, MessageCircle } from 'lucide-react';

export default function RoomLivePage() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { joinRoom, isJoined, isLoading, error } = useRoomStore();
    const [mobileTab, setMobileTab] = useState<'main' | 'chat' | 'people'>('main');

    useEffect(() => {
        if (roomId && !isJoined && !isLoading) {
            joinRoom(roomId).catch(err => {
                console.error("Failed to join room:", err);
            });
        }

        const handleBeforeUnload = () => {
            useRoomStore.getState().leaveRoom();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            useRoomStore.getState().leaveRoom();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId]);

    // Navigate away when isJoined becomes false (after explicit leave)
    useEffect(() => {
        if (!isJoined && !isLoading && !error && !roomId) {
            navigate('/rooms');
        }
    }, [isJoined, isLoading, error, navigate, roomId]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-slate-600 font-medium">Joining Room...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md w-full">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Notice</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/rooms')}
                            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                        >
                            Back to Rooms
                        </button>
                        {error.includes("Password") && (
                            <button
                                onClick={() => joinRoom(roomId!, prompt("Enter room password:") || undefined)}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (!isJoined) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col max-h-screen overflow-hidden">
            <RoomHeader />

            {/* Desktop Layout */}
            <div className="hidden md:flex flex-1 overflow-hidden p-4 gap-4">
                {/* Left / Main Workspace */}
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0">
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-300">Live Workspace</h2>
                            <p className="text-slate-400 mt-2">Shared notes or whiteboard coming soon.</p>
                        </div>
                    </div>
                    <AudioControls />
                </div>

                {/* Right Sidebar */}
                <div className="w-80 flex flex-col gap-4 shrink-0">
                    <div className="h-1/3 min-h-[250px] bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                        <ParticipantsList />
                    </div>
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                        <RoomChat />
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex md:hidden flex-1 flex-col overflow-hidden">
                {/* Mobile Content */}
                <div className="flex-1 overflow-y-auto p-3">
                    {mobileTab === 'main' && (
                        <div className="flex flex-col gap-3">
                            <AudioControls />
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-center min-h-[120px]">
                                <div className="text-center">
                                    <h2 className="text-lg font-bold text-slate-300">Live Workspace</h2>
                                    <p className="text-slate-400 text-sm mt-1">Coming soon</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {mobileTab === 'people' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[300px]">
                            <ParticipantsList />
                        </div>
                    )}
                    {mobileTab === 'chat' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
                            <RoomChat />
                        </div>
                    )}
                </div>

                {/* Mobile Bottom Tab Bar */}
                <div className="bg-white border-t border-slate-200 flex shrink-0 pb-safe">
                    <button
                        onClick={() => setMobileTab('main')}
                        className={`flex-1 py-3 flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${mobileTab === 'main' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /></svg>
                        ROOM
                    </button>
                    <button
                        onClick={() => setMobileTab('people')}
                        className={`flex-1 py-3 flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${mobileTab === 'people' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400'}`}
                    >
                        <Users size={20} strokeWidth={2.5} />
                        PEOPLE
                    </button>
                    <button
                        onClick={() => setMobileTab('chat')}
                        className={`flex-1 py-3 flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${mobileTab === 'chat' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400'}`}
                    >
                        <MessageCircle size={20} strokeWidth={2.5} />
                        CHAT
                    </button>
                </div>
            </div>
        </div>
    );
}
