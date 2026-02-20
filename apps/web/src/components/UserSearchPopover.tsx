import { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, X, Circle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../services/user.service';
import { User, useUserStore } from '../stores/useUserStore';
import { useDebounce } from '../hooks/useDebounce';
import { FriendRequestButton } from './FriendRequestButton';
import { useFriendStore } from '../stores/useFriendStore';

function UserResultCard({ user }: { user: User }) {
    const navigate = useNavigate();
    const { getStatus } = useFriendStore();
    const [status, setStatus] = useState<string>('loading');

    useEffect(() => {
        let mounted = true;
        getStatus(user._id).then(s => {
            if (mounted) setStatus(s.status);
        });
        return () => { mounted = false; };
    }, [user._id, getStatus]);

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <img
                src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username)}&background=random`}
                alt={user.username}
                className="w-10 h-10 rounded-full bg-slate-100 object-cover border border-slate-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 truncate">{user.fullName || user.username}</h4>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 truncate">@{user.username}</span>
                    {user.examCategory && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold shrink-0">
                            <Circle className="w-1.5 h-1.5 fill-current" />
                            {user.examCategory}
                        </span>
                    )}
                </div>
            </div>
            <div className="shrink-0" onClick={e => e.stopPropagation()}>
                {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                ) : status === 'friends' ? (
                    <button
                        onClick={() => navigate(`/dms/${user._id}`)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-lg transition-all"
                    >
                        Message
                    </button>
                ) : (
                    <FriendRequestButton
                        userId={user._id}
                        className="text-xs px-3! py-1.5!"
                        onStatusChange={s => setStatus(s)}
                    />
                )}
            </div>
        </div>
    );
}

export function UserSearchPopover() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user: currentUser } = useUserStore();
    const debouncedSearch = useDebounce(searchQuery, 300);
    const popoverRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        }
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setSearchQuery('');
            setUsers([]);
        }
    }, [isOpen]);

    // Search users
    useEffect(() => {
        if (!isOpen) return;

        const fetchUsers = async () => {
            const query = debouncedSearch || (currentUser?.examCategory || '');
            if (!query) return;
            setIsLoading(true);
            try {
                const res = await UserService.searchUsers(query);
                if (res.success) {
                    setUsers(res.data.filter(u => u._id !== currentUser?._id));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        if (currentUser) fetchUsers();
    }, [debouncedSearch, currentUser, isOpen]);

    return (
        <div className="relative" ref={popoverRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-400'}`}
                title="Find & Add Friends"
            >
                <UserPlus className="w-5 h-5" />
            </button>

            {/* Popover Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-slate-900 text-sm">Find Friends</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search by username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 placeholder:text-slate-400 transition-all"
                            />
                        </div>
                    </div>

                    {/* Results */}
                    <div className="max-h-80 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                {searchQuery ? 'No students found' : 'Type to search for students'}
                            </div>
                        ) : (
                            <div className="p-2">
                                {users.map(user => (
                                    <UserResultCard key={user._id} user={user} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
