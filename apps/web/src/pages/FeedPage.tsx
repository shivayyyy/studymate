import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
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
        <div className="p-0 sm:p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 sm:bg-transparent">
            <div className="flex gap-8 items-start px-0 sm:px-4">
                {/* Main Feed */}
                <div className="flex-1 min-w-0 max-w-2xl mx-auto w-full">
                    {/* Search Bar - More mobile friendly */}
                    <div className="relative mb-4 sm:mb-6 px-4 py-3 sm:p-0">
                        <Search className="absolute left-8 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search courses, notes..."
                            className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-white sm:bg-white border border-slate-200 sm:border-slate-100 rounded-xl text-sm sm:text-base text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                        />
                    </div>

                    {/* Create Post Component - Hide on very small screens if needed or keep it compact */}
                    <div className="sm:block mb-4 sm:mb-0">
                        <CreatePost onPostCreated={handlePostCreated} />
                    </div>

                    {/* Tabs - Sticky & Compact */}
                    <div className="flex border-b border-slate-100 mb-2 sm:mb-6 bg-white sticky top-[57px] lg:top-0 z-20 opacity-95 backdrop-blur">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 sm:py-4 text-xs sm:text-sm font-bold text-center transition-colors relative ${activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 sm:w-12 h-0.5 sm:h-1 bg-blue-600 rounded-t-full"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Posts - Removed space-y on mobile for full bleed feel */}
                    <div className="space-y-2 sm:space-y-4">
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
                <div className="hidden xl:block w-80 space-y-6 pt-6">
                    <RightSidebar />
                </div>
            </div>

            {/* FAB Mobile - Enhanced */}
            <button
                onClick={() => {
                    const el = document.querySelector('textarea');
                    el?.focus();
                    el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="fixed bottom-20 right-6 lg:hidden w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-600/40 z-40 active:scale-90 transition-transform"
            >
                <Plus size={28} strokeWidth={2.5} />
            </button>
        </div>
    );
}
