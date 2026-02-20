
import { useEffect, useState } from 'react';
import { useFriendStore } from '../stores/useFriendStore';
import { Check, X, Loader2 } from 'lucide-react';
import { FriendRequest } from '@studymate/types';

export function FriendRequestsList() {
    const {
        incomingRequests,
        outgoingRequests,
        fetchIncoming,
        fetchOutgoing,
        acceptRequest,
        declineRequest,
        cancelRequest,
        loading
    } = useFriendStore();

    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

    useEffect(() => {
        fetchIncoming();
        fetchOutgoing();
    }, [fetchIncoming, fetchOutgoing]);

    const requests = activeTab === 'received' ? incomingRequests : outgoingRequests;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="flex border-b border-slate-100">
                <button
                    onClick={() => setActiveTab('received')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'received'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    Received {incomingRequests.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">{incomingRequests.length}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'sent'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    Sent {outgoingRequests.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{outgoingRequests.length}</span>}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {loading && requests.length === 0 ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        {activeTab === 'received' ? 'No new friend requests' : 'No sent requests'}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {requests.map((req) => (
                            <RequestItem
                                key={req._id}
                                request={req}
                                type={activeTab}
                                onAccept={acceptRequest}
                                onDecline={declineRequest}
                                onCancel={cancelRequest}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function RequestItem({
    request,
    type,
    onAccept,
    onDecline,
    onCancel
}: {
    request: FriendRequest,
    type: 'received' | 'sent',
    onAccept: (id: string) => Promise<void>,
    onDecline: (id: string) => Promise<void>,
    onCancel: (id: string) => Promise<void>
}) {
    // Type guard/assertion - in our service/store we populate sender/receiver
    // but the TS interface has string | User.
    const user = type === 'received'
        ? (request.senderId as any)
        : (request.receiverId as any);

    const [actionLoading, setActionLoading] = useState(false);

    const handle = async (fn: (id: string) => Promise<void>) => {
        setActionLoading(true);
        try {
            await fn(request._id);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
                <img
                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}`}
                    alt={user.username}
                    className="w-10 h-10 rounded-full bg-white object-cover border border-slate-200"
                />
                <div>
                    <h4 className="text-sm font-semibold text-slate-900">{user.fullName || user.username}</h4>
                    <p className="text-xs text-slate-500">@{user.username}</p>
                </div>
            </div>

            <div className="flex gap-2">
                {type === 'received' ? (
                    <>
                        <button
                            onClick={() => handle(onAccept)}
                            disabled={actionLoading}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            title="Accept"
                        >
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => handle(onDecline)}
                            disabled={actionLoading}
                            className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
                            title="Decline"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => handle(onCancel)}
                        disabled={actionLoading}
                        className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                        title="Cancel Request"
                    >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    );
}
