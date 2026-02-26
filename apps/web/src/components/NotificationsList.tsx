import { useEffect, useState } from 'react';
import { useFriendStore } from '../stores/useFriendStore';
import { useNotificationStore, INotification } from '../stores/useNotificationStore';
import { Check, X, Loader2, Heart, MessageCircle, UserPlus, UserCheck } from 'lucide-react';
import { FriendRequest } from '@studymate/types';
import { formatDistanceToNow } from 'date-fns';

export function NotificationsList() {
    const {
        incomingRequests,
        fetchIncoming,
        acceptRequest,
        declineRequest,
        loading: friendLoading
    } = useFriendStore();

    const {
        notifications,
        fetchNotifications,
        loading: notifLoading
    } = useNotificationStore();

    useEffect(() => {
        fetchIncoming();
        fetchNotifications();
    }, [fetchIncoming, fetchNotifications]);

    const loading = friendLoading || notifLoading;

    // Combine incoming friend requests with other notifications
    // We treat incomingRequests as a special type of interactive notification
    const unifiedList = [
        ...incomingRequests.map(req => ({ type: 'PENDING_FRIEND_REQUEST', data: req, date: new Date(req.createdAt).getTime() })),
        ...notifications.map(notif => ({ type: 'SYSTEM_NOTIFICATION', data: notif, date: new Date(notif.createdAt).getTime() }))
    ].sort((a, b) => b.date - a.date);

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Recent Notifications</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {loading && unifiedList.length === 0 ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                ) : unifiedList.length === 0 ? (
                    <div className="text-center py-12 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium pb-1">No new notifications</p>
                        <p className="text-xs text-slate-400">When you receive likes, comments, or friend requests, they'll show up here.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {unifiedList.map((item) => (
                            item.type === 'PENDING_FRIEND_REQUEST' ? (
                                <FriendRequestItem
                                    key={`req-${(item.data as FriendRequest)._id}`}
                                    request={item.data as FriendRequest}
                                    onAccept={acceptRequest}
                                    onDecline={declineRequest}
                                />
                            ) : (
                                <SystemNotificationItem
                                    key={`notif-${(item.data as INotification)._id}`}
                                    notification={item.data as INotification}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import { Bell } from 'lucide-react'; // Added import for empty state

function SystemNotificationItem({ notification }: { notification: INotification }) {
    const sender = notification.senderId;

    let icon = <Bell className="w-4 h-4 text-slate-400" />;
    let text = "interacted with you";
    let bgColor = "bg-slate-100";

    if (notification.type === 'LIKE_POST') {
        icon = <Heart className="w-4 h-4 text-red-500" fill="currentColor" />;
        text = "liked your post.";
        bgColor = "bg-red-50";
    } else if (notification.type === 'COMMENT_POST') {
        icon = <MessageCircle className="w-4 h-4 text-blue-500" fill="currentColor" />;
        text = "commented on your post.";
        bgColor = "bg-blue-50";
    } else if (notification.type === 'FRIEND_ACCEPT') {
        icon = <UserCheck className="w-4 h-4 text-green-500" />;
        text = "accepted your friend request.";
        bgColor = "bg-green-50";
    } else if (notification.type === 'FRIEND_REQUEST') {
        icon = <UserPlus className="w-4 h-4 text-indigo-500" />;
        text = "sent you a friend request.";
        bgColor = "bg-indigo-50";
    }

    return (
        <div className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${!notification.isRead ? 'bg-blue-50/30' : 'bg-transparent hover:bg-slate-50'}`}>
            <div className="relative shrink-0">
                <img
                    src={sender.profilePicture || `https://ui-avatars.com/api/?name=${sender.username}`}
                    alt={sender.username}
                    className="w-10 h-10 rounded-full bg-slate-200 object-cover"
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${bgColor}`}>
                    {icon}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 leading-tight">
                    <span className="font-semibold text-slate-900 mr-1">{sender.fullName || sender.username}</span>
                    {text}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
            </div>
            {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
            )}
        </div>
    );
}

function FriendRequestItem({
    request,
    onAccept,
    onDecline,
}: {
    request: FriendRequest,
    onAccept: (id: string) => Promise<void>,
    onDecline: (id: string) => Promise<void>,
}) {
    const user = request.senderId as any;
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
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100">
            <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                    <img
                        src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}`}
                        alt={user.username}
                        className="w-10 h-10 rounded-full bg-slate-200 object-cover border border-slate-200"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white bg-indigo-50 text-indigo-500">
                        <UserPlus className="w-3 h-3" />
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-900">{user.fullName || user.username}</h4>
                    <p className="text-xs text-slate-500">Sent you a friend request</p>
                </div>
            </div>

            <div className="flex gap-2 shrink-0">
                <button
                    onClick={() => handle(onAccept)}
                    disabled={actionLoading}
                    className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    title="Accept"
                >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                    onClick={() => handle(onDecline)}
                    disabled={actionLoading}
                    className="p-1.5 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
                    title="Decline"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
