import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, FileText, File, BarChart2, FolderOutput, Lightbulb } from 'lucide-react';
import ImageModal from './ui/ImageModal';

interface PostUser {
    _id: string;
    username: string;
    fullName: string;
    profilePicture?: string;
}

export interface Post {
    _id: string;
    userId: PostUser | string; // Populated or ID
    title: string;
    contentType: 'NOTES' | 'MNEMONICS' | 'PYQ' | 'CHEAT_SHEET' | 'MIND_MAP' | 'MISTAKE_LOG';
    thumbnailUrl?: string;
    examCategory: string;
    subject: string;
    likesCount: number;
    commentsCount: number;
    savesCount: number;
    createdAt: string;
}

interface PostCardProps {
    post: Post;
    onClick?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const getIcon = () => {
        switch (post.contentType) {
            case 'NOTES': return <FileText className="w-8 h-8 text-slate-400" />;
            case 'MIND_MAP': return <Share2 className="w-8 h-8 text-blue-400" />;
            case 'PYQ': return <File className="w-8 h-8 text-red-400" />;
            case 'CHEAT_SHEET': return <FolderOutput className="w-8 h-8 text-purple-400" />;
            case 'MISTAKE_LOG': return <BarChart2 className="w-8 h-8 text-green-400" />;
            case 'MNEMONICS': return <Lightbulb className="w-8 h-8 text-amber-400" />;
            default: return <FileText className="w-8 h-8 text-slate-400" />;
        }
    };

    const getBgColor = () => {
        switch (post.contentType) {
            case 'NOTES': return 'bg-slate-50';
            case 'MIND_MAP': return 'bg-blue-50';
            case 'PYQ': return 'bg-red-50';
            case 'CHEAT_SHEET': return 'bg-purple-50';
            case 'MISTAKE_LOG': return 'bg-green-50';
            case 'MNEMONICS': return 'bg-amber-50';
            default: return 'bg-slate-50';
        }
    };

    return (
        <>
            <div
                onClick={onClick}
                className="group relative flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer"
            >
                {/* Thumbnail / Preview Area */}
                <div className={`aspect-video w-full ${getBgColor()} flex items-center justify-center relative overflow-hidden`}>
                    {post.thumbnailUrl ? (
                        <img
                            src={post.thumbnailUrl}
                            alt="Post Thumbnail"
                            className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(post.thumbnailUrl || '');
                            }}
                        />
                    ) : (
                        getIcon()
                    )}

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                        <div className="flex items-center gap-1.5">
                            <Heart className="w-5 h-5 fill-white" />
                            <span>{post.likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MessageCircle className="w-5 h-5 fill-white" />
                            <span>{post.commentsCount}</span>
                        </div>
                    </div>

                    {/* Content Type Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded uppercase tracking-wider">
                        {post.contentType.replace('_', ' ')}
                    </div>
                </div>

                {/* Content Details */}
                <div className="p-3 flex flex-col gap-1">
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {post.subject}
                        </span>
                        <span className="text-[10px] text-slate-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
            <ImageModal
                isOpen={!!selectedImage}
                src={selectedImage || ''}
                onClose={() => setSelectedImage(null)}
            />
        </>
    );
};

export default PostCard;
