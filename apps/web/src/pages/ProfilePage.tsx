import {
    Grid, Bookmark, UserSquare, Loader2, LogOut,
    BadgeCheck as Verified, Edit2, Mail, BookOpen
} from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/axios';
import { useClerk } from '@clerk/clerk-react';
import PostCard, { Post } from '../components/PostCard'; // Keep for Grid view if needed, or replace.
import FeedPost from '../components/FeedPost';

export default function ProfilePage() {
    const { user, updateUser, logout } = useUserStore();
    const navigate = useNavigate();
    const { signOut } = useClerk();

    const [loading, setLoading] = useState(true);

    // Tab State
    const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>('posts');
    const [content, setContent] = useState<Post[]>([]);
    const [loadingContent, setLoadingContent] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 10;

    // Fetch User Profile
    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                // If we already have the user, we can just set it and stop loading
                // This prevents a redundant call that might fail if auth is flaky

                setLoading(false);
                return;
            }

            try {
                // For now, fetch 'me'. Later support /users/:id
                const response = await api.get('/users/me');
                if (response.data.success) {

                    // Also update store if it's the current user
                    updateUser(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
                // If 401, the interceptor will handle it.
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user, updateUser]); // Add dependencies

    // Fetch Content (Posts/Saved)
    const fetchContent = useCallback(async (reset = false) => {
        if (!user?._id) return;
        // Prevent fetching for tagged for now
        if (activeTab === 'tagged') {
            setContent([]);
            setHasMore(false);
            return;
        }

        try {
            setLoadingContent(true);
            const currentPage = reset ? 1 : page;
            const endpoint = activeTab === 'saved' ? `/users/${user._id}/saved` : `/users/${user._id}/posts`;

            const response = await api.get(endpoint, {
                params: { page: currentPage, limit: LIMIT }
            });

            if (response.data.success) {
                const newItems = response.data.data;

                if (activeTab === 'saved') {
                    // Saved items are wrapped, we need to map to post
                    const mappedPosts = newItems.map((item: any) => ({
                        ...item.postId, // Spread the populated post
                        _id: item.postId._id // Ensure ID is correct
                    }));
                    setContent(prev => reset ? mappedPosts : [...prev, ...mappedPosts]);
                } else {
                    setContent(prev => reset ? newItems : [...prev, ...newItems]);
                }

                setHasMore(newItems.length === LIMIT);
                if (!reset) setPage(prev => prev + 1);
            }
        } catch (error) {
            console.error(`Failed to fetch ${activeTab}`, error);
        } finally {
            setLoadingContent(false);
        }
    }, [activeTab, user?._id, page]);

    // Initial Fetch when tab changes or user loads
    useEffect(() => {
        if (user?._id) {
            setPage(1);
            setHasMore(true);
            setContent([]);
            fetchContent(true);
        }
    }, [activeTab, user?._id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4">
                <p className="text-slate-500">User not found.</p>
                <button onClick={() => navigate('/login')} className="text-blue-600 font-bold hover:underline">Go to Login</button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-slate-900">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Profile & Stats */}
                <aside className="w-full lg:w-1/3 flex flex-col gap-6">
                    {/* Profile Header */}
                    <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center text-center shadow-sm relative">
                        {/* Logout Button */}
                        <button
                            onClick={async () => {
                                logout();
                                await signOut();
                                navigate('/login');
                            }}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>

                        <div className="relative group">
                            <img
                                alt={user.fullName}
                                className="w-[120px] h-[120px] rounded-full object-cover border-4 border-white shadow-lg bg-gray-200"
                                src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
                            />
                            {user.isVerified && (
                                <div className={`absolute -bottom-2 -right-2 border-4 border-white rounded-full flex items-center justify-center w-8 h-8 bg-blue-500 shadow-md`}>
                                    <Verified className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex flex-col items-center">
                            <div className="flex items-center gap-1.5">
                                <h1 className="text-2xl font-bold text-slate-900">{user.fullName}</h1>
                                {user.isVerified && <Verified className="text-blue-500 w-5 h-5" fill="currentColor" stroke="white" />}
                            </div>
                            <span className="text-slate-500 font-medium text-sm">@{user.username}</span>
                        </div>

                        <p className="text-slate-500 mt-2 font-medium text-sm leading-relaxed px-4">{(user as any).bio || "No bio yet."}</p>

                        <div className="mt-4 flex items-center gap-6 text-sm font-medium text-slate-600">
                            <div><span className="font-bold text-slate-900">{(user as any).postsCount || 0}</span> Posts</div>
                            <div><span className="font-bold text-slate-900">{(user as any).followersCount || 0}</span> Followers</div>
                            <div><span className="font-bold text-slate-900">{(user as any).followingCount || 0}</span> Following</div>
                        </div>

                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {user.examCategory && (
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                                    {user.examCategory} {user.targetYear}
                                </span>
                            )}
                            {user.subjects?.map(subject => (
                                <span key={subject} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-semibold border border-slate-200">{subject}</span>
                            ))}
                        </div>

                        <div className="mt-6 flex w-full gap-2">
                            <button
                                onClick={() => navigate('/profile-setup')}
                                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </button>
                            <button className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                                <Mail className="w-4 h-4" />
                                Message
                            </button>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-100">
                            <h2 className="font-bold text-slate-800">Study Stats</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <span className="text-xl">🔥</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Current Streak</p>
                                        <p className="text-lg font-bold text-slate-900">{(user as any).currentStreak || 0} Days</p>
                                    </div>
                                </div>
                                {(user as any).currentStreak > 0 && <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">Active</span>}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <span className="text-xl">📚</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Total Studied</p>
                                        <p className="text-lg font-bold text-slate-900">{(user as any).totalStudyHours || 0} Hours</p>
                                    </div>
                                </div>
                            </div>
                            {(user as any).contributorBadge && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                            <span className="text-xl">🏆</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">Badge</p>
                                            <p className="text-lg font-bold text-slate-900">{(user as any).contributorBadge}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Right Column: Content Grid */}
                <section className="flex-1">
                    <div className="bg-white border border-slate-200 rounded-xl min-h-[600px] flex flex-col overflow-hidden shadow-sm">
                        {/* Tab Headers */}
                        <div className="px-6 border-b border-slate-200">
                            <div className="flex justify-center gap-12">
                                <button
                                    onClick={() => setActiveTab('posts')}
                                    className={`py-4 border-t-2 -mt-px text-xs font-bold tracking-widest flex items-center gap-2 transition-colors ${activeTab === 'posts' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'
                                        }`}
                                >
                                    <Grid className="w-[18px] h-[18px]" />
                                    POSTS
                                </button>
                                <button
                                    onClick={() => setActiveTab('saved')}
                                    className={`py-4 border-t-2 -mt-px text-xs font-bold tracking-widest flex items-center gap-2 transition-colors ${activeTab === 'saved' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'
                                        }`}
                                >
                                    <Bookmark className="w-[18px] h-[18px]" />
                                    SAVED
                                </button>
                                <button
                                    onClick={() => setActiveTab('tagged')}
                                    className={`py-4 border-t-2 -mt-px text-xs font-bold tracking-widest flex items-center gap-2 transition-colors ${activeTab === 'tagged' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'
                                        }`}
                                >
                                    <UserSquare className="w-[18px] h-[18px]" />
                                    TAGGED
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col">
                            {content.length > 0 ? (
                                <div className={activeTab === 'posts' || activeTab === 'saved' ? "divide-y divide-slate-100" : "p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"}>
                                    {content.map((post) => (
                                        (activeTab === 'posts' || activeTab === 'saved') ? (
                                            <FeedPost key={post._id} post={post as any} />
                                        ) : (
                                            <PostCard key={post._id} post={post} onClick={() => console.log('Open Post', post._id)} />
                                        )
                                    ))}
                                </div>
                            ) : (
                                !loadingContent && (
                                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 p-6">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                            {activeTab === 'posts' && <Grid className="w-8 h-8 opacity-50" />}
                                            {activeTab === 'saved' && <Bookmark className="w-8 h-8 opacity-50" />}
                                            {activeTab === 'tagged' && <UserSquare className="w-8 h-8 opacity-50" />}
                                        </div>
                                        <p className="font-medium">No results for {activeTab}</p>
                                    </div>
                                )
                            )}

                            {/* Loading State / Load More */}
                            {loadingContent && (
                                <div className="py-8 flex justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                                </div>
                            )}

                            {!loadingContent && hasMore && content.length > 0 && (
                                <div className="py-6 flex justify-center">
                                    <button
                                        onClick={() => fetchContent(false)}
                                        className="px-6 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                                    >
                                        Load More
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="mt-10 border-t border-slate-200 py-10 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
                <div className="flex items-center gap-2 mb-4 md:mb-0">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-bold text-slate-600">StudyMate</span>
                    <span>© 2024 All Rights Reserved</span>
                </div>
                <div className="flex gap-8">
                    <a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-blue-500 transition-colors">Help Center</a>
                    <a href="#" className="hover:text-blue-500 transition-colors">Community Guidelines</a>
                </div>
            </footer>
        </div>
    );
}
