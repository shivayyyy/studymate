
import { useState, useEffect } from 'react';
import { UserPlus, UserCheck, UserX, Clock, Loader2 } from 'lucide-react';
import { useFriendStore } from '../stores/useFriendStore';
import { RelationshipStatus } from '@studymate/types';

interface FriendRequestButtonProps {
    userId: string;
    className?: string;
    onStatusChange?: (status: RelationshipStatus['status']) => void;
}

export function FriendRequestButton({ userId, className = '', onStatusChange }: FriendRequestButtonProps) {
    const {
        getStatus,
        sendRequest,
        acceptRequest,
        declineRequest,
        cancelRequest,
        unfriend
    } = useFriendStore();

    const [status, setStatus] = useState<RelationshipStatus>({ status: 'none' });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        const fetchStatus = async () => {
            try {
                const res = await getStatus(userId);
                if (mounted) {
                    setStatus(res);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Failed to fetch friend status', error);
                if (mounted) setLoading(false);
            }
        };

        fetchStatus();

        return () => { mounted = false; };
    }, [userId, getStatus]);

    const handleAction = async (action: () => Promise<void>) => {
        setActionLoading(true);
        try {
            await action();
            // Re-fetch status to be sure, or optimistically update if we had full payload
            const res = await getStatus(userId);
            setStatus(res);
            if (onStatusChange && res.status) onStatusChange(res.status);
        } catch (error) {
            console.error('Action failed', error);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <button className={`p-2 rounded-xl bg-slate-50 text-slate-400 ${className}`} disabled>
                <Loader2 className="w-5 h-5 animate-spin" />
            </button>
        );
    }

    if (status.status === 'friends') {
        return (
            <button
                onClick={() => {
                    if (confirm('Are you sure you want to remove this friend?')) {
                        handleAction(() => unfriend(userId));
                    }
                }}
                disabled={actionLoading}
                className={`flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-colors ${className} group`}
            >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                        <UserCheck className="w-4 h-4 group-hover:hidden" />
                        <UserX className="w-4 h-4 hidden group-hover:block" />
                        <span className="group-hover:hidden">Friends</span>
                        <span className="hidden group-hover:inline">Unfriend</span>
                    </>
                )}
            </button>
        );
    }

    if (status.status === 'pending_sent') {
        return (
            <button
                onClick={() => handleAction(() => cancelRequest(status.requestId))}
                disabled={actionLoading}
                className={`flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-colors ${className} group`}
            >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                        <Clock className="w-4 h-4" />
                        <span className="group-hover:hidden">Requested</span>
                        <span className="hidden group-hover:inline">Cancel</span>
                    </>
                )}
            </button>
        );
    }

    if (status.status === 'pending_received') {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <button
                    onClick={() => handleAction(() => acceptRequest(status.requestId))}
                    disabled={actionLoading}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
                >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <>
                            <UserCheck className="w-4 h-4" />
                            Accept
                        </>
                    )}
                </button>
                <button
                    onClick={() => handleAction(() => declineRequest(status.requestId))}
                    disabled={actionLoading}
                    className="px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                >
                    <UserX className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => handleAction(() => sendRequest(userId))}
            disabled={actionLoading}
            className={`flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition-colors ${className}`}
        >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                    <UserPlus className="w-4 h-4" />
                    Add Friend
                </>
            )}
        </button>
    );
}
