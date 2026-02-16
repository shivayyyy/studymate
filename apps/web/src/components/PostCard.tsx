import { MoreHorizontal, Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Post {
    id: string;
    author: {
        name: string;
        avatar: string;
        role: string;
        badge?: 'Gold' | 'Silver' | 'Bronze';
    };
    timeAgo: string;
    title: string;
    content?: string; // For text/short posts
    image?: string;
    tags: string[];
    stats: {
        likes: number;
        comments: number;
    };
    type: 'Note' | 'Flowchart' | 'Video' | 'Question';
}

export default function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border-b border-slate-100 p-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
        >
            <div className="flex gap-4">
                {/* Left: Avatar */}
                <div className="flex-shrink-0">
                    <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover hover:opacity-90 transition-opacity" />
                </div>

                {/* Right: Content */}
                <div className="flex-1 min-w-0">
                    {/* Header: Name & Meta */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-[15px] hover:underline">{post.author.name}</span>
                        {post.author.badge && <span className="text-blue-500 text-[10px]">●</span>}
                        <span className="text-slate-500 text-[15px]">@{post.author.name.replace(/\s+/g, '').toLowerCase()}</span>
                        <span className="text-slate-500 text-[15px]">·</span>
                        <span className="text-slate-500 text-[15px] hover:underline">{post.timeAgo}</span>
                        <button className="ml-auto text-slate-400 hover:text-blue-500 p-1 rounded-full hover:bg-blue-50 transition-colors">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>

                    {/* Post Text */}
                    <div className="text-slate-900 text-[15px] leading-normal mb-3 whitespace-pre-wrap">
                        {post.content}
                    </div>

                    {/* Badges/Types */}
                    {(post.type === 'Video' || post.type === 'Flowchart') && (
                        <div className="mb-3">
                            {post.type === 'Video' && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded textxs font-bold mr-2">Video Lesson</span>}
                            {post.type === 'Flowchart' && <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs font-bold">Cheat Sheet</span>}
                        </div>
                    )}

                    {/* Media */}
                    {post.image && (
                        <div className="rounded-2xl overflow-hidden border border-slate-200 mb-3 relative group">
                            <img src={post.image} alt={post.title} className="w-full h-auto object-cover max-h-[500px]" />
                        </div>
                    )}

                    {/* Action Bar - Twitter Style */}
                    <div className="flex items-center justify-between max-w-md text-slate-500 pt-1">
                        <button className="flex items-center gap-2 group hover:text-blue-500 transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                                <MessageSquare size={18} />
                            </div>
                            <span className="text-sm">{post.stats.comments}</span>
                        </button>

                        <button className="flex items-center gap-2 group hover:text-green-500 transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                                <Share2 size={18} className="rotate-90" /> {/* Simulating Retweet */}
                            </div>
                            <span className="text-sm">12</span>
                        </button>

                        <button className="flex items-center gap-2 group hover:text-pink-600 transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors">
                                <Heart size={18} className="group-hover:stroke-pink-600" />
                            </div>
                            <span className="text-sm">{post.stats.likes}</span>
                        </button>

                        <button className="flex items-center gap-2 group hover:text-blue-500 transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                                <Bookmark size={18} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
