import { Heart, MessageCircle, Repeat2, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Post } from '../types';
import React, { useState } from 'react';
import ImageModal from './ui/ImageModal';

interface FeedPostProps {
    post: Post;
    onLike?: () => void;
    onComment?: () => void;
    onShare?: () => void;
    onSave?: () => void;
}

const FeedPost: React.FC<FeedPostProps> = ({ post, onLike, onComment, onShare, onSave }) => {
    // Prefer denormalized author details, fallback to populated user object
    const authorName = post.authorName || (typeof post.userId === 'object' ? (post.userId as any).fullName : 'Unknown User');
    const authorUsername = post.authorUsername || (typeof post.userId === 'object' ? (post.userId as any).username : 'unknown');
    const authorPic = post.authorProfilePicture || (typeof post.userId === 'object' ? (post.userId as any).profilePicture : undefined);

    const [isLiked, setIsLiked] = React.useState(post.isLiked || false);
    const [likesCount, setLikesCount] = React.useState(post.likesCount || 0);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Sync state with props when they change (e.g. after optimistic update in parent)
    React.useEffect(() => {
        setIsLiked(post.isLiked || false);
        setLikesCount(post.likesCount || 0);
    }, [post.isLiked, post.likesCount]);

    // Format Date (Simple "2h ago" or date)
    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d`;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <>
            <article className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors p-4 cursor-pointer">
                <div className="flex gap-3">
                    {/* Avatar Column */}
                    <div className="shrink-0">
                        <img
                            src={authorPic || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`}
                            alt={authorUsername}
                            className="w-10 h-10 rounded-full object-cover hover:opacity-90"
                        />
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[15px] leading-tight">
                                <span className="font-bold text-slate-900 hover:underline">{authorName}</span>
                                <span className="text-slate-500 font-normal">@{authorUsername}</span>
                                <span className="text-slate-500 font-normal">·</span>
                                <span className="text-slate-500 font-normal hover:underline">{timeAgo(post.createdAt)}</span>
                            </div>
                            <button className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full p-2 -mr-2 transition-colors">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>

                        {/* Post Text */}
                        <div className="mt-1 mb-2">
                            {post.description && (
                                <p className="text-[15px] text-slate-900 whitespace-pre-wrap leading-normal">
                                    {post.description}
                                </p>
                            )}
                            {/* Tags */}
                            <div className="mt-2 text-blue-500 text-[15px] space-x-2">
                                {post.tags?.map(tag => (
                                    <span key={tag} className="hover:underline cursor-pointer">#{tag}</span>
                                ))}
                            </div>
                        </div>

                        {/* Media / Attachment */}
                        {(post.fileUrls && post.fileUrls.length > 0) ? (
                            <div className={`mt-3 grid gap-1 rounded-2xl overflow-hidden border border-slate-200 ${post.fileUrls.length === 1 ? 'grid-cols-1 aspect-video' :
                                post.fileUrls.length === 2 ? 'grid-cols-2 aspect-video' :
                                    'grid-cols-2 aspect-square'
                                }`}>
                                {post.fileUrls.slice(0, 4).map((url, index) => (
                                    <div key={index} className="relative w-full h-full bg-slate-100 group">
                                        <img
                                            src={url}
                                            alt={`Attachment ${index + 1}`}
                                            className="w-full h-full object-cover cursor-zoom-in"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedImage(url);
                                            }}
                                        />
                                        {index === 3 && post.fileUrls && post.fileUrls.length > 4 && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                                                +{post.fileUrls.length - 4}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : post.thumbnailUrl ? (
                            <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 aspect-video relative group">
                                <img
                                    src={post.thumbnailUrl}
                                    alt="Attachment"
                                    className="w-full h-full object-cover cursor-zoom-in"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage(post.thumbnailUrl || '');
                                    }}
                                />
                            </div>
                        ) : null}

                        {/* Subject/Category Badge if no media, or just always show? Let's show neat info if no media */}
                        {!post.thumbnailUrl && (!post.fileUrls || post.fileUrls.length === 0) && (
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full uppercase tracking-wider">{post.examCategory} • {post.subject}</span>
                            </div>
                        )}


                        {/* Action Bar */}
                        <div className="flex justify-between mt-3 max-w-md">
                            <button
                                onClick={(e) => { e.stopPropagation(); onComment?.(); }}
                                className="group flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors"
                            >
                                <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                                    <MessageCircle size={18} />
                                </div>
                                <span className="text-xs group-hover:text-blue-500">{post.commentsCount || 0}</span>
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); onShare?.(); }}
                                className="group flex items-center gap-2 text-slate-500 hover:text-green-500 transition-colors"
                            >
                                <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                                    <Repeat2 size={18} />
                                </div>
                                <span className="text-xs group-hover:text-green-500">{post.sharesCount || 0}</span>
                            </button>


                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsLiked(!isLiked);
                                    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
                                    onLike?.();
                                }}
                                className={`group flex items-center gap-2 transition-colors ${isLiked ? 'text-red-600' : 'text-slate-500 hover:text-red-500'}`}
                            >
                                <div className={`p-2 rounded-full transition-all duration-300 ${isLiked ? 'bg-red-50' : 'group-hover:bg-red-50'}`}>
                                    <motion.div
                                        animate={isLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Heart
                                            size={18}
                                            className={`transition-all duration-300 ${isLiked ? 'fill-red-500 text-red-600' : ''}`}
                                        />
                                    </motion.div>
                                </div>
                                <span className={`text-xs ${isLiked ? 'font-bold text-red-600' : 'group-hover:text-red-500'}`}>{likesCount || 0}</span>
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); onSave?.(); }}
                                className="group flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors"
                            >
                                <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                                    <Bookmark size={18} />
                                </div>
                                <span className="text-xs group-hover:text-blue-500">{post.savesCount || 0}</span>
                            </button>

                            <button className="group flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors">
                                <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                                    <Share size={18} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </article>

            <ImageModal
                isOpen={!!selectedImage}
                src={selectedImage || ''}
                onClose={() => setSelectedImage(null)}
            />
        </>
    );
};

export default FeedPost;
