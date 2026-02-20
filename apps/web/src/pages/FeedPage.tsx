import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import FeedPost from '../components/FeedPost';
import RightSidebar from '../components/RightSidebar';
import CreatePost from '../components/CreatePost';
import { FeedService } from '../services/feed.service';
import { Post } from '../types';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useUserStore } from '../stores/useUserStore';

const tabs = ['Trending', 'Latest']; // Map to API types

export default function FeedPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Trending');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [cursor, setCursor] = useState<number | undefined>(undefined);
    const [hasMore, setHasMore] = useState(true);
    const { user } = useUserStore();

    // Infinite Scroll
    const { targetRef, isIntersecting } = useIntersectionObserver({
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
    });

    const fetchPosts = useCallback(async (reset = false) => {
        if (loading || (!hasMore && !reset)) return;
        setLoading(true);

        try {
            const type = activeTab.toLowerCase() as 'trending' | 'latest';
            const examCategory = user?.examCategory || 'JEE';

            const res = await FeedService.getFeed({
                type,
                examCategory: examCategory,
                cursor: reset ? undefined : cursor,
                limit: 10
            });

            if (res.success) {
                setPosts(prev => reset ? res.data : [...prev, ...res.data]);
                setCursor(res.meta?.nextCursor);
                setHasMore(!!res.meta?.nextCursor);
            }
        } catch (error) {
            console.error('Failed to fetch feed:', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, cursor, loading, hasMore, user]);

    // Initial load & Tab change
    useEffect(() => {
        setPosts([]);
        setCursor(undefined);
        setHasMore(true);
        fetchPosts(true);
    }, [activeTab]);

    // Infinite Scroll Trigger
    useEffect(() => {
        if (isIntersecting && hasMore && !loading) {
            fetchPosts();
        }
    }, [isIntersecting, hasMore, loading, fetchPosts]);

    const handlePostCreated = (newPost: Post) => {
        setPosts(prev => [newPost, ...prev]);
    };

    const handleLike = async (postId: string) => {
        // Optimistic update
        setPosts(prev => prev.map(p => {
            if (p._id === postId) {
                return {
                    ...p,
                    likesCount: p.likesCount + (p.isLiked ? -1 : 1),
                    isLiked: !p.isLiked
                };
            }
            return p;
        }));

        try {
            const post = posts.find(p => p._id === postId);
            if (post?.isLiked) {
                await FeedService.unlikePost(postId);
            } else {
                await FeedService.likePost(postId);
            }
        } catch (error) {
            console.error('Like failed', error);
            // Revert
            setPosts(prev => prev.map(p => {
                if (p._id === postId) {
                    return {
                        ...p,
                        likesCount: p.likesCount + (p.isLiked ? -1 : 1),
                        isLiked: !p.isLiked
                    };
                }
                return p;
            }));
        }
    };

    const handleSave = async (postId: string) => {
        // Optimistic update
        setPosts(prev => prev.map(p => {
            if (p._id === postId) {
                return {
                    ...p,
                    savesCount: p.savesCount + (p.isSaved ? -1 : 1),
                    isSaved: !p.isSaved
                };
            }
            return p;
        }));

        try {
            const post = posts.find(p => p._id === postId);
            if (post?.isSaved) {
                await FeedService.unsavePost(postId);
            } else {
                await FeedService.savePost(postId);
            }
        } catch (error) {
            console.error('Save failed', error);
            // Revert
            setPosts(prev => prev.map(p => {
                if (p._id === postId) {
                    return {
                        ...p,
                        savesCount: p.savesCount + (p.isSaved ? -1 : 1),
                        isSaved: !p.isSaved
                    };
                }
                return p;
            }));
        }
    };

    const handleShare = (postId: string) => {
        // Copy link to clipboard
        const url = `${window.location.origin}/post/${postId}`;
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex gap-8 items-start">
                {/* Main Feed */}
                <div className="flex-1 min-w-0 max-w-2xl mx-auto">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search for courses, notes, or topics..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                        />
                    </div>

                    {/* Create Post Component */}
                    <CreatePost onPostCreated={handlePostCreated} />

                    {/* Tabs */}
                    <div className="flex border-b border-slate-100 mb-6 bg-white sticky top-0 z-10 opacity-95 backdrop-blur rounded-t-xl">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 text-sm font-bold text-center transition-colors relative ${activeTab === tab ? 'text-slate-900' : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Posts */}
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <FeedPost
                                key={post._id}
                                post={post}
                                onLike={() => handleLike(post._id)}
                                onComment={() => navigate(`/post/${post._id}`)}
                                onSave={() => handleSave(post._id)}
                                onShare={() => handleShare(post._id)}
                            />
                        ))}

                        {/* Loading Indicator */}
                        {loading && (
                            <div className="p-4 text-center text-slate-500">
                                Loading...
                            </div>
                        )}

                        {/* Intersection Target */}
                        <div ref={targetRef} className="h-4" />

                        {!loading && !hasMore && posts.length > 0 && (
                            <div className="p-4 text-center text-slate-400 text-sm">
                                No more posts
                            </div>
                        )}
                        {!loading && posts.length === 0 && (
                            <div className="p-8 text-center text-slate-500">
                                No posts to show in {activeTab}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar Column */}
                <div className="hidden xl:block w-80 space-y-6">
                    <div className="flex items-center justify-end gap-4 mb-2">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell size={24} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <h4 className="font-bold text-sm text-slate-900">{user?.fullName || 'Guest'}</h4>
                                <p className="text-xs text-slate-500">{user?.username ? `@${user.username}` : ''}</p>
                            </div>
                            <img src={user?.profilePicture || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} alt="Profile" className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
                        </div>
                    </div>
                    <RightSidebar />
                </div>
            </div>

            {/* FAB Mobile */}
            <button className="fixed bottom-24 right-6 lg:hidden w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 z-50">
                <span className="text-2xl font-bold">+</span>
            </button>
        </div>
    );
}
