import { useState, useEffect } from 'react';
import { useRoomStore } from '../../stores/useRoomStore';
import { useUserStore } from '../../stores/useUserStore';
import { api } from '../../lib/axios';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useLocalParticipant,
    useConnectionState
} from '@livekit/components-react';
import { Mic, MicOff, Settings2, Ear, Focus, AlertTriangle, X, Clock } from 'lucide-react';

// Helper: format milliseconds to MM:SS
const formatMsToTime = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Inner component to access LiveKit context
const AudioParticipantControls = () => {
    const {
        isMuted, toggleMute,
        isFocusMode, isPersonalFocusMode, toggleFocusMode,
        ownerId,
        micTimeUsedMs, micTimeLimitMs, micTimeWarning, dismissMicWarning,
    } = useRoomStore();
    const { user } = useUserStore();
    const { localParticipant } = useLocalParticipant();
    const connectionState = useConnectionState();
    const isOwner = user?._id === ownerId;

    const isMicDisabled = isFocusMode || isPersonalFocusMode;

    // Sync LiveKit local track with our global Zustand store state
    useEffect(() => {
        if (localParticipant) {
            if (isMuted || isMicDisabled) {
                localParticipant.setMicrophoneEnabled(false);
            } else {
                localParticipant.setMicrophoneEnabled(true);
            }
        }
    }, [isMuted, isMicDisabled, localParticipant]);

    // Mic time progress (0 to 1)
    const micTimeProgress = micTimeLimitMs ? Math.min(1, micTimeUsedMs / micTimeLimitMs) : 0;
    const showMicTimeBar = micTimeLimitMs !== null && micTimeLimitMs > 0 && !isPersonalFocusMode;

    return (
        <div className="space-y-3">
            {/* Warning Banner — mic time exceeded */}
            {micTimeWarning && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold">Mic Time Limit Reached</p>
                        <p className="text-xs mt-0.5 opacity-80">{micTimeWarning}</p>
                    </div>
                    <button
                        onClick={dismissMicWarning}
                        className="text-amber-400 hover:text-amber-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Personal Focus Mode Indicator */}
            {isPersonalFocusMode && !isFocusMode && (
                <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-purple-700">
                    <Focus size={16} />
                    <span className="text-xs font-bold">Personal Focus Mode — mic disabled due to time limit</span>
                </div>
            )}

            {/* Mic Time Progress Bar */}
            {showMicTimeBar && (
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400 shrink-0" />
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${micTimeProgress > 0.8 ? 'bg-red-400' :
                                micTimeProgress > 0.5 ? 'bg-amber-400' : 'bg-blue-400'
                                }`}
                            style={{ width: `${micTimeProgress * 100}%` }}
                        />
                    </div>
                    <span className="text-xs text-slate-500 font-mono tabular-nums shrink-0">
                        {formatMsToTime(micTimeUsedMs)} / {formatMsToTime(micTimeLimitMs!)}
                    </span>
                </div>
            )}

            {/* Main Controls Row */}
            <div className="flex flex-wrap items-center justify-between w-full gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleMute}
                        disabled={isMicDisabled || connectionState !== 'connected'}
                        className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all shadow-md
                            ${isMicDisabled
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200'
                                : isMuted
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200 border-2 border-red-200'
                                    : 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/30'
                            } disabled:opacity-50`}
                    >
                        {isMuted || isMicDisabled ? <MicOff size={20} className="sm:size-6" /> : <Mic size={20} className="sm:size-6" />}
                    </button>

                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">
                            {isPersonalFocusMode
                                ? 'Muted (Time Limit)'
                                : isFocusMode
                                    ? 'Muted (Focus Mode)'
                                    : isMuted ? 'Microphone Off' : 'Microphone On'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${connectionState === 'connected' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                            {connectionState === 'connected' ? 'Connected to Audio' : 'Connecting...'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                    {isOwner && (
                        <button
                            onClick={toggleFocusMode}
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-bold transition-colors border shadow-sm text-xs sm:text-sm
                                ${isFocusMode
                                    ? 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <Focus size={16} className="sm:size-4.5" />
                            {isFocusMode ? 'Focus On' : 'Focus Mode'}
                        </button>
                    )}

                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <Settings2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AudioControls() {
    const { roomId, audioAvailable, isFocusMode, isPersonalFocusMode } = useRoomStore();
    const [token, setToken] = useState<string | null>(null);
    useEffect(() => {
        const fetchToken = async () => {
            if (!roomId) return;
            try {
                const res = await api.get(`/rooms/${roomId}/audio-token`);
                if (res.data.success) {
                    setToken(res.data.data.token);
                }
            } catch (err) {
                console.error("Failed to fetch LiveKit token", err);
            }
        };

        if (roomId && audioAvailable) {
            fetchToken();
        } else {
            setToken(null);
        }
    }, [roomId, audioAvailable]);

    const serverUrl = import.meta.env.VITE_LIVEKIT_URL || "wss://studymate-dev-xxxx.livekit.cloud";

    if (!audioAvailable) {
        return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4 text-slate-400">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <Ear size={20} className="opacity-50" />
                </div>
                <div>
                    <p className="font-semibold text-sm">Room Audio Disabled</p>
                    <p className="text-xs">Audio is not available for this room currently.</p>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 animate-pulse">
                <div className="w-14 h-14 bg-slate-100 rounded-full"></div>
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-xl p-4 border transition-colors shadow-sm
            ${isPersonalFocusMode
                ? 'bg-amber-50/50 border-amber-100'
                : isFocusMode
                    ? 'bg-purple-50/50 border-purple-100'
                    : 'bg-white border-slate-200'
            }`}
        >
            <LiveKitRoom
                video={false}
                audio={true}
                token={token}
                serverUrl={serverUrl}
                connect={true}
            >
                <RoomAudioRenderer />
                <AudioParticipantControls />
            </LiveKitRoom>
        </div>
    );
}

